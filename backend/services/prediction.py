from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib

from ..utils.preprocessing import (
    InputValidationError,
    TARGETS,
    TARGET_KEYS,
    feature_ranges,
    preprocess_input,
    resolve_target,
    sweep_feature,
)


class ModelLoadError(RuntimeError):
    """Raised when the trained model artifact cannot be loaded."""


class PredictionService:
    def __init__(self, model_path: str | Path, dataset_path: str | Path | None = None):
        self.model_path = Path(model_path)
        self.dataset_path = Path(dataset_path) if dataset_path else None
        self.models = self._load_model()

    def _load_model(self) -> Any:
        if not self.model_path.exists():
            raise ModelLoadError(
                f"Model file not found at {self.model_path}. Run `python -m backend.train_model` first."
            )

        try:
            return joblib.load(self.model_path)
        except Exception as exc:
            raise ModelLoadError(f"Failed to load model from {self.model_path}: {exc}") from exc

    def has_all_targets(self) -> bool:
        """True only if the loaded artifact is the expected per-target model dict."""
        return isinstance(self.models, dict) and all(key in self.models for key in TARGET_KEYS)

    def _model_for(self, target_key: str) -> Any:
        if not isinstance(self.models, dict) or target_key not in self.models:
            raise ModelLoadError(f"Model for target '{target_key}' is not available.")
        return self.models[target_key]

    def predict(self, payload: dict[str, Any]) -> dict[str, Any]:
        # ML flow: validate JSON, build the training-shaped DataFrame, then call sklearn
        # once per mechanical property.
        features = preprocess_input(payload)

        predictions = []
        for target in TARGETS:
            model = self._model_for(target["key"])
            value = float(model.predict(features)[0])
            predictions.append(
                {
                    "key": target["key"],
                    "label": target["label"],
                    "prediction": round(value, 4),
                    "unit": target["unit"],
                }
            )

        return {"predictions": predictions}

    def sensitivity(
        self,
        payload: dict[str, Any],
        feature: str,
        target: str | None = None,
        points: int = 25,
    ) -> dict[str, Any]:
        """Real dependence/sensitivity curve for one property.

        Holds every feature at the user's values and sweeps a single feature across
        the range seen in the training data, returning the model's actual predicted
        property at each step (an Individual Conditional Expectation / ICE curve).
        """
        target_spec = resolve_target(target)
        model = self._model_for(target_spec["key"])
        base_row = preprocess_input(payload)

        if self.dataset_path is None:
            raise ModelLoadError("Dataset path is required for sensitivity analysis.")

        ranges = feature_ranges(str(self.dataset_path))
        if feature not in ranges:
            raise InputValidationError(f"Unknown feature '{feature}'.")

        low, high = ranges[feature]
        current = float(base_row.iloc[0][feature])
        # Make sure the user's current value is inside the swept window.
        low = min(low, current)
        high = max(high, current)
        if high <= low:
            high = low + 1.0

        swept = sweep_feature(base_row, feature, low, high, points)
        predictions = model.predict(swept)

        return {
            "feature": feature,
            "target": target_spec["key"],
            "label": target_spec["label"],
            "unit": target_spec["unit"],
            "current_value": round(current, 6),
            "points": [
                {
                    "feature_value": round(float(value), 6),
                    "prediction": round(float(pred), 4),
                }
                for value, pred in zip(swept[feature].tolist(), predictions)
            ],
        }

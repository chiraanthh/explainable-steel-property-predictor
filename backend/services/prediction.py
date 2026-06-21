from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib

from ..utils.preprocessing import (
    InputValidationError,
    TARGET_UNIT,
    feature_ranges,
    preprocess_input,
    sweep_feature,
)


class ModelLoadError(RuntimeError):
    """Raised when the trained model artifact cannot be loaded."""


class PredictionService:
    def __init__(self, model_path: str | Path, dataset_path: str | Path | None = None):
        self.model_path = Path(model_path)
        self.dataset_path = Path(dataset_path) if dataset_path else None
        self.model = self._load_model()

    def _load_model(self) -> Any:
        if not self.model_path.exists():
            raise ModelLoadError(
                f"Model file not found at {self.model_path}. Run `python -m backend.train_model` first."
            )

        try:
            return joblib.load(self.model_path)
        except Exception as exc:
            raise ModelLoadError(f"Failed to load model from {self.model_path}: {exc}") from exc

    def predict(self, payload: dict[str, Any]) -> dict[str, float | str]:
        # ML flow: validate JSON, build the training-shaped DataFrame, then call sklearn.
        features = preprocess_input(payload)
        prediction = self.model.predict(features)[0]

        return {
            "prediction": round(float(prediction), 4),
            "unit": TARGET_UNIT,
        }

    def sensitivity(self, payload: dict[str, Any], feature: str, points: int = 25) -> dict[str, Any]:
        """Real dependence/sensitivity curve.

        Holds every feature at the user's values and sweeps a single feature across
        the range seen in the training data, returning the model's actual predicted
        yield strength at each step. This is a genuine Individual Conditional
        Expectation (ICE) curve, not a synthetic approximation.
        """
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
        predictions = self.model.predict(swept)

        return {
            "feature": feature,
            "unit": TARGET_UNIT,
            "current_value": round(current, 6),
            "points": [
                {
                    "feature_value": round(float(value), 6),
                    "prediction": round(float(pred), 4),
                }
                for value, pred in zip(swept[feature].tolist(), predictions)
            ],
        }

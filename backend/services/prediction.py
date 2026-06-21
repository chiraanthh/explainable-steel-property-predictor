from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib

from ..utils.preprocessing import TARGET_UNIT, preprocess_input


class ModelLoadError(RuntimeError):
    """Raised when the trained model artifact cannot be loaded."""


class PredictionService:
    def __init__(self, model_path: str | Path):
        self.model_path = Path(model_path)
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

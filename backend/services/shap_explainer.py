from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd
import shap

from ..utils.preprocessing import preprocess_input


class ShapExplainerService:
    def __init__(self, model: Any):
        self.model = model
        self.explainer = self._build_explainer()

    def _build_explainer(self) -> shap.Explainer:
        try:
            return shap.TreeExplainer(self.model)
        except Exception:
            # SHAP is model-agnostic in concept, but tree models get the fastest and most
            # exact explainer. If a future sklearn model is not tree-based, SHAP's generic
            # Explainer still provides local feature attributions.
            return shap.Explainer(self.model.predict)

    def explain(self, payload: dict[str, Any]) -> dict[str, Any]:
        features = preprocess_input(payload)
        prediction = round(float(self.model.predict(features)[0]), 4)

        # SHAP explains one prediction as: base value + feature contributions = output.
        # This is useful here because engineers can see which composition percentages
        # pushed the predicted strength higher or lower instead of receiving a black-box
        # number only.
        shap_values = self.explainer.shap_values(features)
        values = self._first_row_values(shap_values)
        base_value = self._base_value()

        return {
            "base_value": round(float(base_value), 4),
            "prediction": prediction,
            "features": self._feature_contributions(features, values),
        }

    def _first_row_values(self, shap_values: Any) -> np.ndarray:
        values = np.asarray(shap_values)

        if values.ndim == 3:
            values = values[0, :, 0]
        elif values.ndim == 2:
            values = values[0]
        elif values.ndim == 1:
            values = values

        return values.astype(float)

    def _base_value(self) -> float:
        expected_value = getattr(self.explainer, "expected_value", 0.0)
        values = np.asarray(expected_value)
        return float(values.flatten()[0])

    def _feature_contributions(self, features: pd.DataFrame, shap_values: np.ndarray) -> list[dict[str, Any]]:
        contributions = []
        for name, value in zip(features.columns, shap_values, strict=True):
            contributions.append(
                {
                    "name": name,
                    "shap_value": round(float(value), 4),
                    "contribution": "positive" if value >= 0 else "negative",
                }
            )

        return contributions

from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd
import shap

from ..utils.preprocessing import resolve_target, preprocess_input


class ShapExplainerService:
    def __init__(self, models: dict[str, Any]):
        # One trained model per mechanical property; explainers are built lazily and
        # cached the first time a property is explained.
        self.models = models
        self.explainers: dict[str, shap.Explainer] = {}

    def _explainer(self, target_key: str) -> shap.Explainer:
        if target_key not in self.explainers:
            model = self.models[target_key]
            try:
                self.explainers[target_key] = shap.TreeExplainer(model)
            except Exception:
                # Tree models get the fastest, most exact explainer; fall back to the
                # generic explainer for any non-tree model.
                self.explainers[target_key] = shap.Explainer(model.predict)
        return self.explainers[target_key]

    def explain(self, payload: dict[str, Any], target: str | None = None) -> dict[str, Any]:
        target_spec = resolve_target(target)
        target_key = target_spec["key"]
        model = self.models[target_key]
        explainer = self._explainer(target_key)

        features = preprocess_input(payload)
        prediction = round(float(model.predict(features)[0]), 4)

        # SHAP explains one prediction as: base value + feature contributions = output,
        # so engineers can see which composition percentages pushed the predicted
        # property higher or lower instead of receiving a black-box number only.
        shap_values = explainer.shap_values(features)
        values = self._first_row_values(shap_values)
        base_value = self._base_value(explainer)

        return {
            "target": target_key,
            "label": target_spec["label"],
            "unit": target_spec["unit"],
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

    def _base_value(self, explainer: shap.Explainer) -> float:
        expected_value = getattr(explainer, "expected_value", 0.0)
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

from __future__ import annotations

from functools import lru_cache
from typing import Any

import pandas as pd


FEATURE_COLUMNS = [
    "Fe",
    "c",
    "mn",
    "si",
    "cr",
    "ni",
    "mo",
    "v",
    "n",
    "nb",
    "co",
    "w",
    "al",
    "ti",
]

TARGET_COLUMN = "yield strength"
TARGET_UNIT = "MPa"

FEATURE_ALIASES = {
    "iron_percentage": "Fe",
    "fe_percentage": "Fe",
    "carbon_percentage": "c",
    "manganese_percentage": "mn",
    "silicon_percentage": "si",
    "chromium_percentage": "cr",
    "nickel_percentage": "ni",
    "molybdenum_percentage": "mo",
    "vanadium_percentage": "v",
    "nitrogen_percentage": "n",
    "niobium_percentage": "nb",
    "cobalt_percentage": "co",
    "tungsten_percentage": "w",
    "aluminium_percentage": "al",
    "aluminum_percentage": "al",
    "titanium_percentage": "ti",
}


class InputValidationError(ValueError):
    """Raised when user-provided material features cannot be used by the model."""


def normalize_feature_name(name: str) -> str:
    normalized = name.strip()
    return FEATURE_ALIASES.get(normalized, FEATURE_ALIASES.get(normalized.lower(), normalized))


def preprocess_input(payload: dict[str, Any]) -> pd.DataFrame:
    """Validate and convert API JSON into the tabular format expected by sklearn.

    The model is trained on the same composition columns used in the notebook. SHAP and
    sklearn both need stable column order, so this function always returns a single-row
    DataFrame with FEATURE_COLUMNS in the exact training order.
    """
    if not isinstance(payload, dict) or not payload:
        raise InputValidationError("Request body must contain material feature values.")

    normalized_payload: dict[str, Any] = {}
    for raw_name, value in payload.items():
        feature_name = normalize_feature_name(raw_name)
        if feature_name in FEATURE_COLUMNS:
            normalized_payload[feature_name] = value

    missing_features = [feature for feature in FEATURE_COLUMNS if feature not in normalized_payload]
    if missing_features:
        missing = ", ".join(missing_features)
        raise InputValidationError(f"Missing required material features: {missing}.")

    row: dict[str, float] = {}
    for feature in FEATURE_COLUMNS:
        value = normalized_payload[feature]
        try:
            numeric_value = float(value)
        except (TypeError, ValueError) as exc:
            raise InputValidationError(f"Feature '{feature}' must be numeric.") from exc

        if numeric_value < 0:
            raise InputValidationError(f"Feature '{feature}' cannot be negative.")

        row[feature] = numeric_value

    return pd.DataFrame([row], columns=FEATURE_COLUMNS)


@lru_cache(maxsize=4)
def feature_ranges(dataset_path: str) -> dict[str, tuple[float, float]]:
    """Return the observed (min, max) for every feature in the training dataset.

    These bounds drive the sensitivity/dependence sweep so the chart only explores
    physically realistic composition values the model was actually trained on.
    """
    df = pd.read_csv(dataset_path)
    ranges: dict[str, tuple[float, float]] = {}
    for column in FEATURE_COLUMNS:
        if column in df.columns:
            ranges[column] = (float(df[column].min()), float(df[column].max()))
    return ranges


def sweep_feature(
    base_row: pd.DataFrame,
    feature: str,
    low: float,
    high: float,
    points: int,
) -> pd.DataFrame:
    """Build `points` rows identical to base_row but with `feature` swept low..high."""
    if feature not in FEATURE_COLUMNS:
        raise InputValidationError(f"Unknown feature '{feature}'.")
    if points < 2:
        points = 2

    step = (high - low) / (points - 1)
    rows = []
    for index in range(points):
        row = base_row.iloc[0].copy()
        row[feature] = max(0.0, low + step * index)
        rows.append(row)
    return pd.DataFrame(rows, columns=FEATURE_COLUMNS).reset_index(drop=True)


def preprocess_training_data(dataset_path: str) -> tuple[pd.DataFrame, pd.Series]:
    """Prepare the notebook dataset for model training without changing its intent.

    The original notebook drops the chemical formula text column, fills missing numeric
    values with column means, and predicts mechanical properties from composition. This
    backend trains only yield strength because the requested API response is a single
    MPa prediction.
    """
    df = pd.read_csv(dataset_path)
    df = df.drop(columns=["formula"], errors="ignore")
    df = df.fillna(df.mean(numeric_only=True))

    missing_columns = [column for column in [*FEATURE_COLUMNS, TARGET_COLUMN] if column not in df.columns]
    if missing_columns:
        missing = ", ".join(missing_columns)
        raise InputValidationError(f"Dataset is missing required columns: {missing}.")

    return df[FEATURE_COLUMNS], df[TARGET_COLUMN]

from __future__ import annotations

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
sys.path.insert(0, str(PROJECT_DIR))

import json

import joblib
import sklearn
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

from backend.utils.preprocessing import TARGET_COLUMN, preprocess_training_data


DATASET_PATH = PROJECT_DIR / "steel_strength.csv"
MODEL_PATH = BASE_DIR / "model" / "model.pkl"
META_PATH = BASE_DIR / "model" / "model.meta.json"


def model_sklearn_version() -> str | None:
    """Return the scikit-learn version the saved model was trained with, if known."""
    if not META_PATH.exists():
        return None
    try:
        return json.loads(META_PATH.read_text()).get("sklearn_version")
    except (ValueError, OSError):
        return None


def train_model_if_missing(force: bool = False) -> Path:
    if MODEL_PATH.exists() and not force:
        print(f"Model already exists: {MODEL_PATH}")
        return MODEL_PATH

    X, y = preprocess_training_data(str(DATASET_PATH))
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
    )

    # Mirrors the notebook's sklearn regression path, but keeps the backend artifact
    # compact and deterministic for API inference.
    model = RandomForestRegressor(
        n_estimators=300,
        random_state=42,
        min_samples_leaf=2,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print(f"Target: {TARGET_COLUMN}")
    print(f"R2: {r2_score(y_test, y_pred):.4f}")
    print(f"MAE: {mean_absolute_error(y_test, y_pred):.4f} MPa")

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    META_PATH.write_text(
        json.dumps(
            {
                "sklearn_version": sklearn.__version__,
                "r2": round(float(r2_score(y_test, y_pred)), 4),
                "mae": round(float(mean_absolute_error(y_test, y_pred)), 4),
            }
        )
    )
    print(f"Saved model: {MODEL_PATH}")
    return MODEL_PATH


if __name__ == "__main__":
    train_model_if_missing()

from __future__ import annotations

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
sys.path.insert(0, str(PROJECT_DIR))

import json
import os
import tempfile

import joblib
import sklearn
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

from backend.utils.preprocessing import TARGETS, TARGET_KEYS, preprocess_training_data


DATASET_PATH = PROJECT_DIR / "steel_strength.csv"


def _resolve_model_dir() -> Path:
    """Pick a writable directory for the model artifact.

    Prefers the bundled `backend/model` dir (where the committed model lives). On
    read-only deploy filesystems it falls back to a temp dir so the self-healing
    retrain can still write — the model just trains on first launch instead.
    """
    candidates = []
    if os.getenv("MODEL_DIR"):
        candidates.append(Path(os.environ["MODEL_DIR"]))
    candidates.append(BASE_DIR / "model")
    candidates.append(Path(tempfile.gettempdir()) / "steel_model")

    for directory in candidates:
        try:
            directory.mkdir(parents=True, exist_ok=True)
            probe = directory / ".write_test"
            probe.write_text("ok")
            probe.unlink()
            return directory
        except OSError:
            continue
    return BASE_DIR / "model"


MODEL_DIR = _resolve_model_dir()
MODEL_PATH = MODEL_DIR / "model.pkl"
META_PATH = MODEL_DIR / "model.meta.json"

# Bump when the on-disk model structure changes so old artifacts are retrained.
MODEL_FORMAT = "multi-target-v1"


def _read_meta() -> dict:
    if not META_PATH.exists():
        return {}
    try:
        return json.loads(META_PATH.read_text())
    except (ValueError, OSError):
        return {}


def model_sklearn_version() -> str | None:
    """Return the scikit-learn version the saved model was trained with, if known."""
    return _read_meta().get("sklearn_version")


def model_format() -> str | None:
    """Return the saved model's structural format tag, if known."""
    return _read_meta().get("format")


def model_metrics() -> dict:
    """Return per-target {r2, mae, samples} accuracy from the last training run."""
    return _read_meta().get("metrics", {})


def train_model_if_missing(force: bool = False) -> Path:
    if MODEL_PATH.exists() and not force:
        print(f"Model already exists: {MODEL_PATH}")
        return MODEL_PATH

    models: dict = {}
    metrics: dict = {}

    for target in TARGETS:
        X, y = preprocess_training_data(str(DATASET_PATH), target["column"])
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        model = RandomForestRegressor(
            n_estimators=300,
            random_state=42,
            min_samples_leaf=2,
            n_jobs=-1,
        )
        model.fit(X_train, y_train)

        y_pred = model.predict(X_test)
        r2 = round(float(r2_score(y_test, y_pred)), 4)
        mae = round(float(mean_absolute_error(y_test, y_pred)), 4)
        metrics[target["key"]] = {"r2": r2, "mae": mae, "samples": int(len(X))}
        print(f"Target: {target['label']:<16} R2: {r2:.4f}  MAE: {mae:.4f} {target['unit']}  (n={len(X)})")

        models[target["key"]] = model

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(models, MODEL_PATH)
    META_PATH.write_text(
        json.dumps(
            {
                "format": MODEL_FORMAT,
                "sklearn_version": sklearn.__version__,
                "targets": TARGET_KEYS,
                "metrics": metrics,
            }
        )
    )
    print(f"Saved model: {MODEL_PATH}")
    return MODEL_PATH


if __name__ == "__main__":
    train_model_if_missing()

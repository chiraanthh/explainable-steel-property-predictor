from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field

from .services.prediction import ModelLoadError, PredictionService
from .services.shap_explainer import ShapExplainerService
from .utils.preprocessing import (
    DEFAULT_TARGET,
    FEATURE_COLUMNS,
    InputValidationError,
    TARGETS,
)


BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
MODEL_PATH = BASE_DIR / "model" / "model.pkl"
DATASET_PATH = PROJECT_DIR / "steel_strength.csv"


class MaterialFeatures(BaseModel):
    model_config = ConfigDict(extra="allow")

    features: dict[str, Any] | None = Field(
        default=None,
        description="Optional wrapper for material features. Raw feature JSON is also accepted.",
    )

    def as_feature_payload(self) -> dict[str, Any]:
        data = self.model_dump(exclude_none=True)
        wrapped_features = data.pop("features", None)
        if wrapped_features is not None:
            data.update(wrapped_features)
        return data


class ExplainRequest(BaseModel):
    features: dict[str, Any] = Field(..., description="Material feature values.")
    target: str = Field(default=DEFAULT_TARGET, description="Property to explain.")


class DependenceRequest(BaseModel):
    features: dict[str, Any] = Field(..., description="Material feature values.")
    feature: str = Field(..., description="Feature to sweep for the sensitivity curve.")
    target: str = Field(default=DEFAULT_TARGET, description="Property to analyse.")
    points: int = Field(default=25, ge=2, le=200, description="Number of sweep points.")


prediction_service: PredictionService | None = None
shap_service: ShapExplainerService | None = None
startup_error: str | None = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    load_model_once()
    yield


def load_model_once() -> None:
    """Load the sklearn model once so each request only performs inference.

    Self-heals: if the model artifact is missing or was trained with a different
    scikit-learn version than the one installed (which would otherwise produce
    InconsistentVersionWarning / invalid predictions), it is retrained from the
    bundled dataset before serving. This keeps the app working out-of-the-box on a
    fresh machine without any manual training step.
    """
    global prediction_service, shap_service, startup_error

    try:
        import sklearn

        from .train_model import (
            MODEL_FORMAT,
            model_format,
            model_sklearn_version,
            train_model_if_missing,
        )

        train_model_if_missing()

        # Retrain when the saved artifact is stale: different sklearn version
        # (avoids InconsistentVersionWarning / invalid predictions) or an older
        # model structure (e.g. single-target -> multi-target).
        version_stale = model_sklearn_version() != sklearn.__version__
        format_stale = model_format() != MODEL_FORMAT
        if version_stale or format_stale:
            reason = "version mismatch" if version_stale else "outdated model format"
            print(f"Retraining model ({reason})...")
            train_model_if_missing(force=True)

        prediction_service = PredictionService(MODEL_PATH, DATASET_PATH)
        if not prediction_service.has_all_targets():
            train_model_if_missing(force=True)
            prediction_service = PredictionService(MODEL_PATH, DATASET_PATH)

        shap_service = ShapExplainerService(prediction_service.models)
        startup_error = None
    except Exception as exc:
        startup_error = str(exc)


app = FastAPI(
    title="Explainable AI-Based Mechanical Property Prediction API",
    description="Predicts material yield strength and explains predictions with SHAP.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok" if prediction_service and shap_service else "model_unavailable",
        "targets": [{"key": t["key"], "label": t["label"], "unit": t["unit"]} for t in TARGETS],
        "required_features": FEATURE_COLUMNS,
        "model_path": str(MODEL_PATH),
        "error": startup_error,
    }


@app.post("/predict")
def predict(request: MaterialFeatures) -> dict[str, Any]:
    service = _prediction_service()
    try:
        return service.predict(request.as_feature_payload())
    except InputValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc


@app.post("/explain")
def explain(request: ExplainRequest) -> dict[str, Any]:
    service = _shap_service()
    try:
        return service.explain(request.features, request.target)
    except InputValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"SHAP explanation failed: {exc}") from exc


@app.post("/dependence")
def dependence(request: DependenceRequest) -> dict[str, Any]:
    service = _prediction_service()
    try:
        return service.sensitivity(request.features, request.feature, request.target, request.points)
    except InputValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Sensitivity analysis failed: {exc}") from exc


def _prediction_service() -> PredictionService:
    if prediction_service is None:
        raise HTTPException(status_code=503, detail=startup_error or "Model is not loaded.")
    return prediction_service


def _shap_service() -> ShapExplainerService:
    if shap_service is None:
        raise HTTPException(status_code=503, detail=startup_error or "SHAP explainer is not loaded.")
    return shap_service

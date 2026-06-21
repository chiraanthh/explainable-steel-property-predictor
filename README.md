# Explainable AI-Based Yield Strength Prediction of Steel Alloys Using SHAP

## Overview
This repository contains a polished academic research prototype that bridges the gap between advanced Machine Learning and trustworthy material science. The system predicts the **Yield Strength of steel alloys** from their chemical composition, and importantly, explains those predictions using **SHAP (SHapley Additive exPlanations)**.

The model is trained on a curated **steel-alloy dataset** (`steel_strength.csv`) of 14 compositional elements — Iron (Fe) as the balance element, plus Carbon, Manganese, Silicon, Chromium, Nickel, Molybdenum, Vanadium, Nitrogen, Niobium, Cobalt, Tungsten, Aluminium and Titanium.

Traditional steel property testing is expensive, destructive, and time-consuming. While ML models offer rapid predictions, their "black-box" nature hinders trust. By utilizing SHAP, this prototype unpacks the exact marginal contribution of every alloying element, transforming an opaque model into a transparent, scientifically valid instrument.

## Key Features

1. **Prediction Dashboard**:
   - A clean, responsive **light-mode UI**.
   - Composition input form with auto-balancing Iron (Fe) so the alloy always totals 100%.
   - Real-time API integration with the FastAPI backend.

2. **SHAP Explanation Analytics**:
   - **Feature Importance**: Bar chart depicting the relative impact of each element.
   - **Waterfall Chart**: Individual explanation breakdown showing the base prediction, positive/negative element contributions, and the final predicted Yield Strength.
   - **Sensitivity Analysis**: A real Individual Conditional Expectation (ICE) curve — the backend holds every other element fixed and sweeps the selected element across the range seen in the steel dataset, returning the model's *actual* predicted strength at each value (no synthetic approximation).

3. **Material Comparison Feature**:
   - Side-by-side analysis of two steel-alloy profiles (Material A vs. Material B).
   - Instant calculation of Prediction Differences (Δ MPa) and the top SHAP value shifts driving that change.

4. **PDF Report Generation**:
   - 1-click generation of academic reports detailing input parameters, predicted strength, and the top SHAP explanations.

## Technology Stack
- **Frontend**: React (Vite), Tailwind CSS, Recharts, jsPDF, Lucide Icons.
- **Backend**: FastAPI, Scikit-Learn (RandomForestRegressor), SHAP, Pandas.

## Model
A `RandomForestRegressor` trained on `steel_strength.csv` (R² ≈ 0.82, MAE ≈ 79 MPa on a held-out split).

The backend is **self-healing**: on startup it trains the model if `model.pkl` is missing, and automatically retrains it if the saved model's scikit-learn version differs from the installed one (avoiding `InconsistentVersionWarning` / invalid predictions). Dependency versions are pinned in `requirements.txt` for reproducible installs.

## How to Run

### Quick start (Windows)
From the project root, run `start.bat`. It launches the backend on port **8080**, the frontend on **5173**, and opens the browser.

### Manual setup

**Backend** (run from the project **root**, not from `backend/`, because the app is a package):
```bash
python -m venv .venv
# Windows: .venv\Scripts\activate     |  macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.app:app --reload --port 8080
```
The API is available at `http://127.0.0.1:8080` (docs at `/docs`). The model is trained automatically on first launch.

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```
The web app is available at `http://localhost:5173`. The API base URL is configured in `frontend/.env` (`VITE_API_BASE_URL`, default `http://127.0.0.1:8080`).

### Smoke test
```bash
python -m backend.test_workflow
```

## Academic Contribution
By providing both accurate predictions and robust, game-theoretic explainability, this tool empowers materials scientists to discover complex nonlinear steel-alloying relationships without costly physical trials. It serves as a foundational prototype for integrating Explainable AI (XAI) into metallurgical engineering.

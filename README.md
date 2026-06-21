# Explainable AI-Based Mechanical Property Prediction of Materials Using SHAP

## Overview
This repository contains a polished academic research prototype that bridges the gap between advanced Machine Learning and trustworthy material science. The system is designed to predict the mechanical properties of materials (specifically Yield Strength) based on their chemical composition and processing parameters, and importantly, it explains those predictions using **SHAP (SHapley Additive exPlanations)**.

Traditional material property testing is expensive, destructive, and time-consuming. While ML models offer rapid predictions, their "black-box" nature hinders trust. By utilizing SHAP, this prototype unpacks the exact marginal contribution of every input feature (e.g., Carbon %, Chromium %, Temperature), transforming an opaque model into a transparent, scientifically valid instrument.

## Key Features

1. **Prediction Dashboard**:
   - A highly responsive, deep dark-mode UI with glassmorphism aesthetics.
   - Comprehensive input forms covering compositional alloys and processing parameters.
   - Real-time API integration with the FastAPI backend.

2. **SHAP Explanation Analytics**:
   - **Feature Importance**: Bar chart depicting the absolute impact of each feature globally.
   - **Waterfall Chart**: Individual explanation breakdown showing the base prediction, positive/negative feature contributions, and the final predicted Yield Strength.
   - **SHAP Dependence**: Dynamic line graph detailing how specific features impact the prediction across different values.

3. **Material Comparison Feature**:
   - Side-by-side analysis of two distinct material profiles (Material A vs. Material B).
   - Instant calculation of Prediction Differences (Δ MPa) and the top SHAP value shifts driving that change.

4. **PDF Report Generation**:
   - 1-click generation of academic reports detailing input parameters, predicted strength, and the top SHAP explanations for record-keeping and sharing.

## Technology Stack
- **Frontend**: React (Vite), Tailwind CSS, Recharts, jsPDF, Lucide Icons.
- **Backend**: FastAPI, Scikit-Learn, SHAP, Pandas.

## How to Run

### Backend Setup
1. Navigate to the `backend/` directory.
2. Install Python dependencies: `pip install -r ../requirements.txt` (or use a virtual environment).
3. Start the FastAPI server:
   ```bash
   uvicorn app:app --reload
   ```
   *The API will be available at `http://127.0.0.1:8000`.*

### Frontend Setup
1. Navigate to the `frontend/` directory.
2. Install Node modules:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The web application will be available at `http://localhost:5173` or `http://127.0.0.1:5173`.*

## Academic Contribution
By providing both accurate predictions and robust, game-theoretic explainability, this tool empowers materials scientists to discover complex nonlinear alloying relationships without costly physical trials. It serves as a foundational prototype for integrating Explainable AI (XAI) into metallurgical engineering.

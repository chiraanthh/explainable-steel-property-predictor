import { useMemo, useState } from "react";
import { AlertCircle, FileDown } from "lucide-react";
import { explainMaterial, predictMaterial } from "../api/materialApi";
import { compositionFields, initialFormState, modelPayloadFromForm, processingFields } from "../data/features";
import ExplanationDashboard from "../components/ExplanationDashboard";
import PredictionForm from "../components/PredictionForm";
import PredictionResult from "../components/PredictionResult";
import { jsPDF } from "jspdf";

function validate(values) {
  const errors = {};
  [...compositionFields, ...processingFields].forEach((field) => {
    const value = values[field.name];
    if (value === "" || value === null || value === undefined) {
      errors[field.name] = "Required";
      return;
    }

    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      errors[field.name] = "Enter a number";
      return;
    }

    if (numeric < 0) {
      errors[field.name] = "Must be non-negative";
    }
  });

  return errors;
}

export default function DashboardPage() {
  const [values, setValues] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(compositionFields[0].name);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const completion = useMemo(() => {
    const fields = [...compositionFields, ...processingFields];
    const filled = fields.filter((field) => values[field.name] !== "").length;
    return Math.round((filled / fields.length) * 100);
  }, [values]);

  function handleChange(name, value) {
    const isCompositionField = compositionFields.some(f => f.name === name) && name !== "Fe";
    
    setValues((current) => {
      let nextValues = { ...current, [name]: value };
      
      if (isCompositionField) {
        // Calculate total of all other alloying elements
        const totalOthers = compositionFields
          .filter(f => f.name !== "Fe" && f.name !== name)
          .reduce((sum, f) => sum + (Number(current[f.name]) || 0), 0) + (Number(value) || 0);
        
        if (totalOthers > 100) {
          // If total exceeds 100, cap the current field
          const cappedValue = 100 - (totalOthers - (Number(value) || 0));
          nextValues[name] = String(Math.max(0, cappedValue.toFixed(2)));
          nextValues.Fe = "0.00";
        } else {
          nextValues.Fe = String((100 - totalOthers).toFixed(2));
        }
      }
      
      return nextValues;
    });
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setApiError("");

    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    try {
      const payload = modelPayloadFromForm(values);
      const [predictionResponse, explanationResponse] = await Promise.all([
        predictMaterial(payload),
        explainMaterial(payload),
      ]);
      setPrediction(predictionResponse);
      setExplanation(explanationResponse);
    } catch (error) {
      setApiError(error.message);
      setPrediction(null);
      setExplanation(null);
    } finally {
      setIsLoading(false);
    }
  }

  function handleDownloadReport() {
    if (!prediction || !explanation) return;
    
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Material Property Prediction Report", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Predicted Yield Strength: ${Number(prediction.prediction).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${prediction.unit}`, 20, 35);
    
    doc.text("Input Parameters:", 20, 50);
    let y = 60;
    const allFields = [...compositionFields, ...processingFields];
    allFields.forEach((field) => {
      const val = field.name === 'Fe' ? values.Fe : values[field.name];
      doc.text(`${field.label}: ${val} ${field.symbol || field.unit || ''}`, 30, y);
      y += 8;
      if (y > 280) { doc.addPage(); y = 20; }
    });
    
    y += 10;
    if (y > 270) { doc.addPage(); y = 20; }
    
    doc.setFontSize(14);
    doc.text("Top SHAP Feature Importances:", 20, y);
    doc.setFontSize(12);
    y += 10;
    
    const sortedFeatures = [...explanation.features].sort((a,b) => Math.abs(b.shap_value) - Math.abs(a.shap_value)).slice(0, 5);
    sortedFeatures.forEach(f => {
      const effect = f.contribution === "positive" ? "Increases" : "Decreases";
      doc.text(`- ${f.name}: ${Math.abs(f.shap_value).toFixed(2)} (${effect} prediction)`, 30, y);
      y += 8;
    });

    doc.save("Material_Prediction_Report.pdf");
  }

  return (
    <main className="min-h-[calc(100vh-65px)] bg-background relative overflow-hidden">
      <div className="absolute top-[20%] left-0 w-[400px] h-[400px] bg-primary-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-5 py-8 relative z-10 animate-fade-in">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-400">Prediction Dashboard</p>
            <h1 className="mt-1 text-4xl font-bold text-white tracking-tight">Explainable Material Property Predictor</h1>
          </div>
          <div className="flex flex-col gap-3">
            {prediction && (
              <button onClick={handleDownloadReport} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/5 border border-primary-500/30 px-4 py-2 text-sm font-bold text-primary-400 hover:bg-primary-500/10 transition-colors">
                <FileDown size={16} />
                Download PDF Report
              </button>
            )}
            <div className="w-full rounded-xl border border-slate-800 bg-[#12121a]/80 p-4 shadow-panel backdrop-blur-md md:w-64">
              <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-400">
                <span>Input completion</span>
                <span className="text-primary-400">{completion}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#0a0a0f] border border-slate-800">
                <div className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500 shadow-glow" style={{ width: `${completion}%` }} />
              </div>
            </div>
          </div>
        </div>

        {apiError ? (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive-500/50 bg-destructive-500/10 px-4 py-3 text-sm font-semibold text-destructive-400 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            <AlertCircle size={18} />
            {apiError}
          </div>
        ) : null}

        <div className="mb-6 flex items-center gap-3 rounded-lg border border-primary-500/20 bg-primary-500/5 px-4 py-3 text-xs font-medium text-slate-400 backdrop-blur-sm">
          <AlertCircle size={14} className="text-primary-400" />
          <p>
            <span className="font-bold text-primary-400">Note:</span> Processing parameters are recorded for reporting purposes. 
            The current predictive model uses material composition as the primary driver for Yield Strength.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
          <PredictionForm
            values={values}
            errors={errors}
            isLoading={isLoading}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
          <PredictionResult result={prediction} />
        </div>

        <div className="mt-8">
          <ExplanationDashboard
            explanation={explanation}
            formValues={values}
            selectedFeature={selectedFeature}
            onSelectedFeatureChange={setSelectedFeature}
          />
        </div>
      </div>
    </main>
  );
}

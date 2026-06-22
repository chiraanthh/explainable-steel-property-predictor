import { useEffect, useMemo, useState } from "react";
import { AlertCircle, FileDown } from "lucide-react";
import { dependenceMaterial, explainMaterial, predictMaterial } from "../api/materialApi";
import { compositionFields, initialFormState, modelPayloadFromForm, targets } from "../data/features";
import ExplanationDashboard from "../components/ExplanationDashboard";
import PredictionForm from "../components/PredictionForm";
import PredictionResult from "../components/PredictionResult";
import { jsPDF } from "jspdf";

function validate(values) {
  const errors = {};
  compositionFields.forEach((field) => {
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
  const [submittedPayload, setSubmittedPayload] = useState(null);
  const [dependence, setDependence] = useState(null);
  const [dependenceLoading, setDependenceLoading] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(targets[0].key);
  const [selectedFeature, setSelectedFeature] = useState(compositionFields[0].name);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const completion = useMemo(() => {
    const filled = compositionFields.filter((field) => values[field.name] !== "").length;
    return Math.round((filled / compositionFields.length) * 100);
  }, [values]);

  // Refetch the SHAP explanation whenever there is a submitted material or the user
  // switches which property to explain.
  useEffect(() => {
    if (!submittedPayload) return;
    let cancelled = false;
    explainMaterial(submittedPayload, selectedTarget)
      .then((data) => {
        if (!cancelled) setExplanation(data);
      })
      .catch(() => {
        if (!cancelled) setExplanation(null);
      });
    return () => {
      cancelled = true;
    };
  }, [submittedPayload, selectedTarget]);

  // Real sensitivity curve for the selected element + property.
  useEffect(() => {
    if (!submittedPayload) return;
    let cancelled = false;
    setDependenceLoading(true);
    dependenceMaterial(submittedPayload, selectedFeature, selectedTarget, 25)
      .then((data) => {
        if (!cancelled) setDependence(data);
      })
      .catch(() => {
        if (!cancelled) setDependence(null);
      })
      .finally(() => {
        if (!cancelled) setDependenceLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [submittedPayload, selectedFeature, selectedTarget]);

  function handleChange(name, value) {
    const isCompositionField = compositionFields.some((f) => f.name === name) && name !== "Fe";

    setValues((current) => {
      let nextValues = { ...current, [name]: value };

      if (isCompositionField) {
        // Auto-balance Iron (Fe) so the alloy composition stays at 100%.
        const totalOthers = compositionFields
          .filter((f) => f.name !== "Fe" && f.name !== name)
          .reduce((sum, f) => sum + (Number(current[f.name]) || 0), 0) + (Number(value) || 0);

        if (totalOthers > 100) {
          const cappedValue = 100 - (totalOthers - (Number(value) || 0));
          nextValues[name] = String(Math.max(0, Number(cappedValue.toFixed(2))));
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
      const predictionResponse = await predictMaterial(payload);
      setPrediction(predictionResponse);
      setSubmittedPayload(payload); // triggers explanation + sensitivity fetches
    } catch (error) {
      setApiError(error.message);
      setPrediction(null);
      setExplanation(null);
      setSubmittedPayload(null);
      setDependence(null);
    } finally {
      setIsLoading(false);
    }
  }

  function handleDownloadReport() {
    if (!prediction) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Steel Alloy Mechanical Property Report", 20, 20);

    doc.setFontSize(13);
    doc.text("Predicted Properties:", 20, 34);
    doc.setFontSize(12);
    let y = 43;
    (prediction.predictions ?? []).forEach((p) => {
      doc.text(`${p.label}: ${Number(p.prediction).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${p.unit}`, 30, y);
      y += 8;
    });

    y += 4;
    doc.setFontSize(13);
    doc.text("Composition (wt %):", 20, y);
    doc.setFontSize(12);
    y += 9;
    compositionFields.forEach((field) => {
      const val = field.name === "Fe" ? values.Fe : values[field.name];
      doc.text(`${field.label} (${field.symbol}): ${val}`, 30, y);
      y += 8;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    if (explanation?.features?.length) {
      y += 6;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(13);
      doc.text(`Top SHAP Drivers for ${explanation.label}:`, 20, y);
      doc.setFontSize(12);
      y += 9;
      const sortedFeatures = [...explanation.features]
        .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
        .slice(0, 5);
      sortedFeatures.forEach((f) => {
        const effect = f.contribution === "positive" ? "Increases" : "Decreases";
        doc.text(`- ${f.name}: ${Math.abs(f.shap_value).toFixed(2)} (${effect})`, 30, y);
        y += 8;
      });
    }

    doc.save("Steel_Property_Report.pdf");
  }

  return (
    <main className="min-h-[calc(100vh-65px)] bg-background relative overflow-hidden">
      <div className="absolute top-[20%] left-0 w-[400px] h-[400px] bg-primary-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-5 py-8 relative z-10 animate-fade-in">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">Prediction Dashboard</p>
            <h1 className="mt-1 text-4xl font-bold text-slate-900 tracking-tight">Steel Alloy Property Predictor</h1>
          </div>
          <div className="flex flex-col gap-3">
            {prediction && (
              <button
                onClick={handleDownloadReport}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white border border-primary-500/30 px-4 py-2 text-sm font-bold text-primary-600 hover:bg-primary-50 transition-colors"
              >
                <FileDown size={16} />
                Download PDF Report
              </button>
            )}
            <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-panel md:w-64">
              <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-500">
                <span>Input completion</span>
                <span className="text-primary-600">{completion}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                <div className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500" style={{ width: `${completion}%` }} />
              </div>
            </div>
          </div>
        </div>

        {apiError ? (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive-500/40 bg-destructive-500/5 px-4 py-3 text-sm font-semibold text-destructive-600">
            <AlertCircle size={18} />
            {apiError}
          </div>
        ) : null}

        <div className="mb-6 flex items-center gap-3 rounded-lg border border-primary-500/20 bg-primary-50 px-4 py-3 text-xs font-medium text-slate-600">
          <AlertCircle size={14} className="text-primary-500 shrink-0" />
          <p>
            <span className="font-bold text-primary-600">Note:</span> Enter the steel-alloy composition in weight %. Iron (Fe) auto-balances so the composition totals 100%. The model predicts Yield Strength, Tensile Strength and Elongation from these 14 elements.
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
            dependence={dependence}
            dependenceLoading={dependenceLoading}
            selectedTarget={selectedTarget}
            onSelectedTargetChange={setSelectedTarget}
            selectedFeature={selectedFeature}
            onSelectedFeatureChange={setSelectedFeature}
          />
        </div>
      </div>
    </main>
  );
}

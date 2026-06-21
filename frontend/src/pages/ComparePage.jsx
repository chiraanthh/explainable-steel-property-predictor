import { useState } from "react";
import { AlertCircle, Scale, ArrowRight, ArrowDown, ArrowUp } from "lucide-react";
import { predictMaterial, explainMaterial } from "../api/materialApi";
import { compositionFields, processingFields, initialFormState, modelPayloadFromForm } from "../data/features";
import NumericField from "../components/NumericField";

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

export default function ComparePage() {
  const [valuesA, setValuesA] = useState(initialFormState);
  const [valuesB, setValuesB] = useState(initialFormState);
  const [errorsA, setErrorsA] = useState({});
  const [errorsB, setErrorsB] = useState({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [results, setResults] = useState(null);

  function handleChangeA(name, value) {
    setValuesA((current) => ({ ...current, [name]: value }));
    setErrorsA((current) => ({ ...current, [name]: undefined }));
  }

  function handleChangeB(name, value) {
    setValuesB((current) => ({ ...current, [name]: value }));
    setErrorsB((current) => ({ ...current, [name]: undefined }));
  }

  async function handleCompare(event) {
    event.preventDefault();
    const nextErrorsA = validate(valuesA);
    const nextErrorsB = validate(valuesB);
    setErrorsA(nextErrorsA);
    setErrorsB(nextErrorsB);
    setApiError("");

    if (Object.keys(nextErrorsA).length > 0 || Object.keys(nextErrorsB).length > 0) {
        return;
    }

    setIsLoading(true);
    try {
      const payloadA = modelPayloadFromForm(valuesA);
      const payloadB = modelPayloadFromForm(valuesB);

      const [predA, expA, predB, expB] = await Promise.all([
        predictMaterial(payloadA),
        explainMaterial(payloadA),
        predictMaterial(payloadB),
        explainMaterial(payloadB),
      ]);

      setResults({ predA, expA, predB, expB });
    } catch (error) {
      setApiError(error.message);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }

  const renderComparisonFields = (fields) => {
    return fields.map((field) => (
      <div key={field.name} className="flex flex-col md:flex-row gap-4 items-center border-b border-slate-800/50 py-3">
        <div className="w-full md:w-1/3 text-sm font-semibold text-slate-300">
          {field.label} <span className="text-xs text-slate-500">({field.symbol || field.unit})</span>
        </div>
        <div className="w-full md:w-1/3">
          <NumericField field={{...field, label: "Mat A"}} value={valuesA[field.name]} error={errorsA[field.name]} onChange={handleChangeA} />
        </div>
        <div className="w-full md:w-1/3">
          <NumericField field={{...field, label: "Mat B"}} value={valuesB[field.name]} error={errorsB[field.name]} onChange={handleChangeB} />
        </div>
      </div>
    ));
  };

  return (
    <main className="min-h-[calc(100vh-65px)] bg-background relative overflow-hidden py-8">
      <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-secondary-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-5 relative z-10 animate-fade-in">
        <div className="mb-8 flex items-end gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary-400">Analysis</p>
            <h1 className="mt-1 text-4xl font-bold text-white tracking-tight">Compare Materials</h1>
          </div>
        </div>

        {apiError ? (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive-500/50 bg-destructive-500/10 px-4 py-3 text-sm font-semibold text-destructive-400">
            <AlertCircle size={18} />
            {apiError}
          </div>
        ) : null}

        <div className="grid gap-8 xl:grid-cols-2">
          {/* Form Section */}
          <form onSubmit={handleCompare} className="space-y-6">
            <section className="panel">
              <div className="panel-heading">
                <Scale size={20} className="text-primary-400" />
                <h2>Input Parameters</h2>
              </div>
              <div className="flex flex-col gap-2">
                <div className="hidden md:flex flex-row gap-4 mb-2">
                  <div className="w-1/3"></div>
                  <div className="w-1/3 font-bold text-slate-200">Material A</div>
                  <div className="w-1/3 font-bold text-slate-200">Material B</div>
                </div>
                {renderComparisonFields([...compositionFields, ...processingFields])}
              </div>
              <button type="submit" disabled={isLoading} className="primary-button w-full justify-center mt-6 text-base">
                {isLoading ? "Comparing..." : "Compare Materials"}
              </button>
            </section>
          </form>

          {/* Results Section */}
          <div className="space-y-6">
            {results ? (
              <>
                <section className="panel group">
                  <div className="panel-heading">
                    <ArrowRight size={20} className="text-secondary-400" />
                    <h2>Prediction Difference</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-700 bg-[#0a0a0f] p-6 text-center">
                      <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">Material A</p>
                      <span className="text-4xl font-bold text-white">
                        {Number(results.predA.prediction).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                      <span className="ml-2 text-primary-400">{results.predA.unit}</span>
                    </div>
                    <div className="rounded-xl border border-slate-700 bg-[#0a0a0f] p-6 text-center">
                      <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">Material B</p>
                      <span className="text-4xl font-bold text-white">
                        {Number(results.predB.prediction).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                      <span className="ml-2 text-secondary-400">{results.predB.unit}</span>
                    </div>
                  </div>
                  
                  {/* Delta Box */}
                  <div className="mt-4 rounded-xl border border-primary-500/30 bg-primary-900/20 p-6 flex items-center justify-between">
                    <span className="text-lg font-semibold text-slate-200">Difference (B - A):</span>
                    <div className="flex items-center gap-2">
                      {results.predB.prediction > results.predA.prediction ? (
                        <ArrowUp className="text-primary-400" />
                      ) : (
                        <ArrowDown className="text-destructive-400" />
                      )}
                      <span className="text-3xl font-bold text-white">
                        {Math.abs(results.predB.prediction - results.predA.prediction).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-primary-400">MPa</span>
                    </div>
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-heading">
                    <Scale size={20} className="text-primary-400" />
                    <h2>SHAP Feature Differences</h2>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">Comparing the top 5 most impactful features between the two materials.</p>
                  
                  <div className="space-y-3">
                    {/* Compute top 5 differences. We use the absolute difference in shap value to find the biggest changes. */}
                    {compositionFields.map(f => {
                       const shapA = results.expA.features.find(x => x.name === f.name)?.shap_value || 0;
                       const shapB = results.expB.features.find(x => x.name === f.name)?.shap_value || 0;
                       return { name: f.name, label: f.label, diff: shapB - shapA, absDiff: Math.abs(shapB - shapA) };
                    }).sort((a,b) => b.absDiff - a.absDiff).slice(0, 5).map(item => (
                      <div key={item.name} className="flex items-center justify-between border-b border-slate-800/50 pb-2">
                        <span className="font-semibold text-slate-200">{item.label}</span>
                        <div className="flex items-center gap-4">
                           <span className={item.diff > 0 ? "text-primary-400" : "text-destructive-400"}>
                              {item.diff > 0 ? '+' : ''}{item.diff.toFixed(2)} SHAP
                           </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            ) : (
              <div className="h-full min-h-[400px] flex items-center justify-center border border-dashed border-slate-700 rounded-xl">
                <p className="text-slate-500 font-medium">Fill parameters and compare materials to see the analysis.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

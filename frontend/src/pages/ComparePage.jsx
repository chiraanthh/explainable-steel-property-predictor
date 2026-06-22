import { useEffect, useState } from "react";
import { AlertCircle, Scale, ArrowRight, ArrowDown, ArrowUp } from "lucide-react";
import { predictMaterial, explainMaterial, fetchHealth } from "../api/materialApi";
import { applyCompositionChange, compositionFields, initialFormState, modelPayloadFromForm, targets } from "../data/features";
import NumericField from "../components/NumericField";

const predValue = (pred, key) => Number(pred?.predictions?.find((p) => p.key === key)?.prediction ?? 0);

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

export default function ComparePage() {
  const [valuesA, setValuesA] = useState(initialFormState);
  const [valuesB, setValuesB] = useState(initialFormState);
  const [errorsA, setErrorsA] = useState({});
  const [errorsB, setErrorsB] = useState({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [results, setResults] = useState(null);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchHealth()
      .then((health) => {
        if (cancelled) return;
        const map = {};
        (health.targets ?? []).forEach((t) => {
          if (t.metrics) map[t.key] = t.metrics;
        });
        setMetrics(map);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  function handleChangeA(name, value) {
    setValuesA((current) => applyCompositionChange(current, name, value));
    setErrorsA((current) => ({ ...current, [name]: undefined }));
  }

  function handleChangeB(name, value) {
    setValuesB((current) => applyCompositionChange(current, name, value));
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
        explainMaterial(payloadA, "yield_strength"),
        predictMaterial(payloadB),
        explainMaterial(payloadB, "yield_strength"),
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
      <div key={field.name} className="flex flex-col md:flex-row gap-4 items-center border-b border-slate-100 py-3">
        <div className="w-full md:w-1/3 text-sm font-semibold text-slate-700">
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
      <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-secondary-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-5 relative z-10 animate-fade-in">
        <div className="mb-8 flex items-end gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary-600">Analysis</p>
            <h1 className="mt-1 text-4xl font-bold text-slate-900 tracking-tight">Compare Steel Alloys</h1>
          </div>
        </div>

        {apiError ? (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive-500/40 bg-destructive-500/5 px-4 py-3 text-sm font-semibold text-destructive-600">
            <AlertCircle size={18} />
            {apiError}
          </div>
        ) : null}

        <div className="grid gap-8 xl:grid-cols-2">
          {/* Form Section */}
          <form onSubmit={handleCompare} className="space-y-6">
            <section className="panel">
              <div className="panel-heading">
                <Scale size={20} className="text-primary-500" />
                <h2>Input Parameters</h2>
              </div>
              <p className="-mt-3 mb-3 text-xs text-slate-500">Composition in weight %. Iron (Fe) auto-balances so each alloy totals 100%.</p>
              <div className="flex flex-col gap-2">
                <div className="hidden md:flex flex-row gap-4 mb-2">
                  <div className="w-1/3"></div>
                  <div className="w-1/3 font-bold text-slate-700">Material A</div>
                  <div className="w-1/3 font-bold text-slate-700">Material B</div>
                </div>
                {renderComparisonFields(compositionFields)}
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
                    <ArrowRight size={20} className="text-secondary-500" />
                    <h2>Predicted Properties</h2>
                  </div>
                  <div className="space-y-3">
                    {targets.map((t) => {
                      const a = predValue(results.predA, t.key);
                      const b = predValue(results.predB, t.key);
                      const diff = b - a;
                      const digits = t.unit === "%" ? 2 : 1;
                      return (
                        <div key={t.key} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                              {t.label}
                              {metrics?.[t.key] && (
                                <span
                                  title={`Model accuracy: R² = ${metrics[t.key].r2}, MAE = ${metrics[t.key].mae} ${t.unit}`}
                                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500"
                                >
                                  R² {metrics[t.key].r2}
                                </span>
                              )}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {diff >= 0 ? <ArrowUp size={16} className="text-primary-600" /> : <ArrowDown size={16} className="text-destructive-500" />}
                              <span className={`text-sm font-bold ${diff >= 0 ? "text-primary-600" : "text-destructive-500"}`}>
                                {diff >= 0 ? "+" : ""}{diff.toLocaleString(undefined, { maximumFractionDigits: digits })} {t.unit}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-center">
                            <div>
                              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Material A</p>
                              <span className="text-2xl font-bold text-slate-900">{a.toLocaleString(undefined, { maximumFractionDigits: digits })}</span>
                              <span className="ml-1 text-xs text-slate-500">{t.unit}</span>
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Material B</p>
                              <span className="text-2xl font-bold text-slate-900">{b.toLocaleString(undefined, { maximumFractionDigits: digits })}</span>
                              <span className="ml-1 text-xs text-slate-500">{t.unit}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-heading">
                    <Scale size={20} className="text-primary-500" />
                    <h2>SHAP Feature Differences</h2>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">Top 5 elements driving the <span className="font-semibold text-slate-700">Yield Strength</span> difference between the two materials.</p>

                  <div className="space-y-3">
                    {/* Compute top 5 differences. We use the absolute difference in shap value to find the biggest changes. */}
                    {compositionFields.map(f => {
                       const shapA = results.expA.features.find(x => x.name === f.name)?.shap_value || 0;
                       const shapB = results.expB.features.find(x => x.name === f.name)?.shap_value || 0;
                       return { name: f.name, label: f.label, diff: shapB - shapA, absDiff: Math.abs(shapB - shapA) };
                    }).sort((a,b) => b.absDiff - a.absDiff).slice(0, 5).map(item => (
                      <div key={item.name} className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="font-semibold text-slate-700">{item.label}</span>
                        <div className="flex items-center gap-4">
                           <span className={item.diff > 0 ? "text-primary-600 font-semibold" : "text-destructive-500 font-semibold"}>
                              {item.diff > 0 ? '+' : ''}{item.diff.toFixed(2)} SHAP
                           </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            ) : (
              <div className="h-full min-h-[400px] flex items-center justify-center border border-dashed border-slate-300 rounded-xl bg-white/60">
                <p className="text-slate-500 font-medium">Fill parameters and compare materials to see the analysis.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

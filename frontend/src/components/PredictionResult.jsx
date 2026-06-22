import { Gauge } from "lucide-react";
import { targets } from "../data/features";

export default function PredictionResult({ result, metrics }) {
  // result = { predictions: [{ key, label, prediction, unit }, ...] } or null
  // metrics = { yield_strength: { r2, mae, samples }, ... } or null
  const byKey = new Map((result?.predictions ?? []).map((p) => [p.key, p]));

  return (
    <section className="panel h-full flex flex-col relative z-10 animate-fade-in group">
      <div className="panel-heading">
        <Gauge size={20} className="text-secondary-500 group-hover:animate-spin-slow" />
        <h2>Predicted Properties</h2>
      </div>

      <div className="mt-auto flex-1 flex flex-col justify-center gap-3">
        {targets.map((t, index) => {
          const p = byKey.get(t.key);
          const m = metrics?.[t.key];
          const isPrimary = index === 0;
          return (
            <div
              key={t.key}
              className={`rounded-xl border p-5 relative overflow-hidden ${
                isPrimary
                  ? "border-primary-500/30 bg-gradient-to-br from-primary-50 to-secondary-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t.label}</p>
                {m && (
                  <span
                    title={`Model accuracy on held-out test data: R² = ${m.r2}, MAE = ${m.mae} ${t.unit}`}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500"
                  >
                    R² {m.r2}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-end gap-2">
                <span
                  className={`font-extrabold tracking-tight ${
                    isPrimary
                      ? "text-4xl text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600"
                      : "text-3xl text-slate-800"
                  }`}
                >
                  {p ? Number(p.prediction).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "--"}
                </span>
                <span className="pb-1 text-base font-bold text-primary-500">{p?.unit ?? t.unit}</span>
              </div>
              {m && (
                <p className="mt-1 text-[11px] text-slate-400">± {m.mae} {t.unit} typical error</p>
              )}
            </div>
          );
        })}

        {!result && (
          <p className="text-sm text-slate-500">Run a prediction to estimate all three steel properties.</p>
        )}
      </div>
    </section>
  );
}

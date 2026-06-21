import { Gauge } from "lucide-react";

export default function PredictionResult({ result }) {
  return (
    <section className="panel h-full flex flex-col relative z-10 animate-fade-in group">
      <div className="panel-heading">
        <Gauge size={20} className="text-secondary-400 group-hover:animate-spin-slow" />
        <h2>Predicted Property</h2>
      </div>
      <div className="mt-auto flex-1 flex flex-col justify-center rounded-xl border border-primary-500/20 bg-gradient-to-br from-primary-50 to-secondary-50 p-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary-400/20 rounded-full blur-2xl pointer-events-none" />

        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 relative z-10">Yield Strength</p>
        <div className="mt-4 flex items-end gap-3 relative z-10">
          <span className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 tracking-tight">
            {result ? Number(result.prediction).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "--"}
          </span>
          <span className="pb-2 text-xl font-bold text-primary-500">{result?.unit || "MPa"}</span>
        </div>
        {!result && (
          <p className="mt-3 text-sm text-slate-500 relative z-10">Run a prediction to see the estimated steel yield strength.</p>
        )}
      </div>
    </section>
  );
}

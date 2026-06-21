import { Activity, TrendingDown, TrendingUp, Cpu } from "lucide-react";
import { compositionFields } from "../data/features";
import { formatFeatureName, toDependenceRows, toImportanceRows, toWaterfallRows } from "../utils/shap";
import DependenceChart from "./charts/DependenceChart";
import FeatureImportanceChart from "./charts/FeatureImportanceChart";
import WaterfallChart from "./charts/WaterfallChart";

export default function ExplanationDashboard({ explanation, formValues, selectedFeature, onSelectedFeatureChange }) {
  if (!explanation) return null;

  const importanceRows = toImportanceRows(explanation);
  const waterfallRows = toWaterfallRows(explanation);
  const dependenceRows = toDependenceRows(selectedFeature, formValues, explanation);
  const increasingCount = explanation.features.filter((feature) => feature.contribution === "positive").length;
  const decreasingCount = explanation.features.length - increasingCount;

  return (
    <section className="space-y-6 relative z-10 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800/50 pb-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary-400 flex items-center gap-2">
            <Cpu size={16} />
            SHAP Analysis
          </p>
          <h2 className="mt-1 text-3xl font-bold text-white tracking-tight">Explanation Dashboard</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="stat-tile">
            <TrendingUp size={18} className="text-primary-400" />
            <span className="text-slate-200">{increasingCount} Increasing</span>
          </div>
          <div className="stat-tile">
            <TrendingDown size={18} className="text-destructive-400" />
            <span className="text-slate-200">{decreasingCount} Decreasing</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="panel group">
          <div className="panel-heading">
            <Activity size={20} className="text-primary-400 group-hover:animate-pulse" />
            <h3>Feature Importance</h3>
          </div>
          <FeatureImportanceChart data={importanceRows} />
        </section>

        <section className="panel group">
          <div className="panel-heading">
            <Activity size={20} className="text-secondary-400 group-hover:animate-pulse" />
            <h3>Individual Explanation</h3>
          </div>
          <WaterfallChart data={waterfallRows} />
        </section>
      </div>

      <section className="panel group">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="panel-heading !mb-0">
            <Activity size={20} className="text-primary-400 group-hover:animate-pulse" />
            <h3>Feature Impact</h3>
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-300">
            Select feature
            <select
              value={selectedFeature}
              onChange={(event) => onSelectedFeatureChange(event.target.value)}
              className="rounded-lg border border-slate-700 bg-[#0a0a0f]/80 px-4 py-2 text-sm font-medium text-slate-100 outline-none transition-all duration-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30"
            >
              {compositionFields.map((field) => (
                <option key={field.name} value={field.name}>
                  {field.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-6">
          <DependenceChart data={dependenceRows} featureLabel={formatFeatureName(selectedFeature)} />
        </div>
      </section>
    </section>
  );
}

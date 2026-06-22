import { Activity, TrendingDown, TrendingUp, Cpu } from "lucide-react";
import { compositionFields, targets } from "../data/features";
import { formatFeatureName, toImportanceRows, toWaterfallRows } from "../utils/shap";
import DependenceChart from "./charts/DependenceChart";
import FeatureImportanceChart from "./charts/FeatureImportanceChart";
import WaterfallChart from "./charts/WaterfallChart";

export default function ExplanationDashboard({
  explanation,
  dependence,
  dependenceLoading,
  selectedTarget,
  onSelectedTargetChange,
  selectedFeature,
  onSelectedFeatureChange,
}) {
  if (!explanation) return null;

  const importanceRows = toImportanceRows(explanation);
  const waterfallData = toWaterfallRows(explanation);
  const unit = explanation.unit ?? "MPa";
  const targetLabel = explanation.label ?? "property";
  const increasingCount = explanation.features.filter((feature) => feature.contribution === "positive").length;
  const decreasingCount = explanation.features.length - increasingCount;

  return (
    <section className="space-y-6 relative z-10 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary-600 flex items-center gap-2">
            <Cpu size={16} />
            SHAP Analysis
          </p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900 tracking-tight">Explanation Dashboard</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            Explaining
            <select
              value={selectedTarget}
              onChange={(event) => onSelectedTargetChange(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            >
              {targets.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <div className="stat-tile">
            <TrendingUp size={18} className="text-primary-500" />
            <span className="text-slate-700">{increasingCount} ↑</span>
          </div>
          <div className="stat-tile">
            <TrendingDown size={18} className="text-destructive-500" />
            <span className="text-slate-700">{decreasingCount} ↓</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="panel group">
          <div className="panel-heading">
            <Activity size={20} className="text-primary-500 group-hover:animate-pulse" />
            <h3>Feature Importance</h3>
          </div>
          <p className="-mt-3 mb-1 text-sm text-slate-500">Relative impact of each element on predicted {targetLabel}.</p>
          <FeatureImportanceChart data={importanceRows} />
        </section>

        <section className="panel group">
          <div className="panel-heading">
            <Activity size={20} className="text-secondary-500 group-hover:animate-pulse" />
            <h3>Individual Explanation</h3>
          </div>
          <p className="-mt-3 mb-1 text-sm text-slate-500">
            Top drivers shifting {targetLabel} from the dataset base ({Number(explanation.base_value).toLocaleString(undefined, { maximumFractionDigits: unit === "%" ? 2 : 0 })} {unit}) to the predicted {Number(explanation.prediction).toLocaleString(undefined, { maximumFractionDigits: unit === "%" ? 2 : 0 })} {unit}.
          </p>
          <WaterfallChart data={waterfallData} unit={unit} />
        </section>
      </div>

      <section className="panel group">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="panel-heading !mb-0">
            <Activity size={20} className="text-primary-500 group-hover:animate-pulse" />
            <h3>Sensitivity Analysis</h3>
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-600">
            Select element
            <select
              value={selectedFeature}
              onChange={(event) => onSelectedFeatureChange(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            >
              {compositionFields.map((field) => (
                <option key={field.name} value={field.name}>
                  {field.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Holds every other element fixed and sweeps {formatFeatureName(selectedFeature)} across the range seen in the steel-alloy dataset, showing the model's actual predicted {targetLabel} at each value.
        </p>
        <div className="mt-4">
          <DependenceChart dependence={dependence} featureLabel={formatFeatureName(selectedFeature)} loading={dependenceLoading} />
        </div>
      </section>
    </section>
  );
}

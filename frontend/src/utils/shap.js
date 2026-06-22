import { compositionFields } from "../data/features";

const labelByName = new Map(compositionFields.map((field) => [field.name, field.label]));

export function formatFeatureName(name) {
  return labelByName.get(name) ?? name;
}

export function toImportanceRows(explanation) {
  if (!explanation?.features?.length) return [];

  const total = explanation.features.reduce((sum, feature) => {
    return sum + Math.abs(Number(feature.shap_value));
  }, 0);

  return explanation.features
    .map((feature) => {
      const value = Number(feature.shap_value);
      return {
        name: formatFeatureName(feature.name),
        rawName: feature.name,
        shapValue: value,
        importance: total === 0 ? 0 : Number(((Math.abs(value) / total) * 100).toFixed(2)),
        contribution: feature.contribution,
      };
    })
    .sort((a, b) => b.importance - a.importance);
}

// Build a readable SHAP waterfall: features are sorted by absolute impact (largest
// drivers first) and the long tail of tiny contributions is aggregated into a single
// "Other" row. The base value (E[f(x)]) and the final prediction are returned as
// reference markers rather than full-height bars so the small increments stay visible.
export function toWaterfallRows(explanation, topN = 8) {
  if (!explanation?.features?.length) return null;

  const base = Number(explanation.base_value);
  const final = Number(explanation.prediction);

  const sorted = explanation.features
    .map((feature) => ({ name: formatFeatureName(feature.name), delta: Number(feature.shap_value) }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const head = sorted.slice(0, topN);
  const tail = sorted.slice(topN);
  if (tail.length) {
    const tailDelta = tail.reduce((sum, f) => sum + f.delta, 0);
    head.push({ name: `Other (${tail.length})`, delta: tailDelta });
  }

  let running = base;
  const rows = head.map((f) => {
    const start = running;
    running += f.delta;
    return {
      name: f.name,
      start,
      end: running,
      delta: f.delta,
      type: f.delta >= 0 ? "positive" : "negative",
    };
  });

  const allValues = [base, final, ...rows.flatMap((r) => [r.start, r.end])];
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const pad = (max - min || Math.abs(max) || 1) * 0.08;

  return {
    rows,
    base: Number(base.toFixed(4)),
    final: Number(final.toFixed(4)),
    domain: [Number((min - pad).toFixed(2)), Number((max + pad).toFixed(2))],
  };
}

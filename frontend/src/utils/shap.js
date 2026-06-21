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

export function toWaterfallRows(explanation) {
  if (!explanation?.features?.length) return [];

  let running = Number(explanation.base_value);
  const base = {
    name: "Base value",
    start: 0,
    end: running,
    delta: running,
    type: "base",
  };

  const features = explanation.features.map((feature) => {
    const delta = Number(feature.shap_value);
    const start = running;
    running += delta;
    return {
      name: formatFeatureName(feature.name),
      start,
      end: running,
      delta,
      type: delta >= 0 ? "positive" : "negative",
    };
  });

  return [
    base,
    ...features,
    {
      name: "Final prediction",
      start: 0,
      end: Number(explanation.prediction),
      delta: Number(explanation.prediction),
      type: "final",
    },
  ];
}

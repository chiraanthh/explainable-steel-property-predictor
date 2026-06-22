export const compositionFields = [
  { name: "Fe", label: "Iron", symbol: "Fe", defaultValue: 60.5 },
  { name: "c", label: "Carbon", symbol: "C", defaultValue: 0.02 },
  { name: "mn", label: "Manganese", symbol: "Mn", defaultValue: 0.05 },
  { name: "si", label: "Silicon", symbol: "Si", defaultValue: 0.05 },
  { name: "cr", label: "Chromium", symbol: "Cr", defaultValue: 0.01 },
  { name: "ni", label: "Nickel", symbol: "Ni", defaultValue: 19.7 },
  { name: "mo", label: "Molybdenum", symbol: "Mo", defaultValue: 2.95 },
  { name: "v", label: "Vanadium", symbol: "V", defaultValue: 0.01 },
  { name: "n", label: "Nitrogen", symbol: "N", defaultValue: 0 },
  { name: "nb", label: "Niobium", symbol: "Nb", defaultValue: 0.01 },
  { name: "co", label: "Cobalt", symbol: "Co", defaultValue: 15 },
  { name: "w", label: "Tungsten", symbol: "W", defaultValue: 0 },
  { name: "al", label: "Aluminium", symbol: "Al", defaultValue: 0.15 },
  { name: "ti", label: "Titanium", symbol: "Ti", defaultValue: 1.55 },
];

// Mechanical properties the model predicts (must match backend TARGETS keys).
export const targets = [
  { key: "yield_strength", label: "Yield Strength", unit: "MPa" },
  { key: "tensile_strength", label: "Tensile Strength", unit: "MPa" },
  { key: "elongation", label: "Elongation", unit: "%" },
];

export function initialFormState() {
  return compositionFields.reduce((state, field) => {
    state[field.name] = String(field.defaultValue);
    return state;
  }, {});
}

export function modelPayloadFromForm(values) {
  return compositionFields.reduce((payload, field) => {
    payload[field.name] = Number(values[field.name]);
    return payload;
  }, {});
}

// Update one composition field and auto-balance Iron (Fe) so the alloy totals 100%.
// Shared by the Dashboard and Compare pages.
export function applyCompositionChange(current, name, value) {
  const next = { ...current, [name]: value };
  const isComposition = compositionFields.some((f) => f.name === name) && name !== "Fe";
  if (!isComposition) return next;

  const totalOthers =
    compositionFields
      .filter((f) => f.name !== "Fe" && f.name !== name)
      .reduce((sum, f) => sum + (Number(current[f.name]) || 0), 0) + (Number(value) || 0);

  if (totalOthers > 100) {
    const capped = 100 - (totalOthers - (Number(value) || 0));
    next[name] = String(Math.max(0, Number(capped.toFixed(2))));
    next.Fe = "0.00";
  } else {
    next.Fe = String((100 - totalOthers).toFixed(2));
  }
  return next;
}

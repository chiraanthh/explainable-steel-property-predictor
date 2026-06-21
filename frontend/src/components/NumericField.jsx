export default function NumericField({ field, value, error, onChange }) {
  // Composition fields are percentages (they carry a chemical `symbol`) and map
  // cleanly onto a 0-100 slider. Processing fields (temperature, density, ...)
  // have arbitrary ranges, so they get a number input only.
  const isComposition = Boolean(field.symbol);
  const isLocked = field.name === "Fe";

  return (
    <label className="block group">
      <span className="mb-1.5 flex items-center justify-between gap-2 text-sm font-semibold text-slate-700 group-hover:text-primary-600 transition-colors">
        <span>{field.label}</span>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{field.symbol || field.unit}</span>
      </span>
      <div className="space-y-3">
        <div className="relative">
          <input
            type="number"
            step="any"
            min="0"
            max={isLocked ? 100 : undefined}
            readOnly={isLocked}
            value={value}
            onChange={(event) => onChange(field.name, event.target.value)}
            className={`${error ? "input-field input-error" : "input-field"} ${isLocked ? "bg-slate-100 text-slate-500 cursor-not-allowed border-primary-500/20" : ""}`}
          />
        </div>

        {isComposition && (
          <input
            type="range"
            min="0"
            max="100"
            step="0.01"
            value={Number(value) || 0}
            disabled={isLocked}
            onChange={(event) => onChange(field.name, event.target.value)}
            className={`w-full cursor-pointer ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
          />
        )}
      </div>
      {error ? <span className="mt-1.5 block text-xs font-semibold text-destructive-500 tracking-wide">{error}</span> : null}
    </label>
  );
}

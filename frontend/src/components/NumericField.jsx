export default function NumericField({ field, value, error, onChange }) {
  return (
    <label className="block group">
      <span className="mb-1.5 flex items-center justify-between gap-2 text-sm font-semibold text-slate-300 group-hover:text-primary-400 transition-colors">
        <span>{field.label}</span>
        <span className="text-xs font-medium text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/50">{field.symbol || field.unit}</span>
      </span>
      <div className="space-y-3">
        <div className="relative">
          <input
            type="number"
            step="any"
            min="0"
            max={field.name === 'Fe' ? 100 : undefined}
            readOnly={field.name === 'Fe'}
            value={value}
            onChange={(event) => onChange(field.name, event.target.value)}
            className={`${error ? "input-field input-error" : "input-field"} ${field.name === 'Fe' ? 'bg-white/5 opacity-80 cursor-not-allowed border-primary-500/20' : ''}`}
          />
          {error ? (
            <div className="absolute inset-0 rounded-lg border-2 border-destructive-500 pointer-events-none shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]" />
          ) : null}
        </div>
        
        <input
          type="range"
          min="0"
          max="100"
          step="0.01"
          value={Number(value) || 0}
          disabled={field.name === 'Fe'}
          onChange={(event) => onChange(field.name, event.target.value)}
          className={`w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500 transition-all hover:bg-slate-700 ${field.name === 'Fe' ? 'opacity-30 cursor-not-allowed' : ''}`}
        />
      </div>
      {error ? <span className="mt-1.5 block text-xs font-semibold text-destructive-400 tracking-wide">{error}</span> : null}
    </label>
  );
}

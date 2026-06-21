import { FlaskConical } from "lucide-react";
import { compositionFields } from "../data/features";
import NumericField from "./NumericField";

export default function PredictionForm({ values, errors, isLoading, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 relative z-10 animate-fade-in">
      <section className="panel group">
        <div className="panel-heading">
          <FlaskConical size={20} className="text-primary-400 group-hover:animate-pulse" />
          <h2>Material Composition</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {compositionFields.map((field) => (
            <div key={field.name} className={field.name === 'Fe' ? 'md:col-span-1 rounded-xl border border-primary-500/30 bg-primary-50 p-1' : ''}>
              <NumericField
                field={field}
                value={values[field.name]}
                error={errors[field.name]}
                onChange={onChange}
              />
              {field.name === 'Fe' && (
                <p className="mt-1 text-[10px] uppercase tracking-wider font-bold text-primary-600 text-center">Balance Element (Auto)</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <button type="submit" disabled={isLoading} className="primary-button w-full justify-center md:w-auto text-base">
        {isLoading ? "Predicting..." : "Predict Property"}
      </button>
    </form>
  );
}

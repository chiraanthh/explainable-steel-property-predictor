import { ArrowRight, Microscope } from "lucide-react";
import steelMicrostructure from "../assets/steel-microstructure.png";

const heroElements = [
  { symbol: "Fe", fill: 78 },
  { symbol: "C", fill: 34 },
  { symbol: "Cr", fill: 56 },
  { symbol: "Ni", fill: 64 },
  { symbol: "Mo", fill: 42 },
  { symbol: "Ti", fill: 50 },
];

export default function HomePage({ onStart }) {
  return (
    <main className="bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary-400/10 rounded-full blur-[120px] pointer-events-none" />

      <section className="hero-grid min-h-[calc(100vh-65px)] border-b border-slate-200">
        <div className="mx-auto grid min-h-[calc(100vh-65px)] max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[1.05fr_0.95fr] relative z-10">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-500/25 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-600 shadow-sm">
              <Microscope size={16} className="text-primary-500" />
              <span className="tracking-wide">Explainable Material Property Predictor</span>
            </div>
            <h1 className="max-w-4xl text-5xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-7xl">
              Explainable AI for <br />
              <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">Steel Alloy Science</span>
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-600">
              Predict the <span className="font-semibold text-slate-800">yield strength</span> of steel alloys from their chemical composition — and understand exactly which elements drive the result using state-of-the-art SHAP analysis.
            </p>
            <button type="button" onClick={onStart} className="primary-button mt-10 text-base px-8 py-4">
              Start Prediction
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="relative min-h-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel animate-float">
            <img
              src={steelMicrostructure}
              alt="Microscopic steel grain structure"
              className="absolute inset-0 h-full w-full object-cover opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
            <div className="relative grid h-full min-h-[420px] grid-cols-3 gap-px p-6">
              {heroElements.map((element, index) => (
                <div key={element.symbol} className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white/80 p-5 m-1 transition-all duration-300 hover:border-primary-400/50 hover:shadow-md hover:scale-[1.03] group">
                  <span className="text-xs font-bold tracking-widest text-slate-400">0{index + 1}</span>
                  <span className="text-4xl font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{element.symbol}</span>
                  <span className="block h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <span className="block h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" style={{ width: `${element.fill}%` }} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

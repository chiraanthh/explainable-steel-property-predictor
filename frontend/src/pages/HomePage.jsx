import { ArrowRight, Microscope } from "lucide-react";
import steelMicrostructure from "../assets/steel-microstructure.png";

export default function HomePage({ onStart }) {
  return (
    <main className="bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      <section className="hero-grid min-h-[calc(100vh-65px)] border-b border-slate-800/50">
        <div className="mx-auto grid min-h-[calc(100vh-65px)] max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[1.05fr_0.95fr] relative z-10">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-2 text-sm font-semibold text-primary-400 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)] backdrop-blur-md">
              <Microscope size={16} className="text-primary-400" />
              <span className="tracking-wide">Explainable Material Property Predictor</span>
            </div>
            <h1 className="max-w-4xl text-5xl font-extrabold leading-tight tracking-tight text-white md:text-7xl">
              Explainable AI for <br/>
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">Material Science</span>
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-400">
              Predict mechanical properties and understand the intricate factors influencing the prediction using state-of-the-art SHAP analysis.
            </p>
            <button type="button" onClick={onStart} className="primary-button mt-10 text-base px-8 py-4">
              Start Prediction
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="relative min-h-[420px] overflow-hidden rounded-2xl border border-slate-800 bg-[#12121a]/80 shadow-panel backdrop-blur-xl animate-float">
            <img
              src={steelMicrostructure}
              alt="Microscopic steel grain structure"
              className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
            <div className="relative grid h-full min-h-[420px] grid-cols-3 gap-px p-6">
              {["Fe", "C", "Cr", "Ni", "Mo", "Ti"].map((symbol, index) => (
                <div key={symbol} className="flex flex-col justify-between border border-white/5 bg-[#12121a]/60 p-5 backdrop-blur-md transition-all duration-300 hover:bg-[#12121a]/80 hover:border-primary-500/30 hover:scale-105 rounded-lg m-1 group">
                  <span className="text-xs font-bold tracking-widest text-slate-500">0{index + 1}</span>
                  <span className="text-4xl font-bold text-white group-hover:text-primary-400 transition-colors">{symbol}</span>
                  <span className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <span className="block h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" style={{width: `${Math.random() * 60 + 20}%`}} />
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

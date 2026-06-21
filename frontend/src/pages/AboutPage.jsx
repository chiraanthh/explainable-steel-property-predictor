import { Microscope, BrainCircuit, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-[calc(100vh-65px)] bg-background relative overflow-hidden py-12">
      <div className="absolute top-[10%] right-0 w-[400px] h-[400px] bg-secondary-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="mx-auto max-w-4xl px-5 relative z-10 animate-fade-in">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-400">About the Project</p>
          <h1 className="mt-2 text-4xl font-bold text-white tracking-tight">Explainable AI for Material Science</h1>
          <p className="mt-4 text-lg text-slate-400">Bridging the gap between advanced Machine Learning and trustworthy scientific research.</p>
        </div>

        <div className="space-y-8">
          <section className="panel group">
            <div className="panel-heading mb-4">
              <div className="p-2 bg-destructive-500/10 rounded-lg text-destructive-400 group-hover:scale-110 transition-transform">
                <Microscope size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-100">The Problem</h2>
            </div>
            <p className="text-slate-300 leading-relaxed text-lg">
              Material property prediction is traditionally difficult, expensive, and time-consuming. It involves exhaustive physical testing, trial-and-error alloying, and complex metallurgical analysis. While mathematical modeling exists, it often struggles to capture the highly nonlinear relationships between chemical composition, processing parameters, and resulting mechanical properties like yield strength.
            </p>
          </section>

          <section className="panel group">
            <div className="panel-heading mb-4">
              <div className="p-2 bg-primary-500/10 rounded-lg text-primary-400 group-hover:scale-110 transition-transform">
                <BrainCircuit size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-100">The Solution</h2>
            </div>
            <p className="text-slate-300 leading-relaxed text-lg">
              Machine learning models, such as gradient boosting and deep neural networks, offer a powerful alternative. By training on historical materials data, these models can rapidly and accurately predict mechanical properties for novel compositions. However, they are inherently "black boxes" — they provide a prediction, but do not explain <em>why</em> or <em>how</em> that prediction was made, which limits their adoption in critical scientific and engineering applications.
            </p>
          </section>

          <section className="panel group">
            <div className="panel-heading mb-4">
              <div className="p-2 bg-secondary-500/10 rounded-lg text-secondary-400 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-100">Our Contribution</h2>
            </div>
            <p className="text-slate-300 leading-relaxed text-lg">
              This project integrates <strong>SHAP (SHapley Additive exPlanations)</strong> into the ML prediction pipeline. SHAP applies game theory to calculate the exact marginal contribution of every single input feature to the final prediction. By providing local and global explainability, we transform a black-box model into a transparent, trustworthy scientific instrument. Researchers can now discover which elements (e.g., Carbon vs. Chromium) are driving material strength upward or downward.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

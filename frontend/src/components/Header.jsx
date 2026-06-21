import { Atom, BarChart3, Info, Scale } from "lucide-react";

export default function Header({ activePage, onNavigate }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/50 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex items-center gap-3 text-left group"
          aria-label="Go to home"
        >
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600 text-white shadow-glow group-hover:shadow-glow-purple transition-all duration-300">
            <Atom size={20} />
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-[0.18em] text-slate-400 group-hover:text-primary-400 transition-colors">
              Explainable Material
            </span>
            <span className="block text-lg font-bold text-slate-100">Property Predictor</span>
          </span>
        </button>

        <nav className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className={activePage === "home" ? "nav-button-active" : "nav-button"}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onNavigate("about")}
            className={activePage === "about" ? "nav-button-active" : "nav-button"}
          >
            <Info size={16} />
            About
          </button>
          <button
            type="button"
            onClick={() => onNavigate("compare")}
            className={activePage === "compare" ? "nav-button-active" : "nav-button"}
          >
            <Scale size={16} />
            Compare
          </button>
          <button
            type="button"
            onClick={() => onNavigate("dashboard")}
            className={activePage === "dashboard" ? "nav-button-active" : "nav-button"}
          >
            <BarChart3 size={16} />
            Dashboard
          </button>
        </nav>
      </div>
    </header>
  );
}

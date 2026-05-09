import { Zap, TrendingUp, Menu } from "lucide-react";
import Badge from "./ui/Badge.jsx";

export default function TopBar({ currentStep, overallScore, moduleLoading, onMenuClick }) {
  const getVerdict = (score) => {
    if (score >= 75) return { label: "Strong Match", variant: "gradient-green" };
    if (score >= 50) return { label: "Partial Match", variant: "gradient-amber" };
    return { label: "Weak Match", variant: "gradient-red" };
  };

  const verdict = overallScore ? getVerdict(overallScore) : null;

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-cream-border px-4 md:px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 rounded-lg hover:bg-cream-100 text-ink-secondary transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow">
            <Zap size={13} className="text-white" />
          </div>
          <span className="font-bold text-ink text-[14px]">FitForge</span>
        </div>

        {moduleLoading && (
          <div className="hidden sm:flex items-center gap-2 text-ink-muted text-[12px]">
            <span className="w-3 h-3 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            Analyzing...
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Step counter */}
        {currentStep > 0 && (
          <span className="text-[11px] text-ink-muted font-medium hidden sm:block">
            Step {currentStep} of 6
          </span>
        )}

        {/* Overall score — shown once match score is done */}
        {overallScore && (
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 shadow-card border border-cream-border">
            <TrendingUp size={14} className="text-brand hidden sm:block" />
            <span className="text-[10px] text-ink-muted uppercase tracking-widest font-semibold hidden sm:block">
              Fit
            </span>
            <span className="text-lg font-bold gradient-text score-number">{overallScore}%</span>
          </div>
        )}

        {verdict && (
          <Badge variant={verdict.variant} size="sm" className="hidden sm:inline-flex">
            {verdict.label}
          </Badge>
        )}
      </div>
    </header>
  );
}

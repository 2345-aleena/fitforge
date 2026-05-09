import { STEPS } from "./StepProgress.jsx";
import { Sparkles, RotateCcw, Copy, Check } from "lucide-react";
import { useState } from "react";
import ScoreRing from "./ui/ScoreRing.jsx";

export default function CompletionScreen({ moduleResults, onStartNew }) {
  const [copied, setCopied] = useState(false);

  const overallScore = moduleResults.match?.overall ?? 0;

  const handleCopy = () => {
    const lines = STEPS.map((s) => {
      const insight = moduleResults[s.key]?.keyInsight;
      return insight ? `${s.icon} ${s.name}: ${insight}` : null;
    })
      .filter(Boolean)
      .join("\n");

    const text = `FitForge Career Intelligence Report\n${"─".repeat(40)}\nOverall Fit Score: ${overallScore}%\n\n${lines}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="module-enter flex flex-col items-center gap-6 py-8 px-4 max-w-2xl mx-auto">
      {/* Hero */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-green flex items-center justify-center mx-auto mb-4 shadow-glow-green">
          <Sparkles size={28} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-ink mb-1">Analysis Complete</h2>
        <p className="text-[13px] text-ink-muted">Your full career intelligence report is ready</p>
      </div>

      {/* Score ring */}
      <div className="flex flex-col items-center gap-2">
        <ScoreRing score={overallScore} size={140} strokeWidth={11} label="Overall Fit" />
      </div>

      {/* Key insights summary */}
      <div className="w-full bg-white rounded-2xl border border-cream-border shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-cream-border bg-cream-50">
          <p className="text-[12px] font-bold text-ink uppercase tracking-widest">
            6 Key Insights
          </p>
        </div>
        <div className="divide-y divide-cream-border">
          {STEPS.map((step) => {
            const insight = moduleResults[step.key]?.keyInsight;
            return (
              <div key={step.id} className="flex items-start gap-3 px-5 py-3">
                <span className="text-base shrink-0 mt-0.5">{step.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide mb-0.5">
                    {step.name}
                  </p>
                  <p className="text-[13px] text-ink-secondary leading-snug">
                    {insight ?? "—"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 w-full">
        <button
          onClick={onStartNew}
          className="flex-1 flex items-center justify-center gap-2 bg-white border border-cream-dark text-ink-secondary text-[13px] font-semibold rounded-xl py-3 hover:bg-cream-100 transition-all active:scale-95"
        >
          <RotateCcw size={15} />
          Start New Analysis
        </button>
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-brand text-white text-[13px] font-semibold rounded-xl py-3 shadow-glow hover:shadow-[0_0_32px_rgba(108,95,230,0.5)] transition-all active:scale-95"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? "Copied!" : "Copy Report"}
        </button>
      </div>
    </div>
  );
}

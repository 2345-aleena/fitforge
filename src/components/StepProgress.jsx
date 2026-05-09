export const STEPS = [
  { id: 1, key: "match",     name: "Match Score",        icon: "📊" },
  { id: 2, key: "personas",  name: "Recruiter Personas", icon: "🎭" },
  { id: 3, key: "skillGap",  name: "Skill Gap",          icon: "🎯" },
  { id: 4, key: "skillDecay",name: "Skill Decay",        icon: "⏳" },
  { id: 5, key: "interview", name: "Interview Prep",     icon: "💬" },
  { id: 6, key: "jobs",      name: "Job Discovery",      icon: "🔍" },
];

export default function StepProgress({ currentStep, moduleResults, moduleLoading, onEditInputs }) {
  return (
    <nav className="flex-1 px-3 py-3 overflow-y-auto flex flex-col gap-1">
      <div className="flex items-center justify-between px-2 mb-3">
        <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-widest">
          Analysis Steps
        </p>
        <button
          onClick={onEditInputs}
          className="text-[10px] text-brand font-semibold hover:text-brand-dark transition-colors"
        >
          Edit Inputs
        </button>
      </div>

      {STEPS.map((step) => {
        const isDone = currentStep > step.id;
        const isActive = currentStep === step.id;
        const isLocked = currentStep < step.id;
        const isLoading = isActive && moduleLoading;
        const result = moduleResults[step.key];
        const insight = result?.keyInsight;

        return (
          <div
            key={step.id}
            className={`rounded-xl px-3 py-2.5 transition-all ${
              isActive
                ? "bg-brand-light border border-brand/20 shadow-sm"
                : isDone
                ? "bg-emerald-50 border border-emerald-200"
                : "bg-cream-50 border border-cream-border opacity-50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {/* Step circle */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isActive
                    ? "bg-brand text-white"
                    : "bg-cream-200 text-ink-muted"
                }`}
              >
                {isDone ? "✓" : step.id}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px]">{step.icon}</span>
                  <span
                    className={`text-[12px] font-semibold truncate ${
                      isActive ? "text-brand-text" : isDone ? "text-emerald-700" : "text-ink-muted"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>

                {/* Key insight under completed steps */}
                {isDone && insight && (
                  <p className="text-[10px] text-ink-muted leading-snug mt-0.5 line-clamp-2">
                    {insight}
                  </p>
                )}

                {/* Loading indicator */}
                {isLoading && (
                  <p className="text-[10px] text-brand mt-0.5 flex items-center gap-1">
                    <span className="w-2 h-2 border border-brand border-t-transparent rounded-full animate-spin inline-block" />
                    Analyzing...
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

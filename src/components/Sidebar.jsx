import { Zap, BarChart2, Users, GitBranch, Clock, MessageSquare, Briefcase, FileText, Sparkles } from "lucide-react";

const NAV_ITEMS = [
  { id: "match", label: "Match Score", icon: BarChart2, color: "text-violet-500" },
  { id: "personas", label: "Personas", icon: Users, color: "text-cyan-500" },
  { id: "skillgap", label: "Skill Gap", icon: GitBranch, color: "text-emerald-500" },
  { id: "skilldecay", label: "Skill Decay", icon: Clock, color: "text-amber-500" },
  { id: "interview", label: "Interview Prep", icon: MessageSquare, color: "text-rose-500" },
  { id: "jobs", label: "Job Discovery", icon: Briefcase, color: "text-brand" },
];

export default function Sidebar({
  activeModule,
  onModuleClick,
  moduleStatus,
  hasResults,
  resume,
  setResume,
  jd,
  setJd,
  onAnalyze,
  onSample,
  isLoading,
}) {
  const canAnalyze = resume.trim().length > 50 && jd.trim().length > 50;

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-cream-border flex flex-col shrink-0 shadow-card">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-cream-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow" style={{ animation: "pulse-glow 2s ease-in-out infinite" }}>
            <Zap size={15} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-ink text-[15px] gradient-text">FitForge</span>
            <p className="text-[10px] text-ink-muted leading-none mt-0.5">AI Resume Intelligence</p>
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="px-4 py-4 border-b border-cream-border space-y-3 flex-shrink-0">
        <div>
          <label className="block text-[10px] font-semibold text-ink-muted uppercase tracking-widest mb-1.5">
            Resume
          </label>
          <textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste your resume text here..."
            rows={5}
            className="w-full text-[12px] bg-cream-50 border border-cream-border rounded-xl px-3 py-2 text-ink placeholder-ink-muted resize-none focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all depth-inset"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-ink-muted uppercase tracking-widest mb-1.5">
            Job Description
          </label>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the job description here..."
            rows={4}
            className="w-full text-[12px] bg-cream-50 border border-cream-border rounded-xl px-3 py-2 text-ink placeholder-ink-muted resize-none focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all depth-inset"
          />
        </div>

        <button
          onClick={onAnalyze}
          disabled={isLoading || !canAnalyze}
          className="w-full flex items-center justify-center gap-2 bg-gradient-brand text-white text-[13px] font-semibold rounded-xl py-2.5 shadow-glow hover:shadow-[0_0_32px_rgba(108,95,230,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all active:scale-95"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Analyze Resume
            </>
          )}
        </button>

        <button
          onClick={onSample}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-brand-light border border-brand/20 text-brand-text text-[12px] font-medium rounded-xl py-2 hover:bg-brand/10 disabled:opacity-50 transition-all active:scale-95"
        >
          <FileText size={13} />
          Try with sample data
        </button>
      </div>

      {/* Navigation */}
      {hasResults && (
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-widest px-2 mb-2">
            Analysis Modules
          </p>
          {NAV_ITEMS.map(({ id, label, icon: Icon, color }) => {
            const status = moduleStatus[id];
            const isActive = activeModule === id;

            return (
              <button
                key={id}
                onClick={() => onModuleClick(id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[12px] font-medium transition-all text-left group ${
                  isActive
                    ? "bg-brand-light text-brand-text shadow-sm border border-brand/15"
                    : "text-ink-secondary hover:bg-cream-100 hover:text-ink"
                }`}
              >
                <Icon
                  size={14}
                  className={isActive ? "text-brand" : `${color} opacity-70 group-hover:opacity-100`}
                />
                <span className="flex-1">{label}</span>
                {status === "loading" && (
                  <span className="w-3.5 h-3.5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                )}
                {status === "done" && (
                  <span className="w-4 h-4 rounded-full bg-gradient-green flex items-center justify-center shadow-sm">
                    <span className="text-white text-[9px] font-bold">✓</span>
                  </span>
                )}
                {status === "error" && (
                  <span className="w-4 h-4 rounded-full bg-gradient-red flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold">!</span>
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      )}
    </aside>
  );
}

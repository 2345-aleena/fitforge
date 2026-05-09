import { Zap, FileText, Sparkles } from "lucide-react";
import StepProgress from "./StepProgress.jsx";

export default function Sidebar({
  // input mode
  resume, setResume, jd, setJd,
  onStartAnalysis, onSample, isLoading,
  // step mode
  currentStep, moduleResults, moduleLoading,
  onEditInputs,
}) {
  const isInputMode = currentStep === 0;
  const canStart = resume.trim().length > 50 && jd.trim().length > 50;

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-cream-border flex flex-col shrink-0 shadow-card">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-cream-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow"
            style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
          >
            <Zap size={15} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-[15px] gradient-text">FitForge</span>
            <p className="text-[10px] text-ink-muted leading-none mt-0.5">AI Resume Intelligence</p>
          </div>
        </div>
      </div>

      {/* ── INPUT MODE ── */}
      {isInputMode && (
        <div className="flex-1 flex flex-col px-4 py-4 space-y-3 overflow-y-auto">
          <div>
            <label className="block text-[10px] font-semibold text-ink-muted uppercase tracking-widest mb-1.5">
              Resume
            </label>
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your resume text here..."
              rows={7}
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
              rows={6}
              className="w-full text-[12px] bg-cream-50 border border-cream-border rounded-xl px-3 py-2 text-ink placeholder-ink-muted resize-none focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all depth-inset"
            />
          </div>

          <button
            onClick={onStartAnalysis}
            disabled={isLoading || !canStart}
            className="w-full flex items-center justify-center gap-2 bg-gradient-brand text-white text-[13px] font-semibold rounded-xl py-2.5 shadow-glow hover:shadow-[0_0_32px_rgba(108,95,230,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all active:scale-95"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Start Analysis
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
      )}

      {/* ── STEP MODE — show collapsed inputs + step progress ── */}
      {!isInputMode && (
        <>
          {/* Collapsed input summary */}
          <div className="px-4 py-3 border-b border-cream-border shrink-0">
            <div className="bg-cream-50 rounded-xl p-3 border border-cream-border">
              <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-widest mb-1">
                Resume
              </p>
              <p className="text-[11px] text-ink-secondary line-clamp-2 leading-snug">
                {resume.slice(0, 80)}...
              </p>
              <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-widest mt-2 mb-1">
                Job Description
              </p>
              <p className="text-[11px] text-ink-secondary line-clamp-2 leading-snug">
                {jd.slice(0, 80)}...
              </p>
            </div>
          </div>

          {/* Step progress */}
          <StepProgress
            currentStep={currentStep}
            moduleResults={moduleResults}
            moduleLoading={moduleLoading}
            onEditInputs={onEditInputs}
          />
        </>
      )}
    </aside>
  );
}

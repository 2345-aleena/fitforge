import { useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import TopBar from "./components/TopBar.jsx";
import CompletionScreen from "./components/CompletionScreen.jsx";
import MatchScore from "./components/modules/MatchScore.jsx";
import PersonaSimulator from "./components/modules/PersonaSimulator.jsx";
import SkillGap from "./components/modules/SkillGap.jsx";
import SkillDecay from "./components/modules/SkillDecay.jsx";
import InterviewPrep from "./components/modules/InterviewPrep.jsx";
import JobDiscovery from "./components/modules/JobDiscovery.jsx";
import { SAMPLE_RESUME, SAMPLE_JD } from "./constants/sampleData.js";
import {
  analyzeMatchScore,
  analyzePersonas,
  analyzeSkillGap,
  analyzeSkillDecay,
  analyzeInterview,
  analyzeJobs,
} from "./services/gemini.js";
import { Sparkles, BarChart2, Users, GitBranch, Clock, MessageSquare, Briefcase, RotateCcw, ChevronRight } from "lucide-react";

// ─── Step config ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, key: "match",      name: "Match Score",        icon: "📊", next: "Recruiter Personas" },
  { id: 2, key: "personas",   name: "Recruiter Personas", icon: "🎭", next: "Skill Gap Analysis"  },
  { id: 3, key: "skillGap",   name: "Skill Gap",          icon: "🎯", next: "Skill Decay"         },
  { id: 4, key: "skillDecay", name: "Skill Decay",        icon: "⏳", next: "Interview Prep"      },
  { id: 5, key: "interview",  name: "Interview Prep",     icon: "💬", next: "Job Discovery"       },
  { id: 6, key: "jobs",       name: "Job Discovery",      icon: "🔍", next: null                  },
];

const MODULE_ANALYZERS = [
  null,
  (r, j) => analyzeMatchScore(r, j),
  (r, j) => analyzePersonas(r, j),
  (r, j) => analyzeSkillGap(r, j),
  (r, j) => analyzeSkillDecay(r, j),
  (r, j) => analyzeInterview(r, j),
  (r)    => analyzeJobs(r),
];

const EMPTY_RESULTS = {
  match: null, personas: null, skillGap: null,
  skillDecay: null, interview: null, jobs: null,
};

const FEATURE_CARDS = [
  { icon: BarChart2,     label: "Match Score",         color: "text-violet-500",  bg: "bg-violet-50 border-violet-200"   },
  { icon: Users,         label: "Recruiter Personas",  color: "text-cyan-500",    bg: "bg-cyan-50 border-cyan-200"       },
  { icon: GitBranch,     label: "Skill Gap Analysis",  color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200" },
  { icon: Clock,         label: "Skill Decay",         color: "text-amber-500",   bg: "bg-amber-50 border-amber-200"     },
  { icon: MessageSquare, label: "Interview Prep",      color: "text-rose-500",    bg: "bg-rose-50 border-rose-200"       },
  { icon: Briefcase,     label: "Job Discovery",       color: "text-brand",       bg: "bg-brand-light border-brand/20"   },
];

export default function App() {
  const [resume, setResume]           = useState("");
  const [jd, setJd]                   = useState("");
  const [currentStep, setCurrentStep] = useState(0);   // 0 = input, 1-6 = modules, 7 = complete
  const [moduleResults, setModuleResults] = useState(EMPTY_RESULTS);
  const [moduleLoading, setModuleLoading] = useState(false);
  const [moduleError, setModuleError]     = useState(null);
  const [sidebarOpen, setSidebarOpen]     = useState(false);

  const currentStepConfig = STEPS.find((s) => s.id === currentStep);

  // ─── Run a single step's analysis ─────────────────────────────────────────
  async function runStep(step) {
    setModuleLoading(true);
    setModuleError(null);
    try {
      const result = await MODULE_ANALYZERS[step](resume, jd);
      const key = STEPS.find((s) => s.id === step)?.key;
      setModuleResults((prev) => ({ ...prev, [key]: result }));
    } catch (err) {
      const msg = err.message ?? "Analysis failed";
      const friendly = msg.includes("429") || msg.includes("limit")
        ? "API limit reached. Please wait 30 seconds then click Reanalyze."
        : msg.includes("quota")
        ? "API quota exceeded. Wait a minute then click Reanalyze."
        : "Analysis failed. Click Reanalyze to try again.";
      setModuleError(friendly);
    } finally {
      setModuleLoading(false);
    }
  }

  // ─── Start analysis — go to step 1 ────────────────────────────────────────
  const handleStartAnalysis = async () => {
    if (!resume.trim() || !jd.trim()) return;
    setModuleResults(EMPTY_RESULTS);
    setModuleError(null);
    setCurrentStep(1);
    setSidebarOpen(false);
    await runStep(1);
  };

  // ─── Next step ─────────────────────────────────────────────────────────────
  const handleNext = async () => {
    if (moduleLoading || moduleError) return;
    if (currentStep === 6) {
      setCurrentStep(7); // completion screen
      return;
    }
    const next = currentStep + 1;
    setCurrentStep(next);
    await runStep(next);
  };

  // ─── Reanalyze current step ────────────────────────────────────────────────
  const handleReanalyze = async () => {
    if (moduleLoading) return;
    await runStep(currentStep);
  };

  // ─── Edit inputs — go back to step 0 ──────────────────────────────────────
  const handleEditInputs = () => {
    setCurrentStep(0);
    setModuleError(null);
    setSidebarOpen(false);
  };

  // ─── Reset everything ─────────────────────────────────────────────────────
  const handleStartNew = () => {
    setCurrentStep(0);
    setModuleResults(EMPTY_RESULTS);
    setModuleError(null);
    setResume("");
    setJd("");
  };

  const handleSample = () => {
    setResume(SAMPLE_RESUME);
    setJd(SAMPLE_JD);
  };

  const overallScore = moduleResults.match?.overall ?? null;

  // ─── Render current module ─────────────────────────────────────────────────
  function renderModule() {
    const key = currentStepConfig?.key;
    const data = moduleResults[key];

    const moduleProps = { data, isLoading: moduleLoading, onRetry: handleReanalyze };

    if (currentStep === 1) return <MatchScore      {...moduleProps} />;
    if (currentStep === 2) return <PersonaSimulator {...moduleProps} />;
    if (currentStep === 3) return <SkillGap         {...moduleProps} />;
    if (currentStep === 4) return <SkillDecay        {...moduleProps} />;
    if (currentStep === 5) return <InterviewPrep     {...moduleProps} />;
    if (currentStep === 6) return <JobDiscovery      {...moduleProps} />;
    return null;
  }

  return (
    <div
      className="flex min-h-screen font-sans"
      style={{ background: "linear-gradient(160deg, #FAF8F4 0%, #F0EDF8 50%, #FAF8F4 100%)" }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:static inset-y-0 left-0 z-40 md:z-auto
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <Sidebar
          resume={resume} setResume={setResume}
          jd={jd} setJd={setJd}
          onStartAnalysis={handleStartAnalysis}
          onSample={handleSample}
          isLoading={moduleLoading && currentStep === 0}
          currentStep={currentStep}
          moduleResults={moduleResults}
          moduleLoading={moduleLoading}
          onEditInputs={handleEditInputs}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          currentStep={currentStep}
          overallScore={overallScore}
          moduleLoading={moduleLoading}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 flex flex-col overflow-y-auto relative">
          {/* Background orbs */}
          <div className="orb w-96 h-96 bg-violet-400 pointer-events-none"
            style={{ position: "fixed", top: "-10%", right: "-5%", zIndex: 0 }} />
          <div className="orb w-64 h-64 bg-emerald-400 pointer-events-none"
            style={{ position: "fixed", bottom: "10%", left: "-5%", zIndex: 0 }} />

          {/* ── STEP 0: Welcome / Input screen ── */}
          {currentStep === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10 px-4 py-8">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-brand flex items-center justify-center shadow-glow animate-float">
                  <Sparkles size={36} className="text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-green flex items-center justify-center shadow-sm">
                  <span className="text-white text-[10px] font-bold">AI</span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-ink mb-2">
                <span className="gradient-text">FitForge</span>
              </h1>
              <p className="text-[15px] text-ink-secondary max-w-md leading-relaxed mb-2">
                AI-powered resume intelligence platform
              </p>
              <p className="text-[13px] text-ink-muted max-w-sm leading-relaxed mb-8">
                Paste your resume and job description in the sidebar, then click{" "}
                <strong className="text-brand">Start Analysis</strong> to begin your guided
                6-step career intelligence session.
              </p>

              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden mb-6 flex items-center gap-2 bg-gradient-brand text-white text-[13px] font-semibold rounded-xl px-5 py-2.5 shadow-glow"
              >
                <Sparkles size={14} /> Open Input Panel
              </button>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg w-full">
                {FEATURE_CARDS.map(({ icon: Icon, label, color, bg }) => (
                  <div key={label} className="card-3d flex items-center gap-2.5 bg-white border border-cream-border rounded-xl px-3 py-3 shadow-card">
                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${bg}`}>
                      <Icon size={13} className={color} />
                    </div>
                    <span className="text-[12px] font-medium text-ink-secondary">{label}</span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-ink-muted mt-8">
                Powered by Google Gemini · One module at a time · Free to use
              </p>
            </div>
          )}

          {/* ── STEPS 1-6: Module view ── */}
          {currentStep >= 1 && currentStep <= 6 && (
            <div className="flex-1 flex flex-col relative z-10">
              {/* Step header */}
              <div className="px-4 md:px-6 pt-5 pb-3">
                <div className="flex items-center gap-2 mb-3">
                  {/* Progress dots */}
                  <div className="flex items-center gap-1.5">
                    {STEPS.map((s) => (
                      <div
                        key={s.id}
                        className={`rounded-full transition-all duration-300 ${
                          s.id < currentStep
                            ? "w-2 h-2 bg-emerald-500"
                            : s.id === currentStep
                            ? "w-3 h-3 bg-brand"
                            : "w-2 h-2 bg-cream-dark"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-ink-muted font-medium ml-1">
                    Step {currentStep} of 6
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xl">{currentStepConfig?.icon}</span>
                  <h2 className="text-[18px] font-bold text-ink">{currentStepConfig?.name}</h2>
                </div>
              </div>

              {/* Module content — scrollable */}
              <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-32">
                <div className="module-enter" key={currentStep}>
                  {renderModule()}
                </div>
              </div>

              {/* ── Sticky bottom action bar ── */}
              <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white/95 backdrop-blur-xl border-t border-cream-border px-4 md:px-6 py-3 flex items-center justify-between gap-3 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                {/* Reanalyze */}
                <button
                  onClick={handleReanalyze}
                  disabled={moduleLoading}
                  className="flex items-center gap-2 bg-white border border-cream-dark text-ink-secondary text-[13px] font-semibold rounded-xl px-4 py-2.5 hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <RotateCcw size={14} />
                  Reanalyze
                </button>

                {/* Error message */}
                {moduleError && (
                  <p className="flex-1 text-[12px] text-rose-600 font-medium text-center px-2">
                    {moduleError}
                  </p>
                )}

                {/* Next */}
                <button
                  onClick={handleNext}
                  disabled={moduleLoading || !!moduleError || !moduleResults[currentStepConfig?.key]}
                  className="flex items-center gap-2 bg-gradient-brand text-white text-[13px] font-semibold rounded-xl px-5 py-2.5 shadow-glow hover:shadow-[0_0_24px_rgba(108,95,230,0.5)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all active:scale-95"
                >
                  {currentStep === 6 ? (
                    <>✓ Complete — View Summary</>
                  ) : (
                    <>
                      Next: {currentStepConfig?.next}
                      <ChevronRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 7: Completion screen ── */}
          {currentStep === 7 && (
            <div className="flex-1 overflow-y-auto relative z-10 py-6">
              <CompletionScreen
                moduleResults={moduleResults}
                onStartNew={handleStartNew}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

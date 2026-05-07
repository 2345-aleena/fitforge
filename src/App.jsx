import { useState, useRef } from "react";
import Sidebar from "./components/Sidebar.jsx";
import TopBar from "./components/TopBar.jsx";
import MatchScore from "./components/modules/MatchScore.jsx";
import PersonaSimulator from "./components/modules/PersonaSimulator.jsx";
import SkillGap from "./components/modules/SkillGap.jsx";
import SkillDecay from "./components/modules/SkillDecay.jsx";
import InterviewPrep from "./components/modules/InterviewPrep.jsx";
import JobDiscovery from "./components/modules/JobDiscovery.jsx";
import { SAMPLE_RESUME, SAMPLE_JD } from "./constants/sampleData.js";
import { analyzeAll } from "./services/gemini.js";
import { Sparkles, BarChart2, Users, GitBranch, Clock, MessageSquare, Briefcase } from "lucide-react";

const MODULE_IDS = ["match", "personas", "skillgap", "skilldecay", "interview", "jobs"];

const INITIAL_STATUS = {
  match: "idle",
  personas: "idle",
  skillgap: "idle",
  skilldecay: "idle",
  interview: "idle",
  jobs: "idle",
};

const FEATURE_CARDS = [
  { icon: BarChart2,     label: "Match Score",        color: "text-violet-500",  bg: "bg-violet-50 border-violet-200"   },
  { icon: Users,         label: "Recruiter Personas",  color: "text-cyan-500",    bg: "bg-cyan-50 border-cyan-200"       },
  { icon: GitBranch,     label: "Skill Gap Analysis",  color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200" },
  { icon: Clock,         label: "Skill Decay Timeline",color: "text-amber-500",   bg: "bg-amber-50 border-amber-200"     },
  { icon: MessageSquare, label: "Interview Prep",       color: "text-rose-500",    bg: "bg-rose-50 border-rose-200"       },
  { icon: Briefcase,     label: "Job Discovery",        color: "text-brand",       bg: "bg-brand-light border-brand/20"   },
];

export default function App() {
  const [resume, setResume]           = useState("");
  const [jd, setJd]                   = useState("");
  const [isLoading, setIsLoading]     = useState(false);
  const [hasResults, setHasResults]   = useState(false);
  const [activeModule, setActiveModule] = useState("match");
  const [moduleStatus, setModuleStatus] = useState(INITIAL_STATUS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [results, setResults] = useState({
    match: null, personas: null, skillgap: null,
    skilldecay: null, interview: null, jobs: null,
  });

  const sectionRefs = {
    match:      useRef(null),
    personas:   useRef(null),
    skillgap:   useRef(null),
    skilldecay: useRef(null),
    interview:  useRef(null),
    jobs:       useRef(null),
  };

  const setAllStatus = (status) =>
    setModuleStatus(Object.fromEntries(MODULE_IDS.map((id) => [id, status])));

  const setAllResults = (data) =>
    setResults(data);

  // ─── Main analysis — 1 API call, all 6 modules ───────────────────────────
  const handleAnalyze = async () => {
    if (!resume.trim() || !jd.trim()) return;

    setIsLoading(true);
    setHasResults(true);
    setActiveModule("match");
    setSidebarOpen(false);

    // Show all modules as loading immediately
    setAllStatus("loading");
    setAllResults({ match: null, personas: null, skillgap: null, skilldecay: null, interview: null, jobs: null });

    try {
      const data = await analyzeAll(resume, jd);

      // Set each module result and mark done as they arrive (all at once from one call)
      setResults(data);
      setAllStatus("done");
    } catch (e) {
      // If the single call fails, mark all modules as errored
      const errResult = { error: e.message };
      setResults({
        match: errResult, personas: errResult, skillgap: errResult,
        skilldecay: errResult, interview: errResult, jobs: errResult,
      });
      setAllStatus("error");
    }

    setIsLoading(false);
  };

  // ─── Retry — re-runs the full single call and restores all modules ────────
  const handleRetry = async (id) => {
    // Mark just this module as loading, keep others intact
    setModuleStatus((prev) => ({ ...prev, [id]: "loading" }));
    setResults((prev) => ({ ...prev, [id]: null }));

    try {
      const data = await analyzeAll(resume, jd);
      // Restore all modules from the fresh call
      setResults(data);
      setAllStatus("done");
    } catch (e) {
      setResults((prev) => ({ ...prev, [id]: { error: e.message } }));
      setModuleStatus((prev) => ({ ...prev, [id]: "error" }));
    }
  };

  const handleSample = () => {
    setResume(SAMPLE_RESUME);
    setJd(SAMPLE_JD);
  };

  const handleModuleClick = (id) => {
    setActiveModule(id);
    setSidebarOpen(false);
    setTimeout(() => {
      sectionRefs[id]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const overallScore = results.match?.overall ?? null;

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
          activeModule={activeModule}
          onModuleClick={handleModuleClick}
          moduleStatus={moduleStatus}
          hasResults={hasResults}
          resume={resume}
          setResume={setResume}
          jd={jd}
          setJd={setJd}
          onAnalyze={handleAnalyze}
          onSample={handleSample}
          isLoading={isLoading}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          overallScore={overallScore}
          isLoading={isLoading}
          hasResults={hasResults}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto relative">
          {/* Background orbs */}
          <div className="orb w-96 h-96 bg-violet-400 pointer-events-none"
            style={{ position: "fixed", top: "-10%", right: "-5%", zIndex: 0 }} />
          <div className="orb w-64 h-64 bg-emerald-400 pointer-events-none"
            style={{ position: "fixed", bottom: "10%", left: "-5%", zIndex: 0 }} />

          {/* Welcome screen */}
          {!hasResults && (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center relative z-10 px-4">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-brand flex items-center justify-center shadow-glow animate-float">
                  <Sparkles size={36} className="text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-green flex items-center justify-center shadow-sm">
                  <span className="text-white text-[10px] font-bold">AI</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-[32px] font-bold text-ink mb-2">
                <span className="gradient-text">FitForge</span>
              </h1>
              <p className="text-[15px] text-ink-secondary max-w-md leading-relaxed mb-2">
                AI-powered resume intelligence platform
              </p>
              <p className="text-[13px] text-ink-muted max-w-sm leading-relaxed mb-8">
                Paste your resume and a job description in the sidebar, then click{" "}
                <strong className="text-brand">Analyze Resume</strong> to get your full career
                intelligence report.
              </p>

              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden mb-6 flex items-center gap-2 bg-gradient-brand text-white text-[13px] font-semibold rounded-xl px-5 py-2.5 shadow-glow"
              >
                <Sparkles size={14} />
                Open Input Panel
              </button>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg w-full">
                {FEATURE_CARDS.map(({ icon: Icon, label, color, bg }) => (
                  <div
                    key={label}
                    className="card-3d flex items-center gap-2.5 bg-white border border-cream-border rounded-xl px-3 py-3 shadow-card"
                  >
                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${bg}`}>
                      <Icon size={13} className={color} />
                    </div>
                    <span className="text-[12px] font-medium text-ink-secondary">{label}</span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-ink-muted mt-8">
                Powered by Google Gemini 2.0 Flash · 1 API call · Free to use
              </p>
            </div>
          )}

          {/* Results */}
          {hasResults && (
            <div className="relative z-10 space-y-6">
              <div ref={sectionRefs.match}>
                <MatchScore
                  data={results.match}
                  isLoading={moduleStatus.match === "loading"}
                  onRetry={() => handleRetry("match")}
                />
              </div>
              <div ref={sectionRefs.personas}>
                <PersonaSimulator
                  data={results.personas}
                  isLoading={moduleStatus.personas === "loading"}
                  onRetry={() => handleRetry("personas")}
                />
              </div>
              <div ref={sectionRefs.skillgap}>
                <SkillGap
                  data={results.skillgap}
                  isLoading={moduleStatus.skillgap === "loading"}
                  onRetry={() => handleRetry("skillgap")}
                />
              </div>
              <div ref={sectionRefs.skilldecay}>
                <SkillDecay
                  data={results.skilldecay}
                  isLoading={moduleStatus.skilldecay === "loading"}
                  onRetry={() => handleRetry("skilldecay")}
                />
              </div>
              <div ref={sectionRefs.interview}>
                <InterviewPrep
                  data={results.interview}
                  isLoading={moduleStatus.interview === "loading"}
                  onRetry={() => handleRetry("interview")}
                />
              </div>
              <div ref={sectionRefs.jobs}>
                <JobDiscovery
                  data={results.jobs}
                  isLoading={moduleStatus.jobs === "loading"}
                  onRetry={() => handleRetry("jobs")}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

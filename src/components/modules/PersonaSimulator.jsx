import { useState } from "react";
import Badge from "../ui/Badge.jsx";
import ProgressBar from "../ui/ProgressBar.jsx";
import KeyInsight from "../KeyInsight.jsx";
import { RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

const PERSONA_THEMES = [
  {
    gradient: "from-violet-500 to-purple-600",
    bg: "from-violet-50 to-purple-50",
    border: "border-violet-200",
    glow: "shadow-[0_0_20px_rgba(139,92,246,0.2)]",
    avatarBg: "bg-gradient-to-br from-violet-400 to-purple-600",
  },
  {
    gradient: "from-cyan-500 to-blue-600",
    bg: "from-cyan-50 to-blue-50",
    border: "border-cyan-200",
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.2)]",
    avatarBg: "bg-gradient-to-br from-cyan-400 to-blue-600",
  },
  {
    gradient: "from-rose-500 to-pink-600",
    bg: "from-rose-50 to-pink-50",
    border: "border-rose-200",
    glow: "shadow-[0_0_20px_rgba(244,63,94,0.2)]",
    avatarBg: "bg-gradient-to-br from-rose-400 to-pink-600",
  },
];

function getVerdictVariant(verdict) {
  const v = verdict?.toLowerCase() ?? "";
  if (v === "pass") return "gradient-green";
  if (v === "maybe") return "gradient-amber";
  return "gradient-red";
}

function PersonaCard({ persona, theme, index }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className={`card-3d bg-white rounded-2xl border ${theme.border} overflow-hidden ${theme.glow} animate-slide-up`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Colored top bar */}
      <div className={`h-1.5 bg-gradient-to-r ${theme.gradient}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`w-11 h-11 rounded-xl ${theme.avatarBg} flex items-center justify-center font-bold text-[13px] text-white shadow-md shrink-0`}
          >
            {persona.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[14px] font-bold text-ink">{persona.type}</span>
              <Badge variant={getVerdictVariant(persona.verdict)} size="sm">
                {persona.verdict}
              </Badge>
            </div>
            <p className="text-[11px] text-ink-muted mt-0.5">Recruiter Perspective</p>
          </div>
        </div>

        {/* Likelihood bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wide">
              Likelihood to advance
            </span>
            <span className="text-[14px] font-bold text-ink">{persona.likelihood}%</span>
          </div>
          <ProgressBar value={persona.likelihood} color="auto" height={6} gradient animated />
        </div>

        {/* Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-[11px] text-ink-muted hover:text-ink font-medium mb-3"
        >
          <span>Internal monologue</span>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {expanded && (
          <>
            {/* Monologue */}
            <blockquote
              className={`text-[12px] text-ink-secondary italic leading-relaxed bg-gradient-to-br ${theme.bg} rounded-xl p-3 border ${theme.border} mb-4`}
            >
              "{persona.monologue}"
            </blockquote>

            {/* Impressed */}
            {persona.impressed?.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-1.5">
                  ✓ Impressed by
                </p>
                <ul className="space-y-1">
                  {persona.impressed.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] text-ink-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concerns */}
            {persona.concerns?.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-rose-500 uppercase tracking-wide mb-1.5">
                  ✗ Concerns
                </p>
                <ul className="space-y-1">
                  {persona.concerns.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] text-ink-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function PersonaSimulator({ data, isLoading, onRetry }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[14px] font-semibold text-ink">Recruiter Persona Simulator</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 shimmer-bg rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[14px] font-semibold text-ink">Recruiter Persona Simulator</span>
          <button onClick={onRetry} className="flex items-center gap-1.5 text-[12px] text-brand font-medium">
            <RefreshCw size={13} /> Retry
          </button>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-[13px]">
          Analysis failed: {data.error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-3d animate-slide-up">
      <div className="mb-4">
        <h2 className="text-[16px] font-bold text-ink">Recruiter Persona Simulator</h2>
        <p className="text-[12px] text-ink-muted mt-0.5">
          How 3 different recruiters react to your resume
        </p>
      </div>
      <KeyInsight text={data.keyInsight} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.personas?.map((persona, i) => (
          <PersonaCard key={i} persona={persona} theme={PERSONA_THEMES[i % PERSONA_THEMES.length]} index={i} />
        ))}
      </div>
    </div>
  );
}

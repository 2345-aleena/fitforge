import { useState } from "react";
import Badge from "../ui/Badge.jsx";
import { RefreshCw, AlertTriangle, Clock } from "lucide-react";

function getStatusConfig(status) {
  if (status === "fresh") return {
    variant: "gradient-green",
    color: "#10B981",
    bg: "bg-emerald-50 border-emerald-200",
    bar: "from-emerald-500 to-emerald-400",
    label: "Fresh",
  };
  if (status === "aging") return {
    variant: "gradient-amber",
    color: "#F59E0B",
    bg: "bg-amber-50 border-amber-200",
    bar: "from-amber-500 to-amber-400",
    label: "Aging",
  };
  return {
    variant: "gradient-red",
    color: "#EF4444",
    bg: "bg-rose-50 border-rose-200",
    bar: "from-rose-500 to-rose-400",
    label: "Stale",
  };
}

function getFreshnessWidth(lastUsed) {
  const currentYear = new Date().getFullYear();
  const yearsAgo = currentYear - lastUsed;
  if (yearsAgo <= 0) return 100;
  if (yearsAgo >= 8) return 5;
  return Math.max(5, 100 - yearsAgo * 12);
}

export default function SkillDecay({ data, isLoading, onRetry }) {
  const [sortBy, setSortBy] = useState("stale");
  const [showJDOnly, setShowJDOnly] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[14px] font-semibold text-ink">Skill Decay Timeline</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 shimmer-bg rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[14px] font-semibold text-ink">Skill Decay Timeline</span>
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

  let skills = [...(data.skills ?? [])];
  if (showJDOnly) skills = skills.filter((s) => s.inJD);
  if (sortBy === "stale") skills.sort((a, b) => a.lastUsed - b.lastUsed);
  else skills.sort((a, b) => a.name.localeCompare(b.name));

  // Use full data.skills (not filtered) for risk check
  const hasRisk = data.riskSummary &&
    data.riskSummary !== "null" &&
    data.riskSummary !== null &&
    (data.skills ?? []).some((s) => s.status === "stale" && s.inJD);

  const freshCount = (data.skills ?? []).filter((s) => s.status === "fresh").length;
  const agingCount = (data.skills ?? []).filter((s) => s.status === "aging").length;
  const staleCount = (data.skills ?? []).filter((s) => s.status === "stale").length;

  return (
    <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-3d animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[16px] font-bold text-ink">Skill Decay Timeline</h2>
          <p className="text-[12px] text-ink-muted mt-0.5">Freshness of skills based on last usage</p>
        </div>
        <Clock size={18} className="text-amber-500" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Fresh", count: freshCount, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
          { label: "Aging", count: agingCount, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
          { label: "Stale", count: staleCount, color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`card-3d rounded-xl border p-3 text-center ${bg}`}>
            <div className={`text-2xl font-bold ${color}`}>{count}</div>
            <div className="text-[11px] text-ink-muted font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* Risk banner */}
      {hasRisk && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 shadow-glow-amber">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[12px] text-amber-800 font-medium">{data.riskSummary}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex gap-1 bg-cream-100 rounded-xl p-1">
          {[
            { key: "stale", label: "Most Stale First" },
            { key: "alpha", label: "Alphabetical" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                sortBy === key
                  ? "bg-white text-ink shadow-sm border border-cream-border"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <button
            type="button"
            role="switch"
            aria-checked={showJDOnly}
            onClick={() => setShowJDOnly(!showJDOnly)}
            className={`w-9 h-5 rounded-full transition-all relative focus:outline-none focus:ring-2 focus:ring-brand/30 ${
              showJDOnly ? "bg-brand shadow-glow" : "bg-cream-dark"
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                showJDOnly ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className="text-[12px] text-ink-secondary font-medium">JD-required only</span>
        </label>
      </div>

      {/* Skill list */}
      <div className="space-y-2.5">
        {skills.map((skill, i) => {
          const config = getStatusConfig(skill.status);
          const width = getFreshnessWidth(skill.lastUsed);
          return (
            <div
              key={i}
              className={`card-3d flex items-center gap-4 p-3.5 rounded-xl border ${config.bg} transition-all`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[13px] font-semibold text-ink">{skill.name}</span>
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-lg text-white"
                    style={{ backgroundColor: config.color }}
                  >
                    {skill.lastUsed}
                  </span>
                  <Badge variant={config.variant} size="xs">{config.label}</Badge>
                  {skill.inJD && (
                    <Badge variant="purple" size="xs">JD Required</Badge>
                  )}
                </div>
                {/* Freshness bar */}
                <div className="w-full bg-white/60 rounded-full overflow-hidden" style={{ height: 5 }}>
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${config.bar} transition-all duration-700`}
                    style={{ width: `${width}%`, boxShadow: `0 0 6px ${config.color}60` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

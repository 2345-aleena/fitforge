import { useState } from "react";
import Badge from "../ui/Badge.jsx";
import { RefreshCw, ArrowRight, CheckCircle, AlertCircle, XCircle } from "lucide-react";

function getSkillConfig(status) {
  if (status === "present") return {
    variant: "gradient-green",
    label: "Present",
    icon: CheckCircle,
    iconColor: "text-emerald-500",
    bg: "bg-emerald-50 border-emerald-200",
    dot: "bg-emerald-400",
  };
  if (status === "weak") return {
    variant: "gradient-amber",
    label: "Weak",
    icon: AlertCircle,
    iconColor: "text-amber-500",
    bg: "bg-amber-50 border-amber-200",
    dot: "bg-amber-400",
  };
  return {
    variant: "gradient-red",
    label: "Missing",
    icon: XCircle,
    iconColor: "text-rose-500",
    bg: "bg-rose-50 border-rose-200",
    dot: "bg-rose-400",
  };
}

export default function SkillGap({ data, isLoading, onRetry }) {
  const [filter, setFilter] = useState("all");

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[14px] font-semibold text-ink">Skill Gap Analysis</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-7 w-20 shimmer-bg rounded-full" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 shimmer-bg rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[14px] font-semibold text-ink">Skill Gap Analysis</span>
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

  const filteredSkills = (data.skills ?? []).filter((s) =>
    filter === "all" ? true : s.importance === filter
  );

  const presentCount = (data.skills ?? []).filter((s) => s.status === "present").length;
  const weakCount = (data.skills ?? []).filter((s) => s.status === "weak").length;
  const missingCount = (data.skills ?? []).filter((s) => s.status === "missing").length;

  return (
    <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-3d animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[16px] font-bold text-ink">Skill Gap Analysis</h2>
          <p className="text-[12px] text-ink-muted mt-0.5">Skills mapped against job requirements</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Present", count: presentCount, color: "from-emerald-500 to-emerald-400", bg: "bg-emerald-50 border-emerald-200" },
          { label: "Weak", count: weakCount, color: "from-amber-500 to-amber-400", bg: "bg-amber-50 border-amber-200" },
          { label: "Missing", count: missingCount, color: "from-rose-500 to-rose-400", bg: "bg-rose-50 border-rose-200" },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`card-3d rounded-xl border p-3 text-center ${bg}`}>
            <div className={`text-2xl font-bold bg-gradient-to-br ${color} bg-clip-text text-transparent`}>
              {count}
            </div>
            <div className="text-[11px] text-ink-muted font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 bg-cream-100 rounded-xl p-1 w-fit">
        {["all", "required", "preferred"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium capitalize transition-all ${
              filter === f
                ? "bg-white text-ink shadow-sm border border-cream-border"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Skill pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filteredSkills.map((skill, i) => {
          const config = getSkillConfig(skill.status);
          return (
            <div
              key={i}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-medium ${config.bg} transition-all hover:scale-105 cursor-default`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
              {skill.name}
            </div>
          );
        })}
      </div>

      {/* Skill detail list */}
      <div className="space-y-2 mb-8">
        {filteredSkills.map((skill, i) => {
          const config = getSkillConfig(skill.status);
          const Icon = config.icon;
          return (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-xl border ${config.bg} transition-all hover:shadow-sm`}
            >
              <Icon size={15} className={`${config.iconColor} shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-semibold text-ink">{skill.name}</span>
                  <span className="text-[10px] text-ink-muted capitalize bg-white/60 px-1.5 py-0.5 rounded-full border border-cream-border">
                    {skill.importance}
                  </span>
                </div>
                {skill.note && (
                  <p className="text-[12px] text-ink-secondary mt-0.5">{skill.note}</p>
                )}
              </div>
              <Badge variant={config.variant} size="xs">{config.label}</Badge>
            </div>
          );
        })}
      </div>

      {/* Rewrites */}
      {data.rewrites?.length > 0 && (
        <div>
          <h3 className="text-[14px] font-bold text-ink mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-lg bg-gradient-brand flex items-center justify-center">
              <ArrowRight size={11} className="text-white" />
            </span>
            Resume Rewrite Suggestions
          </h3>
          <div className="space-y-4">
            {data.rewrites.map((rw, i) => (
              <div key={i} className="rounded-2xl border border-cream-border overflow-hidden shadow-card">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <div className="p-4 bg-rose-50 border-b sm:border-b-0 sm:border-r border-rose-200">
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-2">
                      ✗ Original
                    </p>
                    <p className="text-[12px] text-rose-700 line-through leading-relaxed opacity-70">
                      {rw.original}
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">
                      ✓ Improved
                    </p>
                    <p className="text-[12px] text-emerald-800 leading-relaxed font-medium">{rw.improved}</p>
                  </div>
                </div>
                {rw.reason && (
                  <div className="px-4 py-2.5 bg-brand-light/50 border-t border-brand/10">
                    <p className="text-[11px] text-brand-text">
                      <span className="font-semibold">Why: </span>
                      {rw.reason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

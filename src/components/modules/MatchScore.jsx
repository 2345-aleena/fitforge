import { useEffect, useState } from "react";
import ScoreRing from "../ui/ScoreRing.jsx";
import ProgressBar from "../ui/ProgressBar.jsx";
import Badge from "../ui/Badge.jsx";
import { RefreshCw, TrendingUp, Zap, Award, MessageCircle, BarChart2 } from "lucide-react";

const METRICS = [
  { key: "technical", label: "Technical Skills", icon: Zap, color: "#8B5CF6", gradient: "from-violet-500 to-purple-400" },
  { key: "experience", label: "Experience Level", icon: Award, color: "#06B6D4", gradient: "from-cyan-500 to-cyan-400" },
  { key: "communication", label: "Communication", icon: MessageCircle, color: "#10B981", gradient: "from-emerald-500 to-emerald-400" },
  { key: "trajectory", label: "Career Trajectory", icon: TrendingUp, color: "#F59E0B", gradient: "from-amber-500 to-amber-400" },
];

function getVerdictVariant(score) {
  if (score >= 75) return "gradient-green";
  if (score >= 50) return "gradient-amber";
  return "gradient-red";
}

function MetricCard({ metric, value, index }) {
  const [visible, setVisible] = useState(false);
  const Icon = metric.icon;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 120);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className={`card-3d bg-white rounded-2xl border border-cream-border p-4 shadow-card transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg bg-gradient-to-br ${metric.gradient} flex items-center justify-center shadow-sm`}
          >
            <Icon size={13} className="text-white" />
          </div>
          <span className="text-[12px] font-medium text-ink-secondary">{metric.label}</span>
        </div>
        <span
          className="text-[22px] font-bold score-number"
          style={{ color: metric.color }}
        >
          {value}
        </span>
      </div>
      <ProgressBar value={value} color={metric.color} height={6} gradient animated />
    </div>
  );
}

export default function MatchScore({ data, isLoading, onRetry }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse" />
          <span className="text-[14px] font-semibold text-ink">Match Score Dashboard</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-8 mb-6">
          <div className="w-40 h-40 rounded-full shimmer-bg" />
          <div className="flex-1 space-y-2 w-full">
            <div className="h-4 shimmer-bg rounded-full w-3/4" />
            <div className="h-4 shimmer-bg rounded-full w-full" />
            <div className="h-4 shimmer-bg rounded-full w-2/3" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 shimmer-bg rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[14px] font-semibold text-ink">Match Score Dashboard</span>
          <button onClick={onRetry} className="flex items-center gap-1.5 text-[12px] text-brand hover:text-brand-dark font-medium">
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[16px] font-bold text-ink">Match Score Dashboard</h2>
          <p className="text-[12px] text-ink-muted mt-0.5">AI-powered fit analysis</p>
        </div>
        <Badge variant={getVerdictVariant(data.overall)} size="md">
          {data.verdict}
        </Badge>
      </div>

      {/* Score ring + summary */}
      <div className="flex flex-col sm:flex-row items-center gap-8 mb-8 p-5 bg-gradient-to-br from-cream-50 to-brand-light/30 rounded-2xl border border-cream-border">
        <div className="flex flex-col items-center gap-2 animate-float">
          <ScoreRing score={data.overall} size={160} strokeWidth={13} label="Overall" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-widest mb-2">
            AI Summary
          </p>
          <p className="text-[13px] text-ink-secondary leading-relaxed">{data.summary}</p>
        </div>
      </div>

      {/* Sub-score grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {METRICS.map((metric, i) => (
          <MetricCard key={metric.key} metric={metric} value={data[metric.key] ?? 0} index={i} />
        ))}
      </div>
    </div>
  );
}

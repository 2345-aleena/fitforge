import Badge from "../ui/Badge.jsx";
import ProgressBar from "../ui/ProgressBar.jsx";
import { RefreshCw, Sparkles, TrendingUp, Target, Rocket } from "lucide-react";

const TIER_CONFIG = {
  primary: {
    label: "Direct Match",
    description: "Roles you're clearly qualified for",
    icon: Target,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    badge: "gradient-green",
  },
  adjacent: {
    label: "Adjacent Roles",
    description: "Transferable skills open these doors",
    icon: TrendingUp,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    badge: "gradient-amber",
  },
  stretch: {
    label: "Stretch Roles",
    description: "One gap to close",
    icon: Rocket,
    color: "text-violet-600",
    bg: "bg-violet-50 border-violet-200",
    badge: "gradient",
  },
};

function getFitColor(fit) {
  if (fit >= 80) return "#10B981";
  if (fit >= 60) return "#F59E0B";
  return "#EF4444";
}

function RoleCard({ role, index }) {
  const fitColor = getFitColor(role.fit);

  return (
    <div
      className="card-3d bg-white rounded-2xl border border-cream-border p-4 hover:border-brand/30 transition-all animate-slide-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-[14px] font-bold text-ink leading-snug">{role.title}</h4>
          <p className="text-[11px] text-ink-muted mt-0.5">{role.company_type}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[26px] font-bold score-number" style={{ color: fitColor }}>
            {role.fit}
          </span>
          <p className="text-[10px] text-ink-muted font-semibold uppercase tracking-wide">fit</p>
        </div>
      </div>

      <ProgressBar value={role.fit} color={fitColor} height={5} className="mb-3" gradient animated />

      {/* Signals */}
      {role.signals?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {role.signals.map((signal, i) => (
            <Badge key={i} variant="neutral" size="xs">
              {signal}
            </Badge>
          ))}
        </div>
      )}

      {/* Why unexpected */}
      {role.why_unexpected && (
        <div className="flex items-start gap-2 mt-3 bg-brand-light/40 rounded-xl p-2.5 border border-brand/15">
          <Sparkles size={12} className="text-brand shrink-0 mt-0.5" />
          <p className="text-[11px] text-brand-text italic leading-relaxed font-medium">
            {role.why_unexpected}
          </p>
        </div>
      )}
    </div>
  );
}

export default function JobDiscovery({ data, isLoading, onRetry }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse" />
          <span className="text-[14px] font-semibold text-ink">Passive Job Discovery</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 shimmer-bg rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[14px] font-semibold text-ink">Passive Job Discovery</span>
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

  const tiers = ["primary", "adjacent", "stretch"];

  return (
    <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-3d animate-slide-up">
      <div className="mb-6">
        <h2 className="text-[16px] font-bold text-ink">Passive Job Discovery</h2>
        <p className="text-[12px] text-ink-muted mt-0.5">
          Roles you're a fit for — including ones you might not have considered
        </p>
      </div>

      <div className="space-y-8">
        {tiers.map((tier) => {
          const roles = (data.roles ?? []).filter((r) => r.tier === tier);
          if (roles.length === 0) return null;
          const config = TIER_CONFIG[tier];
          const Icon = config.icon;

          return (
            <div key={tier}>
              <div className={`flex items-center gap-3 mb-4 p-3 rounded-xl border ${config.bg}`}>
                <div className={`w-8 h-8 rounded-lg bg-white border ${config.bg} flex items-center justify-center`}>
                  <Icon size={15} className={config.color} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[13px] font-bold text-ink">{config.label}</h3>
                  <p className="text-[11px] text-ink-muted">{config.description}</p>
                </div>
                <Badge variant={config.badge} size="xs">
                  {roles.length} roles
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((role, i) => (
                  <RoleCard key={i} role={role} index={i} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

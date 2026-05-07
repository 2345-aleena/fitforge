export default function Badge({ children, variant = "neutral", size = "sm", className = "" }) {
  const variants = {
    neutral: "bg-cream-100 text-ink-secondary border border-cream-border",
    purple: "bg-brand-light text-brand-text border border-brand/20",
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border border-amber-200",
    red: "bg-rose-50 text-rose-700 border border-rose-200",
    blue: "bg-cyan-50 text-cyan-700 border border-cyan-200",
    gradient: "bg-gradient-brand text-white border-0 shadow-sm",
    "gradient-green": "bg-gradient-green text-white border-0 shadow-sm",
    "gradient-amber": "bg-gradient-amber text-white border-0 shadow-sm",
    "gradient-red": "bg-gradient-red text-white border-0 shadow-sm",
  };

  const sizes = {
    xs: "text-[10px] px-2 py-0.5",
    sm: "text-[11px] px-2.5 py-0.5",
    md: "text-xs px-3 py-1",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold tracking-wide ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}

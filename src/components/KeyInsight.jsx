export default function KeyInsight({ text }) {
  if (!text) return null;
  return (
    <div className="flex items-start gap-3 bg-brand-light border-l-4 border-brand rounded-r-xl px-4 py-3 mb-5 shadow-sm">
      <span className="text-lg shrink-0 mt-0.5">⚡</span>
      <p className="text-[13px] font-semibold text-brand-text leading-snug">{text}</p>
    </div>
  );
}

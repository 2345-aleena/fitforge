import { useState } from "react";
import Badge from "../ui/Badge.jsx";
import KeyInsight from "../KeyInsight.jsx";
import { RefreshCw, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";

function getDifficultyConfig(difficulty) {
  const d = difficulty?.toLowerCase() ?? "";
  if (d === "standard") return { variant: "purple", bg: "bg-violet-50 border-violet-200" };
  if (d === "probing")  return { variant: "amber",  bg: "bg-amber-50 border-amber-200"   };
  return                       { variant: "red",    bg: "bg-rose-50 border-rose-200"     };
}

function QuestionCard({ question, index }) {
  const [expanded, setExpanded] = useState(false);
  const config = getDifficultyConfig(question.difficulty);
  // support both old (starFramework/anchorExperience) and new (star/anchor) shapes
  const star   = question.star   ?? question.starFramework;
  const anchor = question.anchor ?? question.anchorExperience;

  return (
    <div
      className={`card-3d border rounded-2xl overflow-hidden ${config.bg} animate-slide-up`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/40 transition-all"
      >
        <span className="w-7 h-7 rounded-lg bg-gradient-brand text-white text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <p className="text-[13px] font-semibold text-ink leading-snug flex-1">
              {question.question}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={config.variant} size="xs">{question.difficulty}</Badge>
              {expanded ? <ChevronUp size={14} className="text-ink-muted" /> : <ChevronDown size={14} className="text-ink-muted" />}
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-cream-border bg-white/60 p-4 space-y-4">
          {question.why && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Lightbulb size={11} /> Why they'll ask this
              </p>
              <p className="text-[12px] text-amber-800 font-medium">{question.why}</p>
            </div>
          )}

          {star && (
            <div>
              <p className="text-[10px] font-bold text-brand-text uppercase tracking-widest mb-2.5">
                STAR Answer Framework
              </p>
              <div className="space-y-2.5">
                {Object.entries(star).map(([key, value]) => (
                  <div key={key} className="flex gap-3 bg-brand-light/30 rounded-xl p-3 border border-brand/10">
                    <span className="w-20 text-[10px] font-bold text-brand uppercase tracking-widest shrink-0 mt-0.5">
                      {key}
                    </span>
                    <p className="text-[12px] text-ink-secondary leading-relaxed">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {anchor && (
            <div className="bg-gradient-brand rounded-xl p-3 shadow-glow">
              <p className="text-[10px] font-bold text-white uppercase tracking-widest mb-1.5">
                💡 Anchor Experience
              </p>
              <p className="text-[12px] text-white font-medium">{anchor}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InterviewPrep({ data, isLoading, onRetry }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
          <span className="text-[14px] font-semibold text-ink">Interview Question Predictor</span>
        </div>
        <div className="space-y-3">
          {[1,2,3,4,5].map((i) => <div key={i} className="h-14 shimmer-bg rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[14px] font-semibold text-ink">Interview Question Predictor</span>
          <button onClick={onRetry} className="flex items-center gap-1.5 text-[12px] text-brand font-medium">
            <RefreshCw size={13} /> Reanalyze
          </button>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-[13px]">
          {data.error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-3d animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[16px] font-bold text-ink">Interview Question Predictor</h2>
          <p className="text-[12px] text-ink-muted mt-0.5">Predicted questions with STAR frameworks</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="purple" size="xs">Standard</Badge>
          <Badge variant="amber" size="xs">Probing</Badge>
          <Badge variant="red" size="xs">Curveball</Badge>
        </div>
      </div>

      <KeyInsight text={data.keyInsight} />

      <div className="space-y-3">
        {data.questions?.map((q, i) => <QuestionCard key={i} question={q} index={i} />)}
      </div>
    </div>
  );
}

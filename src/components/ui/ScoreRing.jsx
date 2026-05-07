import { useEffect, useState } from "react";

export default function ScoreRing({ score = 0, size = 160, strokeWidth = 12, label = "Score" }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const step = score / 60;
      const interval = setInterval(() => {
        start += step;
        if (start >= score) {
          setAnimatedScore(score);
          clearInterval(interval);
        } else {
          setAnimatedScore(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(interval);
    }, 200);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = (s) => {
    if (s >= 75) return { stroke: "#10B981", text: "#059669", glow: "rgba(16,185,129,0.4)" };
    if (s >= 50) return { stroke: "#F59E0B", text: "#D97706", glow: "rgba(245,158,11,0.4)" };
    return { stroke: "#EF4444", text: "#DC2626", glow: "rgba(239,68,68,0.4)" };
  };

  const colors = getColor(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Glow ring behind */}
      <div
        className="absolute rounded-full"
        style={{
          width: size - 20,
          height: size - 20,
          boxShadow: `0 0 30px ${colors.glow}`,
          opacity: 0.6,
        }}
      />
      <svg width={size} height={size} className="-rotate-90" style={{ filter: `drop-shadow(0 0 8px ${colors.glow})` }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EDE8DF"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.05s linear" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span
          className="text-4xl font-bold score-number"
          style={{ color: colors.text }}
        >
          {animatedScore}
        </span>
        <span className="text-[10px] text-ink-muted font-semibold uppercase tracking-widest mt-0.5">
          {label}
        </span>
      </div>
    </div>
  );
}

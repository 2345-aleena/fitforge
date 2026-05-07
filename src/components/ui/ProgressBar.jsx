import { useEffect, useState } from "react";

export default function ProgressBar({ value = 0, color = "#6C5FE6", height = 6, className = "", animated = true, gradient = false }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(Math.min(value, 100)), 100);
    return () => clearTimeout(t);
  }, [value]);

  const getAutoColor = (v) => {
    if (v >= 75) return "#10B981";
    if (v >= 50) return "#F59E0B";
    return "#EF4444";
  };

  const getGradient = (v) => {
    if (v >= 75) return "linear-gradient(90deg, #10B981, #34D399)";
    if (v >= 50) return "linear-gradient(90deg, #F59E0B, #FBBF24)";
    return "linear-gradient(90deg, #EF4444, #FB7185)";
  };

  const resolvedColor = color === "auto" ? getAutoColor(value) : color;
  const bg = gradient ? getGradient(value) : resolvedColor;

  return (
    <div
      className={`w-full rounded-full overflow-hidden depth-inset ${className}`}
      style={{ height, backgroundColor: "#EDE8DF" }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          background: bg,
          transition: animated ? "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
          boxShadow: `0 0 8px ${resolvedColor}60`,
        }}
      />
    </div>
  );
}

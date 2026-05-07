module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  safelist: [
    "bg-gradient-brand",
    "bg-gradient-green",
    "bg-gradient-amber",
    "bg-gradient-red",
    "bg-gradient-cyan",
    "animate-float",
    "animate-pulse-glow",
    "animate-shimmer",
    "animate-slide-up",
    "animate-scale-in",
    "animate-spin-slow",
    "card-3d",
    "shimmer-bg",
    "gradient-text",
    "depth-inset",
    "orb",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FAF8F4",
          100: "#F5F2EC",
          200: "#EDE8DF",
          border: "#E8E2D9",
          dark: "#D4CBB8",
        },
        brand: {
          DEFAULT: "#6C5FE6",
          light: "#EBE9FD",
          text: "#4338CA",
          dark: "#5448C8",
          glow: "rgba(108,95,230,0.35)",
        },
        ink: {
          DEFAULT: "#1A1714",
          secondary: "#6B6358",
          muted: "#9C9082",
        },
        // NOTE: Do NOT override violet/rose/cyan/emerald/amber here.
        // We use Tailwind's built-in full palettes for those (50,100,200,etc.)
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        xl2: "20px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        "card-hover": "0 8px 32px rgba(108,95,230,0.15), 0 2px 8px rgba(0,0,0,0.08)",
        glow: "0 0 24px rgba(108,95,230,0.4)",
        "glow-green": "0 0 20px rgba(16,185,129,0.35)",
        "glow-amber": "0 0 20px rgba(245,158,11,0.35)",
        "glow-red": "0 0 20px rgba(239,68,68,0.35)",
        "3d": "0 20px 60px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
        "3d-hover": "0 28px 80px rgba(108,95,230,0.2), 0 12px 30px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.95)",
        inner: "inset 0 2px 6px rgba(0,0,0,0.06)",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #6C5FE6 0%, #8B5CF6 50%, #A78BFA 100%)",
        "gradient-brand-dark": "linear-gradient(135deg, #5448C8 0%, #6C5FE6 100%)",
        "gradient-green": "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
        "gradient-amber": "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
        "gradient-red": "linear-gradient(135deg, #EF4444 0%, #FB7185 100%)",
        "gradient-cyan": "linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)",
        "gradient-page": "linear-gradient(160deg, #FAF8F4 0%, #F0EDF8 50%, #FAF8F4 100%)",
        "gradient-card": "linear-gradient(180deg, #FFFFFF 0%, #FDFCFB 100%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(108,95,230,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(108,95,230,0.6)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "slide-up": "slide-up 0.4s ease-out both",
        "scale-in": "scale-in 0.3s ease-out both",
        "spin-slow": "spin-slow 8s linear infinite",
      },
    },
  },
  plugins: [],
};

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#050507",
          subtle: "#0a0a0f",
          card: "rgba(255,255,255,0.02)",
        },
        accent: {
          DEFAULT: "#7C3AED",
          light: "#A78BFA",
          lighter: "#C4B5FD",
          dark: "#6D28D9",
          glow: "rgba(124,58,237,0.25)",
        },
        muted: {
          DEFAULT: "#71717A",
          dark: "#52525B",
          darker: "#3F3F46",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-cabinet)", "var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        hero: ["clamp(36px, 6vw, 72px)", { lineHeight: "1.04", letterSpacing: "-0.045em" }],
        heading: ["clamp(28px, 4vw, 48px)", { lineHeight: "1.1", letterSpacing: "-0.035em" }],
      },
      borderRadius: {
        card: "18px",
      },
      animation: {
        "gradient": "gradient 5s ease infinite",
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
      },
      keyframes: {
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 4px 24px rgba(37,211,102,0.35)" },
          "50%": { boxShadow: "0 0 0 12px rgba(37,211,102,0.08), 0 4px 24px rgba(37,211,102,0.35)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0A0B0A",        // near-black ground
        paper: "#F6F5F1",      // off-white
        graphite: "#1A1C1A",   // raised surface on dark
        mist: "#8B8F8A",       // muted text on dark
        line: "#232520",       // hairline borders on dark
        signal: "#B4FF39",     // signature accent — electric lime
        rust: "#D97757",       // reserved, used sparingly for status/warning only
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 8vw, 8rem)", { lineHeight: "0.95", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2.25rem, 5vw, 4.5rem)", { lineHeight: "0.98", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(1.75rem, 3vw, 2.75rem)", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
      },
      maxWidth: {
        content: "1400px",
      },
      transitionTimingFunction: {
        engineer: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;

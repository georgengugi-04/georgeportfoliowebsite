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
        // Theme-aware tokens: values live in app/globals.css (dark default, [data-theme="light"] override).
        ink: "rgb(var(--ink) / <alpha-value>)",           // page ground
        paper: "rgb(var(--paper) / <alpha-value>)",       // primary text
        graphite: "rgb(var(--graphite) / <alpha-value>)", // raised surface
        mist: "rgb(var(--mist) / <alpha-value>)",         // muted text
        line: "rgb(var(--line) / <alpha-value>)",         // hairlines
        signal: "rgb(var(--signal) / <alpha-value>)",     // accent (lime on dark, deep green on light for contrast)
        rust: "rgb(var(--rust) / <alpha-value>)",         // errors / warnings only
        // Fixed brand colours that must not change with the theme
        lime: "#B4FF39",
        night: "#0A0B0A",
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

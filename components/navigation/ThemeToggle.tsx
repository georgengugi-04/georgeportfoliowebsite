"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import clsx from "clsx";

type Theme = "light" | "dark";

// variant "icon": compact (small screens). "label": icon + "Light mode"/"Dark mode" text.
export default function ThemeToggle({ variant = "label", className }: { variant?: "icon" | "label"; className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null); // null until mounted → no hydration mismatch

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
    const sync = () => setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
    window.addEventListener("themechange", sync);
    return () => window.removeEventListener("themechange", sync);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* private mode: the choice just won't persist */
    }
    setTheme(next);
    window.dispatchEvent(new Event("themechange")); // keep the other toggles on the page in step
  };

  const toLight = theme !== "light";
  const label = toLight ? "Light mode" : "Dark mode";
  const Icon = toLight ? Sun : Moon;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${label.toLowerCase()}`}
      className={clsx(
        "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-line font-mono text-xs uppercase tracking-wide text-paper transition-colors hover:border-signal hover:text-signal",
        variant === "icon" ? "w-9" : "px-3.5",
        className
      )}
    >
      {theme === null ? <span className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      {variant === "label" && <span>{theme === null ? "Theme" : label}</span>}
    </button>
  );
}

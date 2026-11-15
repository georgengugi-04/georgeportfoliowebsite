"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDown, Pause, Play } from "lucide-react";
import ProjectWorld, { type WorldState } from "@/components/worlds/ProjectWorld";
import { SceneLink } from "@/components/worlds/SceneTransition";
import type { Forest, Mood } from "@/components/lab/living-root/engine";

const moods: { id: Mood; label: string }[] = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
];

const localMood = (): Mood => {
  const h = new Date().getHours();
  return h < 11 ? "morning" : h < 17 ? "afternoon" : "evening";
};

/**
 * Full-viewport opening: the Living Root forest fills the screen, the text sits over a fixed-colour scrim so it is
 * readable in either theme and without WebGL (the poster is a real render of the same scene).
 */
export default function WorldHero() {
  const [mood, setMood] = useState<Mood>("afternoon");
  const [paused, setPaused] = useState(false);
  const [forest, setForest] = useState<Forest | null>(null);
  const [wstate, setWstate] = useState<{ s: WorldState; reason: string | null }>({ s: "idle", reason: null });

  useEffect(() => {
    const m = localMood();
    setMood(m);
  }, []);

  const pick = (m: Mood) => {
    setMood(m);
    forest?.setMood(m);
  };
  const togglePause = () => {
    const next = !paused;
    setPaused(next);
    forest?.setPaused(next);
  };

  return (
    <section aria-labelledby="hero-title" className="relative min-h-[100svh] text-white">
      <ProjectWorld<Forest>
        className="!absolute inset-0"
        poster="/worlds/living-root-hero.jpg"
        posterAlt="A huge ancient tree with exposed roots in a sunlit tropical forest, butterflies in the air."
        posterPriority
        posterPosition="72% 50%"
        onState={(s, reason) => setWstate({ s, reason })}
        deferStart
        lazy={false}
        mount={async ({ canvas, container, reduced, quality }) => {
          const { createForest } = await import("@/components/lab/living-root/engine");
          const f = await createForest({ canvas, container, reduced, quality, mode: "hero", onSelect: () => {}, onGrowth: () => {}, onCinematicEnd: () => {}, onTier: () => {} });
          const m = (new URLSearchParams(window.location.search).get("mood") as Mood | null) ?? localMood();
          f.setMood(m, true);
          setMood(m);
          return f;
        }}
        onReady={(f) => setForest(f)}
      >
        {() => (
          <>
            {/* contrast scrims: left for the title block, bottom for controls */}
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(6,8,6,0.82)_0%,rgba(6,8,6,0.55)_38%,rgba(6,8,6,0)_70%)] max-md:bg-[linear-gradient(180deg,rgba(6,8,6,0.35)_0%,rgba(6,8,6,0.78)_55%,rgba(6,8,6,0.92)_100%)]" />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0b0a] to-transparent" />
          </>
        )}
      </ProjectWorld>

      <div className="container-page relative flex min-h-[100svh] flex-col justify-end pb-24 pt-32 md:pb-28">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#B4FF39]">Nairobi, Kenya · Portfolio</p>
          <h1 id="hero-title" className="mt-5 font-display uppercase leading-[0.9] tracking-[-0.04em]">
            <span className="block text-[clamp(3.4rem,13vw,10.5rem)] font-bold">
              Koshe<span className="text-[#B4FF39]">.exe</span>
            </span>
            <span className="mt-3 block text-[clamp(1.1rem,2.4vw,1.9rem)] font-medium tracking-[0.18em] text-white/90">George Ngugi</span>
          </h1>
          <p className="mt-7 max-w-2xl font-display text-[clamp(1.05rem,1.9vw,1.55rem)] font-medium uppercase leading-snug tracking-tight text-white text-balance">
            I build digital products, intelligent systems and experiences that matter.
          </p>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/80 text-balance">
            Software engineering, mobile development and creative technology — bringing ideas to life through thoughtful engineering and distinctive design.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/work" className="inline-flex items-center gap-2 rounded-full bg-[#B4FF39] px-6 py-3 font-mono text-[13px] font-medium uppercase tracking-wide text-[#0a0b0a] transition-colors hover:bg-white">
              Explore my work
            </Link>
            <SceneLink href="/lab" label="Entering the Lab" className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-black/30 px-6 py-3 font-mono text-[13px] font-medium uppercase tracking-wide text-white transition-colors hover:border-[#B4FF39] hover:text-[#B4FF39]">
              Enter the Lab
            </SceneLink>
            <Link href="/about" className="inline-flex items-center gap-2 px-3 py-3 font-mono text-[13px] font-medium uppercase tracking-wide text-white/85 underline-offset-8 transition-colors hover:text-[#B4FF39] hover:underline">
              About George
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5 lg:pr-24">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/70">Living Root</span>
            {forest ? (<>
            <div role="group" aria-label="Time of day in the forest" className="flex gap-1">
              {moods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={mood === m.id}
                 
                  onClick={() => pick(m.id)}
                  className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors  ${mood === m.id ? "border-[#B4FF39] bg-[#B4FF39] text-[#0a0b0a]" : "border-white/30 text-white/85 hover:border-white"}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={togglePause}
             
              aria-pressed={paused}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-white/85 transition-colors hover:border-white "
            >
              {paused ? <Play className="h-3 w-3" aria-hidden /> : <Pause className="h-3 w-3" aria-hidden />}
              {paused ? "Play motion" : "Pause motion"}
            </button>
            </>) : wstate.s === "static" || wstate.s === "error" ? (
              <span className="font-mono text-[11px] text-white/70">{wstate.reason}</span>
            ) : (
              <span className="font-mono text-[11px] text-white/70" role="status">{wstate.s === "loading" ? "Growing the forest…" : "Preparing the forest…"}</span>
            )}
            <SceneLink href="/lab/living-root" label="Living Root" className="font-mono text-[11px] uppercase tracking-wide text-[#B4FF39] underline-offset-4 hover:underline">
              Explore the forest →
            </SceneLink>
          </div>
          <a href="#lab" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/70 hover:text-white">
            Scroll <ArrowDown className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Forest, Mood } from "./living-root/engine";
import { SPECIES_INFO, type SpeciesId } from "./living-root/species";

type View = "explore" | "inspect" | "cinematic";
type Info = { kind: "tree" } | { kind: "butterfly"; id: SpeciesId } | null;

const SPECIES: SpeciesId[] = ["morpho", "monarch", "swallowtail"];
const MOODS: { id: Mood; label: string }[] = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
];

const chip = (on: boolean) =>
  `rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal disabled:opacity-40 disabled:cursor-not-allowed ${
    on ? "border-signal bg-signal text-ink" : "border-line text-mist hover:border-signal hover:text-signal"
  }`;

const chipDark = (on: boolean) =>
  `rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#B4FF39] ${
    on ? "border-[#B4FF39] bg-[#B4FF39] text-[#0a0b0a]" : "border-white/30 text-white/80 hover:border-[#B4FF39] hover:text-[#B4FF39]"
  }`;

export default function LivingRoot() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const forestRef = useRef<Forest | null>(null);

  const [state, setState] = useState<"loading" | "ready" | "unsupported">("loading");
  const [reduced, setReduced] = useState(false);
  const [view, setView] = useState<View>("explore");
  const [mood, setMood] = useState<Mood>("afternoon");
  const [wind, setWind] = useState(1);
  const [growth, setGrowth] = useState<number | null>(null); // null = not in growth mode
  const [follow, setFollow] = useState<SpeciesId | null>(null);
  const [info, setInfo] = useState<Info>(null);
  const [fs, setFs] = useState(false);
  const [hint, setHint] = useState(true);
  const [status, setStatus] = useState("");
  const [tier, setTier] = useState(0);

  // keep latest handlers reachable from the engine callbacks
  const cbRef = useRef({ setInfo: (_: Info) => {}, setFollow: (_: SpeciesId | null) => {} });
  cbRef.current.setInfo = setInfo;
  cbRef.current.setFollow = (id) => {
    setFollow(id);
    forestRef.current?.follow(id);
  };

  useEffect(() => {
    let disposed = false;
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(rm);
    if (rm) setWind(0);
    const q = new URLSearchParams(window.location.search).get("quality");
    const quality = q === "high" || q === "low" ? q : "auto";

    (async () => {
      try {
        const { createForest } = await import("./living-root/engine");
        if (disposed || !canvasRef.current || !mountRef.current) return;
        const f = await createForest({
          canvas: canvasRef.current,
          container: mountRef.current,
          reduced: rm,
          quality,
          onSelect: (s) => {
            if (s.kind === "butterfly") {
              cbRef.current.setInfo(s);
              cbRef.current.setFollow(s.id);
            } else cbRef.current.setInfo(s);
          },
          onGrowth: (p, done) => setGrowth((g) => (g === null && done ? null : p)),
          onCinematicEnd: () => setView((v) => (v === "cinematic" ? "explore" : v)),
          onTier: (n) => setTier(n),
        });
        if (disposed) {
          f.dispose();
          return;
        }
        forestRef.current = f;
        const m0 = new URLSearchParams(window.location.search).get("mood");
        if (m0 === "morning" || m0 === "afternoon" || m0 === "evening") {
          setMood(m0);
          f.setMood(m0, true);
        }
        setState("ready");
      } catch {
        if (!disposed) setState("unsupported");
      }
    })();

    const onFs = () => {
      setFs(document.fullscreenElement === wrapRef.current);
      forestRef.current?.resize();
    };
    document.addEventListener("fullscreenchange", onFs);
    const t = window.setTimeout(() => setHint(false), 9000);
    return () => {
      disposed = true;
      window.clearTimeout(t);
      document.removeEventListener("fullscreenchange", onFs);
      forestRef.current?.dispose();
      forestRef.current = null;
    };
  }, []);

  const say = (s: string) => setStatus(s);
  const F = () => forestRef.current;

  const chooseView = useCallback(
    (v: View) => {
      const f = F();
      if (!f) return;
      setHint(false);
      setFollow(null);
      setView(v);
      f.follow(null);
      f.setInspect(v === "inspect");
      f.setCinematic(v === "cinematic");
      say(v === "explore" ? "Explore view" : v === "inspect" ? "Root inspection: underground cross-section shown" : "Cinematic view playing");
    },
    []
  );

  const playGrowth = () => {
    const f = F();
    if (!f) return;
    setHint(false);
    setGrowth(0);
    f.startGrowth();
    say(reduced ? "Growth mode: use the slider to scrub through the stages" : "Growth demonstration started");
  };
  const endGrowth = () => {
    F()?.finishGrowth();
    setGrowth(null);
    say("Returned to the full-grown forest");
  };
  const growthActive = growth !== null;

  const pickMood = (m: Mood) => {
    setMood(m);
    F()?.setMood(m);
    say(`${m[0].toUpperCase()}${m.slice(1)} light`);
  };
  const onWind = (v: number) => {
    setWind(v);
    F()?.setWind(v);
  };
  const toggleFollow = (id: SpeciesId) => {
    const f = F();
    if (!f) return;
    setHint(false);
    if (follow === id) {
      setFollow(null);
      f.follow(null);
      setInfo(null);
      say("Stopped following the butterfly");
      return;
    }
    if (view === "inspect") {
      f.setInspect(false);
    }
    setView("explore");
    setFollow(id);
    setInfo({ kind: "butterfly", id });
    f.follow(id);
    say(`Following the ${SPECIES_INFO[id].name} butterfly`);
  };
  const reset = () => {
    const f = F();
    if (!f) return;
    setFollow(null);
    setInfo(null);
    f.resetCamera();
    say("Camera reset");
  };
  const toggleFs = async () => {
    const el = wrapRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await el.requestFullscreen();
    } catch {
      say("Fullscreen is not available in this browser");
    }
  };

  if (state === "unsupported") {
    return (
      <div className="rounded-3xl border border-line bg-graphite p-8 md:p-12" role="img" aria-label="Living Root 2.0 could not start because WebGL is unavailable">
        <p className="eyebrow">Living Root 2.0</p>
        <h2 className="mt-3 font-display text-2xl">This experiment needs WebGL</h2>
        <p className="mt-3 max-w-xl text-mist">
          Your browser or device couldn&apos;t start a WebGL context, so the forest can&apos;t be drawn. It is a real-time 3D scene: a procedurally grown tree and root system, three butterflies,
          a forest floor and moving light. Try a recent desktop browser, or enable hardware acceleration.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className={fs ? "flex h-screen w-screen flex-col bg-ink" : ""}
    >
      <div
        ref={mountRef}
        className={`relative w-full overflow-hidden border border-line bg-[#0e100e] ${fs ? "min-h-0 flex-1" : "h-[72vh] rounded-3xl md:h-[82vh]"}`}
      >
        <canvas
          ref={canvasRef}
          tabIndex={0}
          role="img"
          aria-label="Living Root 2.0: an interactive 3D forest with a large central tree, exposed roots, three butterflies and moving light. Focus the canvas and use the arrow keys to orbit, plus and minus to zoom, and 0 to reset."
          style={{ touchAction: "pan-y" }}
          className={`h-full w-full cursor-grab outline-none transition-opacity duration-700 focus-visible:ring-2 focus-visible:ring-signal active:cursor-grabbing ${state === "ready" ? "opacity-100" : "opacity-0"}`}
        />

        {state === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-xs uppercase tracking-[0.18em] text-mist">Growing the forest…</div>
        )}

        {state === "ready" && (
          <>
            <div className="pointer-events-none absolute left-5 top-5 max-w-[19rem] md:left-7 md:top-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#B4FF39]">Living Root 2.0</p>
              <p className="mt-1 font-display text-xl leading-tight text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)] md:text-2xl">The Breathing Forest</p>
              <p className={`mt-2 text-[13px] leading-snug text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)] transition-opacity duration-700 ${hint ? "opacity-100" : "opacity-0"}`}>
                A procedurally grown tree and its roots, three butterflies and a moving forest floor. Drag to orbit. Tap the tree or a butterfly.
              </p>
            </div>

            {growthActive && (
              <div className="absolute inset-x-5 bottom-5 mx-auto max-w-md rounded-2xl border border-white/15 bg-black/70 p-4 text-white backdrop-blur md:bottom-7">
                <label htmlFor="grow" className="flex items-center justify-between font-mono text-xs uppercase tracking-wide text-white/70">
                  <span>Growth stage</span>
                  <span>{Math.round((growth ?? 0) * 100)}%</span>
                </label>
                <input
                  id="grow"
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={growth ?? 0}
                  onChange={(e) => {
                    const v = +e.target.value;
                    setGrowth(v);
                    F()?.setGrowth(v);
                  }}
                  className="mt-3 w-full accent-[#B4FF39]"
                />
                <p className="mt-2 text-xs text-white/70">Roots first, then the trunk, then branches and leaves.</p>
              </div>
            )}

            {info && !growthActive && (
              <div className="absolute bottom-5 left-5 right-5 max-h-[55%] overflow-auto rounded-2xl border border-white/15 bg-black/75 p-5 text-white backdrop-blur md:bottom-auto md:left-auto md:right-7 md:top-7 md:w-[20rem]" role="region" aria-label="Details">
                <button
                  onClick={() => {
                    setInfo(null);
                    if (follow) {
                      setFollow(null);
                      F()?.follow(null);
                    }
                  }}
                  aria-label="Close details"
                  className="absolute right-3 top-3 rounded-full border border-white/25 px-2.5 py-0.5 font-mono text-xs text-white/70 hover:border-signal hover:text-[#B4FF39] focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
                >
                  ✕
                </button>
                {info.kind === "tree" ? (
                  <>
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#B4FF39]">The central tree</p>
                    <p className="mt-2 font-display text-lg">An ancient tropical canopy tree</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">
                      Procedurally grown, so it is not a specific species. Its widening base, buttress-like flutes and layered crown follow the general shape of rainforest trees.
                    </p>
                    <p className="mt-3 font-mono text-[11px] uppercase tracking-wide text-[#B4FF39]">Its roots</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/70">
                      In rainforests most nutrients sit in the thin topsoil made of fallen leaves, so many trees spread shallow, wide roots instead of one deep taproot. Buttresses help hold the trunk
                      up, and fine roots with fungal partners do most of the absorbing. Try Inspect roots for an illustrative cross-section.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button className={chipDark(false)} onClick={() => { F()?.focusBark(); say("Inspecting the bark"); }}>Inspect bark</button>
                      <button className={chipDark(false)} onClick={() => { F()?.focusFoliage(); say("Inspecting the foliage"); }}>Inspect foliage</button>
                      <button className={chipDark(false)} onClick={() => { setInfo(null); chooseView("inspect"); }}>Show roots</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#B4FF39]">Butterfly</p>
                    <p className="mt-2 font-display text-lg">{SPECIES_INFO[info.id].name}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-white/70">{SPECIES_INFO[info.id].latin}</p>
                    <p className="mt-3 text-sm leading-relaxed text-white/70">{SPECIES_INFO[info.id].blurb}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button className={chipDark(follow === info.id)} aria-pressed={follow === info.id} onClick={() => toggleFollow(info.id as SpeciesId)}>
                        {follow === info.id ? "Following" : "Follow"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className={`${fs ? "max-h-[38vh] overflow-auto bg-ink px-5 pb-5" : "mt-6"} ${state === "ready" ? "" : "pointer-events-none opacity-50"}`}>
        <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
          <fieldset>
            <legend className="font-mono text-[11px] uppercase tracking-[0.18em] text-mist">View</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className={chip(view === "explore")} aria-pressed={view === "explore"} onClick={() => chooseView("explore")}>Explore</button>
              <button className={chip(view === "inspect")} aria-pressed={view === "inspect"} onClick={() => chooseView(view === "inspect" ? "explore" : "inspect")}>Inspect roots</button>
              <button className={chip(view === "cinematic")} aria-pressed={view === "cinematic"} disabled={reduced} onClick={() => chooseView(view === "cinematic" ? "explore" : "cinematic")}>Cinematic</button>
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-mono text-[11px] uppercase tracking-[0.18em] text-mist">Growth</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className={chip(growthActive)} aria-pressed={growthActive} onClick={playGrowth}>{growthActive ? "Replay growth" : "Growth mode"}</button>
              <button className={chip(false)} disabled={!growthActive} onClick={endGrowth}>Return to normal</button>
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-mono text-[11px] uppercase tracking-[0.18em] text-mist">Light</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button key={m.id} className={chip(mood === m.id)} aria-pressed={mood === m.id} onClick={() => pickMood(m.id)}>{m.label}</button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="wind" className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-mist">
              <span>Wind</span>
              <span>{reduced ? "off (reduced motion)" : wind < 0.05 ? "still" : wind < 0.8 ? "breeze" : wind < 1.5 ? "moderate" : "strong"}</span>
            </label>
            <div className="mt-3 flex items-center gap-3">
              <input id="wind" type="range" min={0} max={2} step={0.05} value={wind} disabled={reduced} onChange={(e) => onWind(+e.target.value)} className="w-full accent-[#B4FF39]" />
              <button className={chip(false)} disabled={reduced} onClick={() => { F()?.gust(); say("A gust of wind"); }}>Gust</button>
            </div>
          </div>

          <fieldset>
            <legend className="font-mono text-[11px] uppercase tracking-[0.18em] text-mist">Butterflies</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {SPECIES.map((id) => (
                <button key={id} className={chip(follow === id)} aria-pressed={follow === id} onClick={() => toggleFollow(id)}>
                  {SPECIES_INFO[id].name.replace("-inspired", "")}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-mono text-[11px] uppercase tracking-[0.18em] text-mist">Camera</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className={chip(false)} onClick={reset}>Reset camera</button>
              <button className={chip(false)} aria-label="Zoom out" onClick={() => F()?.zoom(1.2)}>−</button>
              <button className={chip(false)} aria-label="Zoom in" onClick={() => F()?.zoom(0.83)}>+</button>
              <button className={chip(fs)} aria-pressed={fs} onClick={toggleFs}>{fs ? "Exit fullscreen" : "Fullscreen"}</button>
            </div>
          </fieldset>
        </div>
        {tier > 0 && (
          <p className="mt-5 text-xs text-mist">Visual quality was lowered automatically to keep the frame rate smooth on this device.</p>
        )}
        <p className="sr-only" role="status" aria-live="polite">{status}</p>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";

const WAVES = ["triangle", "sine", "square", "sawtooth"] as const;
type Wave = (typeof WAVES)[number];

const NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
const BLACK = new Set([1, 3, 6, 8, 10]);
const START = 60; // middle C
const COUNT = 24; // two octaves, C4–B5
const KEYS = Array.from({ length: COUNT }, (_, i) => ({ midi: START + i, semi: (START + i) % 12 }));
const WHITE = KEYS.filter((k) => !BLACK.has(k.semi));

// computer keyboard: home row = white keys, row above = black keys
const KEYMAP: Record<string, number> = {
  a: 60, w: 61, s: 62, e: 63, d: 64, f: 65, t: 66, g: 67, y: 68, h: 69, u: 70, j: 71, k: 72, o: 73, l: 74, p: 75, ";": 76, "'": 77,
};
const keyLabel: Record<number, string> = Object.fromEntries(Object.entries(KEYMAP).map(([k, m]) => [m, k.toUpperCase()]));

type Note = [number, number]; // [midi (0 = rest), beats]
const r = (arr: Note[], rep: Note[][] = []): Note[] => [...arr, ...rep.flat()];

// All traditional or public-domain melodies.
const TUNES: { name: string; beat: number; notes: Note[] }[] = [
  {
    name: "Twinkle Twinkle", beat: 480,
    notes: [
      [60, 1], [60, 1], [67, 1], [67, 1], [69, 1], [69, 1], [67, 2], [65, 1], [65, 1], [64, 1], [64, 1], [62, 1], [62, 1], [60, 2],
      [67, 1], [67, 1], [65, 1], [65, 1], [64, 1], [64, 1], [62, 2], [67, 1], [67, 1], [65, 1], [65, 1], [64, 1], [64, 1], [62, 2],
      [60, 1], [60, 1], [67, 1], [67, 1], [69, 1], [69, 1], [67, 2], [65, 1], [65, 1], [64, 1], [64, 1], [62, 1], [62, 1], [60, 2],
    ],
  },
  {
    name: "Ode to Joy", beat: 460,
    notes: r(
      [[64, 1], [64, 1], [65, 1], [67, 1], [67, 1], [65, 1], [64, 1], [62, 1], [60, 1], [60, 1], [62, 1], [64, 1], [64, 1.5], [62, 0.5], [62, 2]],
      [[[64, 1], [64, 1], [65, 1], [67, 1], [67, 1], [65, 1], [64, 1], [62, 1], [60, 1], [60, 1], [62, 1], [64, 1], [62, 1.5], [60, 0.5], [60, 2]]]
    ),
  },
  {
    name: "Mary Had a Little Lamb", beat: 420,
    notes: [
      [64, 1], [62, 1], [60, 1], [62, 1], [64, 1], [64, 1], [64, 2], [62, 1], [62, 1], [62, 2], [64, 1], [67, 1], [67, 2],
      [64, 1], [62, 1], [60, 1], [62, 1], [64, 1], [64, 1], [64, 1], [64, 1], [62, 1], [62, 1], [64, 1], [62, 1], [60, 4],
    ],
  },
  {
    name: "Frère Jacques", beat: 440,
    notes: [
      [60, 1], [62, 1], [64, 1], [60, 1], [60, 1], [62, 1], [64, 1], [60, 1], [64, 1], [65, 1], [67, 2], [64, 1], [65, 1], [67, 2],
      [67, 0.5], [69, 0.5], [67, 0.5], [65, 0.5], [64, 1], [60, 1], [67, 0.5], [69, 0.5], [67, 0.5], [65, 0.5], [64, 1], [60, 1],
      [60, 1], [67, 1], [60, 2], [60, 1], [67, 1], [60, 2],
    ],
  },
  {
    name: "Jingle Bells", beat: 330,
    notes: [
      [64, 1], [64, 1], [64, 2], [64, 1], [64, 1], [64, 2], [64, 1], [67, 1], [60, 1.5], [62, 0.5], [64, 4],
      [65, 1], [65, 1], [65, 1.5], [65, 0.5], [65, 1], [64, 1], [64, 1], [64, 0.5], [64, 0.5], [64, 1], [62, 1], [62, 1], [64, 1], [62, 2], [67, 2],
    ],
  },
  {
    name: "Happy Birthday", beat: 560,
    notes: [
      [67, 0.75], [67, 0.25], [69, 1], [67, 1], [72, 1], [71, 2], [67, 0.75], [67, 0.25], [69, 1], [67, 1], [74, 1], [72, 2],
      [67, 0.75], [67, 0.25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 1], [77, 0.75], [77, 0.25], [76, 1], [72, 1], [74, 1], [72, 3],
    ],
  },
  {
    name: "Für Elise", beat: 300,
    notes: [
      [76, 0.5], [75, 0.5], [76, 0.5], [75, 0.5], [76, 0.5], [71, 0.5], [74, 0.5], [72, 0.5], [69, 1.5], [0, 0.5],
      [60, 0.5], [64, 0.5], [69, 0.5], [71, 1.5], [0, 0.5], [64, 0.5], [68, 0.5], [71, 0.5], [72, 1.5], [0, 0.5],
      [64, 0.5], [76, 0.5], [75, 0.5], [76, 0.5], [75, 0.5], [76, 0.5], [71, 0.5], [74, 0.5], [72, 0.5], [69, 2],
    ],
  },
];

const freq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

export default function Piano() {
  const [wave, setWave] = useState<Wave>("triangle");
  const [volume, setVolume] = useState(70);
  const [down, setDown] = useState<Set<number>>(new Set());
  const [playing, setPlaying] = useState(false);
  const [tuneIdx, setTuneIdx] = useState(0);
  const ctx = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);
  const voices = useRef(new Map<number, { osc: OscillatorNode; gain: GainNode }>());
  const opts = useRef({ wave, volume });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  opts.current = { wave, volume };

  const ensure = () => {
    if (!ctx.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx.current = new AC();
      master.current = ctx.current.createGain();
      master.current.connect(ctx.current.destination);
    }
    if (ctx.current.state === "suspended") void ctx.current.resume();
    master.current!.gain.value = (opts.current.volume / 100) * 0.35;
    return ctx.current;
  };

  const mark = (m: number, on: boolean) =>
    setDown((prev) => { const n = new Set(prev); if (on) n.add(m); else n.delete(m); return n; });

  const noteOn = useCallback((m: number) => {
    if (voices.current.has(m)) return;
    const c = ensure();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = opts.current.wave;
    osc.frequency.value = freq(m);
    const t = c.currentTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(1, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.5, t + 0.35);
    osc.connect(gain).connect(master.current!);
    osc.start();
    voices.current.set(m, { osc, gain });
    mark(m, true);
  }, []);

  const noteOff = useCallback((m: number) => {
    const v = voices.current.get(m);
    if (!v || !ctx.current) return;
    const t = ctx.current.currentTime;
    v.gain.gain.cancelScheduledValues(t);
    v.gain.gain.setValueAtTime(Math.max(v.gain.gain.value, 0.0001), t);
    v.gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    v.osc.stop(t + 0.4);
    voices.current.delete(m);
    mark(m, false);
  }, []);

  const stopTune = useCallback(() => {
    timers.current.forEach(clearTimeout); timers.current = [];
    voices.current.forEach((_, m) => noteOff(m));
    setPlaying(false);
  }, [noteOff]);

  const playTune = () => {
    if (playing) { stopTune(); return; }
    ensure(); setPlaying(true);
    const { notes, beat } = TUNES[tuneIdx];
    let at = 100;
    notes.forEach(([m, b]) => {
      if (m) {
        timers.current.push(setTimeout(() => noteOn(m), at));
        timers.current.push(setTimeout(() => noteOff(m), at + b * beat * 0.88));
      }
      at += b * beat;
    });
    timers.current.push(setTimeout(() => setPlaying(false), at + 200));
  };

  useEffect(() => {
    const held = new Set<string>();
    const dn = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      const m = KEYMAP[e.key.toLowerCase()];
      if (m === undefined) return;
      held.add(e.key.toLowerCase()); noteOn(m);
    };
    const up = (e: KeyboardEvent) => { const k = e.key.toLowerCase(); const m = KEYMAP[k]; if (m !== undefined && held.delete(k)) noteOff(m); };
    window.addEventListener("keydown", dn); window.addEventListener("keyup", up);
    const bye = () => { voices.current.forEach((_, m) => noteOff(m)); };
    window.addEventListener("blur", bye);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); window.removeEventListener("blur", bye); };
  }, [noteOn, noteOff]);

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    voices.current.forEach((v) => { try { v.osc.stop(); } catch {} });
    void ctx.current?.close();
  }, []);

  const wPct = 100 / WHITE.length;
  const handlers = (m: number) => ({
    onPointerDown: (e: React.PointerEvent) => { (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId); noteOn(m); },
    onPointerEnter: (e: React.PointerEvent) => { if (e.buttons === 1) noteOn(m); },
    onPointerUp: () => noteOff(m),
    onPointerLeave: () => noteOff(m),
    onPointerCancel: () => noteOff(m),
    onKeyDown: (e: React.KeyboardEvent) => { if ((e.key === "Enter" || e.key === " ") && !e.repeat) { e.preventDefault(); noteOn(m); } },
    onKeyUp: (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") noteOff(m); },
    onBlur: () => noteOff(m),
  });

  return (
    <div>
      <div className="rounded-2xl border border-line bg-night p-3 sm:p-5">
        <div role="group" aria-label="Piano keyboard, C4 to B5" className="relative h-48 select-none touch-none sm:h-64">
          {WHITE.map((k, i) => (
            <button
              key={k.midi} type="button" aria-label={`${NAMES[k.semi]}${Math.floor(k.midi / 12) - 1}`} {...handlers(k.midi)}
              className={clsx("absolute top-0 flex h-full items-end justify-center rounded-b-lg border border-black/30 pb-3 font-mono text-[10px] uppercase text-black/50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B4FF39]", down.has(k.midi) ? "bg-[#B4FF39]" : "bg-[#F6F5F1] hover:bg-white")}
              style={{ left: `${i * wPct}%`, width: `${wPct}%` }}
            >
              <span aria-hidden className="hidden sm:inline">{keyLabel[k.midi]}</span>
            </button>
          ))}
          {KEYS.filter((k) => BLACK.has(k.semi)).map((k) => {
            const idx = WHITE.filter((w) => w.midi < k.midi).length; // white keys to the left
            return (
              <button
                key={k.midi} type="button" aria-label={`${NAMES[k.semi]}${Math.floor(k.midi / 12) - 1}`} {...handlers(k.midi)}
                className={clsx("absolute top-0 z-10 flex h-[60%] items-end justify-center rounded-b-md border border-black pb-2 font-mono text-[9px] uppercase text-white/50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B4FF39]", down.has(k.midi) ? "bg-[#7fbf1f]" : "bg-[#141514] hover:bg-[#262826]")}
                style={{ left: `${idx * wPct - wPct * 0.3}%`, width: `${wPct * 0.6}%` }}
              >
                <span aria-hidden className="hidden sm:inline">{keyLabel[k.midi]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <div>
          <p id="wave-l" className="font-mono text-xs uppercase tracking-wide text-mist">Sound</p>
          <div role="group" aria-labelledby="wave-l" className="mt-3 flex flex-wrap gap-2">
            {WAVES.map((w) => (
              <button key={w} onClick={() => setWave(w)} aria-pressed={wave === w} className={clsx("rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wide transition-colors", wave === w ? "border-signal bg-signal text-ink" : "border-line text-mist hover:border-signal hover:text-signal")}>{w}</button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="pv" className="flex justify-between font-mono text-xs uppercase tracking-wide text-mist"><span>Volume</span><span>{volume}%</span></label>
          <input id="pv" type="range" min={0} max={100} value={volume} onChange={(e) => { setVolume(+e.target.value); if (master.current) master.current.gain.value = (+e.target.value / 100) * 0.35; }} className="mt-3 w-full accent-[#B4FF39]" />
        </div>
        <button onClick={playTune} aria-pressed={playing} className="rounded-full border border-signal px-5 py-2 font-mono text-xs uppercase tracking-wide text-signal transition-colors hover:bg-signal hover:text-ink">
          {playing ? "Stop" : "Play tune"}
        </button>
      </div>
      <div className="mt-8">
        <p id="tune-l" className="font-mono text-xs uppercase tracking-wide text-mist">Auto-play · pick a tune, then press Play</p>
        <div role="group" aria-labelledby="tune-l" className="mt-3 flex flex-wrap gap-2">
          {TUNES.map((t, i) => (
            <button key={t.name} onClick={() => { stopTune(); setTuneIdx(i); }} aria-pressed={tuneIdx === i} className={clsx("rounded-full border px-4 py-2 text-sm transition-colors", tuneIdx === i ? "border-signal bg-signal text-ink" : "border-line text-mist hover:border-signal hover:text-signal")}>{t.name}</button>
          ))}
        </div>
      </div>
      <p className="mt-6 text-sm text-mist">Tap or click the keys (slide across them for a glissando), or play from your computer keyboard: A–L for the white keys, W E T Y U O P for the black ones. Sound starts only after you press something.</p>
    </div>
  );
}

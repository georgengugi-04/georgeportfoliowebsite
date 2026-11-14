"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";

const STEPS = 16;
const SCALE = [0, 3, 5, 7, 10]; // C minor pentatonic: every note sounds good with every other
const NOTE_NAMES = ["C", "E♭", "F", "G", "B♭"];
const midiHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

type Row = { id: string; label: string; kind: "drum" | "tone"; base?: number };
const ROWS: Row[] = [
  { id: "kick", label: "Kick", kind: "drum" },
  { id: "snare", label: "Snare", kind: "drum" },
  { id: "clap", label: "Clap", kind: "drum" },
  { id: "hat", label: "Hi-hat", kind: "drum" },
  { id: "open", label: "Open hat", kind: "drum" },
  { id: "tom", label: "Tom", kind: "drum" },
  { id: "bass", label: "Bass", kind: "tone", base: 36 },
  { id: "pluck", label: "Pluck", kind: "tone", base: 60 },
  { id: "pad", label: "Pad", kind: "tone", base: 48 },
  { id: "bell", label: "Bell", kind: "tone", base: 84 },
];

type Pattern = Record<string, number[]>;
const z = () => Array(STEPS).fill(0) as number[];
const at = (hits: Record<number, number>) => { const a = z(); Object.entries(hits).forEach(([i, v]) => (a[+i] = v)); return a; };
const empty = (): Pattern => Object.fromEntries(ROWS.map((r) => [r.id, z()]));

// Notes in melodic rows are scale degrees 1–5 (C, E♭, F, G, B♭).
const PRESETS: { name: string; bpm: number; pattern: () => Pattern }[] = [
  {
    name: "House", bpm: 122,
    pattern: () => ({
      ...empty(),
      kick: at({ 0: 1, 4: 1, 8: 1, 12: 1 }), clap: at({ 4: 1, 12: 1 }), hat: at({ 0: 1, 3: 1, 4: 1, 7: 1, 8: 1, 11: 1, 12: 1, 15: 1 }), open: at({ 2: 1, 6: 1, 10: 1, 14: 1 }),
      bass: at({ 0: 1, 3: 3, 6: 1, 8: 1, 11: 3, 14: 5 }), pad: at({ 0: 1, 8: 4 }), pluck: at({ 2: 4, 5: 2, 10: 4, 12: 5 }), bell: at({ 6: 5, 13: 4 }),
    }),
  },
  {
    name: "Boom bap", bpm: 90,
    pattern: () => ({
      ...empty(),
      kick: at({ 0: 1, 7: 1, 10: 1 }), snare: at({ 4: 1, 12: 1 }), hat: at({ 0: 1, 2: 1, 4: 1, 6: 1, 8: 1, 10: 1, 12: 1, 14: 1 }), open: at({ 15: 1 }), tom: at({ 14: 1 }),
      bass: at({ 0: 1, 7: 1, 10: 3 }), pad: at({ 0: 3, 8: 1 }), pluck: at({ 3: 4, 11: 2 }), bell: at({ 8: 4 }),
    }),
  },
  {
    name: "Half-time", bpm: 140,
    pattern: () => ({
      ...empty(),
      kick: at({ 0: 1, 10: 1 }), snare: at({ 8: 1 }), clap: at({ 8: 1 }), hat: at({ 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 6: 1, 7: 1, 8: 1, 10: 1, 11: 1, 12: 1, 13: 1, 14: 1, 15: 1 }), open: at({ 5: 1 }), tom: at({ 15: 1 }),
      bass: at({ 0: 1, 3: 1, 10: 2 }), pad: at({ 0: 1 }), pluck: at({ 6: 5, 7: 4, 14: 2 }), bell: at({ 2: 5, 11: 4 }),
    }),
  },
  { name: "Empty", bpm: 110, pattern: empty },
];

export default function BeatLab() {
  const [pattern, setPattern] = useState<Pattern>(PRESETS[0].pattern);
  const [bpm, setBpm] = useState(PRESETS[0].bpm);
  const [swing, setSwing] = useState(0);
  const [volume, setVolume] = useState(75);
  const [muted, setMuted] = useState<Set<string>>(new Set());
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const [preset, setPreset] = useState(0);

  const ctx = useRef<AudioContext | null>(null);
  const out = useRef<GainNode | null>(null);
  const noise = useRef<AudioBuffer | null>(null);
  const live = useRef({ pattern, bpm, swing, volume, muted });
  live.current = { pattern, bpm, swing, volume, muted };
  const sched = useRef({ id: 0 as unknown as ReturnType<typeof setInterval>, next: 0, idx: 0, timers: [] as ReturnType<typeof setTimeout>[] });

  const ensure = () => {
    if (!ctx.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const c = new AC();
      const comp = c.createDynamicsCompressor();
      const g = c.createGain();
      g.connect(comp).connect(c.destination);
      const buf = c.createBuffer(1, c.sampleRate, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      ctx.current = c; out.current = g; noise.current = buf;
    }
    if (ctx.current.state === "suspended") void ctx.current.resume();
    out.current!.gain.value = (live.current.volume / 100) * 0.7;
    return ctx.current;
  };

  const env = (c: AudioContext, t: number, peak: number, dur: number) => {
    const g = c.createGain();
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    return g;
  };
  const noiseHit = (c: AudioContext, t: number, type: BiquadFilterType, f: number, peak: number, dur: number, q = 0.7) => {
    const s = c.createBufferSource(); s.buffer = noise.current;
    const flt = c.createBiquadFilter(); flt.type = type; flt.frequency.value = f; flt.Q.value = q;
    const g = env(c, t, peak, dur);
    s.connect(flt).connect(g).connect(out.current!);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  };
  const tone = (c: AudioContext, t: number, type: OscillatorType, f0: number, f1: number | null, peak: number, dur: number, filterHz?: number) => {
    const o = c.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.35);
    const g = env(c, t, peak, dur);
    if (filterHz) { const l = c.createBiquadFilter(); l.type = "lowpass"; l.frequency.setValueAtTime(filterHz, t); l.frequency.exponentialRampToValueAtTime(Math.max(120, filterHz * 0.25), t + dur); o.connect(l).connect(g); }
    else o.connect(g);
    g.connect(out.current!);
    o.start(t); o.stop(t + dur + 0.05);
  };

  const hit = useCallback((id: string, t: number, v = 1) => {
    const c = ctx.current!;
    const row = ROWS.find((r) => r.id === id)!;
    const f = row.kind === "tone" ? midiHz(row.base! + SCALE[Math.max(0, v - 1) % 5]) : 0;
    switch (id) {
      case "kick": tone(c, t, "sine", 160, 42, 1, 0.45); break;
      case "snare": noiseHit(c, t, "highpass", 1200, 0.7, 0.18); tone(c, t, "triangle", 190, 130, 0.5, 0.1); break;
      case "clap": [0, 0.012, 0.024].forEach((d) => noiseHit(c, t + d, "bandpass", 1500, 0.8, 0.02, 1.2)); noiseHit(c, t + 0.036, "bandpass", 1500, 0.7, 0.16, 1.2); break;
      case "hat": noiseHit(c, t, "highpass", 7500, 0.35, 0.05); break;
      case "open": noiseHit(c, t, "highpass", 6500, 0.3, 0.3); break;
      case "tom": tone(c, t, "sine", 230, 110, 0.85, 0.32); break;
      case "bass": tone(c, t, "sawtooth", f, null, 0.55, 0.3, 900); break;
      case "pluck": tone(c, t, "square", f, null, 0.22, 0.22, 3000); break;
      case "pad": tone(c, t, "triangle", f, null, 0.28, 0.9); tone(c, t, "triangle", f * 1.005, null, 0.22, 0.9); break;
      case "bell": tone(c, t, "sine", f, null, 0.18, 0.7); tone(c, t, "sine", f * 2.76, null, 0.07, 0.4); break;
    }
  }, []);

  const audition = (id: string, v = 1) => { const c = ensure(); hit(id, c.currentTime + 0.01, v); };

  const stop = useCallback(() => {
    const s = sched.current;
    clearInterval(s.id); s.timers.forEach(clearTimeout); s.timers = [];
    setPlaying(false); setStep(-1);
  }, []);

  const start = () => {
    const c = ensure();
    const s = sched.current;
    s.idx = 0; s.next = c.currentTime + 0.08; setPlaying(true);
    s.id = setInterval(() => {
      while (s.next < c.currentTime + 0.12) {
        const { pattern: p, bpm: b, swing: sw, muted: m } = live.current;
        const dur = 60 / b / 4, i = s.idx;
        const when = s.next + (i % 2 ? sw * dur * 0.5 : 0);
        ROWS.forEach((r) => { const v = p[r.id][i]; if (v && !m.has(r.id)) hit(r.id, when, v); });
        s.timers.push(setTimeout(() => setStep(i), Math.max(0, (when - c.currentTime) * 1000)));
        s.next += dur; s.idx = (i + 1) % STEPS;
      }
    }, 25);
  };

  useEffect(() => () => { stop(); void ctx.current?.close(); }, [stop]);
  useEffect(() => { if (out.current) out.current.gain.value = (volume / 100) * 0.7; }, [volume]);

  const toggle = (id: string, i: number) => {
    const row = ROWS.find((r) => r.id === id)!;
    setPattern((p) => {
      const cur = p[id][i];
      const nextV = row.kind === "drum" ? (cur ? 0 : 1) : cur >= 5 ? 0 : cur + 1; // melodic cells cycle off → C → E♭ → F → G → B♭ → off
      if (nextV) audition(id, nextV);
      const copy = p[id].slice(); copy[i] = nextV;
      return { ...p, [id]: copy };
    });
    setPreset(-1);
  };

  const load = (i: number) => { setPreset(i); setPattern(PRESETS[i].pattern()); setBpm(PRESETS[i].bpm); };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button onClick={playing ? stop : start} aria-pressed={playing} className="min-w-[96px] rounded-full border border-signal bg-signal px-6 py-2.5 font-mono text-xs uppercase tracking-wide text-ink">
          {playing ? "Stop" : "Play"}
        </button>
        <div role="group" aria-label="Preset patterns" className="flex flex-wrap gap-2">
          {PRESETS.map((p, i) => (
            <button key={p.name} onClick={() => load(i)} aria-pressed={preset === i} className={clsx("rounded-full border px-4 py-2 text-sm transition-colors", preset === i ? "border-signal text-signal" : "border-line text-mist hover:border-signal hover:text-signal")}>{p.name}</button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-night p-3 sm:p-5">
        <div className="min-w-[760px]">
          {ROWS.map((r, ri) => (
            <div key={r.id} className={clsx("flex items-center gap-2", ri === 6 && "mt-4 border-t border-white/10 pt-4", ri > 0 && ri !== 6 && "mt-1.5")}>
              <div className="flex w-[116px] shrink-0 items-center gap-1.5">
                <button
                  onClick={() => setMuted((m) => { const n = new Set(m); if (n.has(r.id)) n.delete(r.id); else n.add(r.id); return n; })}
                  aria-pressed={muted.has(r.id)} aria-label={`Mute ${r.label}`} title="Mute"
                  className={clsx("h-5 w-5 shrink-0 rounded-full border font-mono text-[9px] leading-none", muted.has(r.id) ? "border-rust text-rust" : "border-white/25 text-white/40 hover:border-[#B4FF39] hover:text-[#B4FF39]")}
                >M</button>
                <button onClick={() => audition(r.id)} className="truncate text-left font-mono text-[11px] uppercase tracking-wide text-white/70 hover:text-[#B4FF39]" title="Hear this instrument">{r.label}</button>
              </div>
              <div className="grid flex-1 grid-cols-16 gap-1" style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}>
                {pattern[r.id].map((v, i) => (
                  <button
                    key={i} onClick={() => toggle(r.id, i)}
                    aria-pressed={v > 0}
                    aria-label={`${r.label}, step ${i + 1}${v && r.kind === "tone" ? `, note ${NOTE_NAMES[v - 1]}` : ""}`}
                    className={clsx(
                      "flex h-9 items-center justify-center rounded-md border font-mono text-[10px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#B4FF39]",
                      i % 4 === 0 && "ml-1",
                      v ? "border-[#B4FF39] bg-[#B4FF39] text-black" : i % 8 < 4 ? "border-white/15 bg-white/[0.07] hover:bg-white/15" : "border-white/10 bg-white/[0.03] hover:bg-white/15",
                      step === i && !v && "bg-white/30",
                      step === i && v > 0 && "brightness-125 ring-2 ring-white"
                    )}
                  >{v && r.kind === "tone" ? NOTE_NAMES[v - 1] : ""}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <Slider id="bpm" label="Tempo" value={bpm} min={60} max={180} unit=" BPM" onChange={setBpm} />
        <Slider id="swing" label="Swing" value={Math.round(swing * 100)} min={0} max={60} unit="%" onChange={(v) => setSwing(v / 100)} />
        <Slider id="vol" label="Volume" value={volume} min={0} max={100} unit="%" onChange={setVolume} />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button onClick={() => { setPattern(empty()); setPreset(3); }} className="rounded-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-wide text-mist hover:border-signal hover:text-signal">Clear all</button>
        <p className="text-sm text-mist">Click a step to place a drum hit. Bass, Pluck, Pad and Bell steps cycle through five notes (C, E♭, F, G, B♭) each time you click. Click an instrument name to hear it, M to mute it. Sound starts only after you press something.</p>
      </div>
    </div>
  );
}

function Slider({ id, label, value, min, max, unit, onChange }: { id: string; label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void }) {
  return (
    <div>
      <label htmlFor={id} className="flex justify-between font-mono text-xs uppercase tracking-wide text-mist"><span>{label}</span><span>{value}{unit}</span></label>
      <input id={id} type="range" min={min} max={max} value={value} onChange={(e) => onChange(+e.target.value)} className="mt-3 w-full accent-[#B4FF39]" />
    </div>
  );
}

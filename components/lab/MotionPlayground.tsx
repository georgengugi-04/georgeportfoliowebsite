"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Kind = "spring" | "tween";
const EASES = ["linear", "easeIn", "easeOut", "easeInOut", "circOut", "backOut", "anticipate"] as const;
const f = (n: number) => String(Math.round(n * 1000) / 1000);

function Slider({ id, label, v, set, min, max, step }: { id: string; label: string; v: number; set: (n: number) => void; min: number; max: number; step: number }) {
  return (
    <div>
      <label htmlFor={id} className="flex justify-between font-mono text-xs uppercase tracking-wide text-mist"><span>{label}</span><span>{f(v)}</span></label>
      <input id={id} type="range" min={min} max={max} step={step} value={v} onChange={(e) => set(+e.target.value)} className="mt-2 w-full accent-[#B4FF39]" />
    </div>
  );
}

export default function MotionPlayground() {
  const reduce = useReducedMotion();
  const [kind, setKind] = useState<Kind>("spring");
  const [stiffness, setStiffness] = useState(260);
  const [damping, setDamping] = useState(18);
  const [mass, setMass] = useState(1);
  const [duration, setDuration] = useState(0.6);
  const [ease, setEase] = useState<(typeof EASES)[number]>("easeOut");
  const [stagger, setStagger] = useState(0.08);
  const [distance, setDistance] = useState(80);
  const [props, setProps] = useState({ y: true, scale: true, rotate: false, opacity: true });
  const [run, setRun] = useState(0);
  const [copied, setCopied] = useState(false);

  const transition = useMemo(() => (kind === "spring" ? { type: "spring" as const, stiffness, damping, mass } : { type: "tween" as const, duration, ease }), [kind, stiffness, damping, mass, duration, ease]);

  const hidden = { ...(props.y ? { y: distance } : {}), ...(props.scale ? { scale: 0.4 } : {}), ...(props.rotate ? { rotate: -90 } : {}), ...(props.opacity ? { opacity: 0 } : {}) };
  const shown = { ...(props.y ? { y: 0 } : {}), ...(props.scale ? { scale: 1 } : {}), ...(props.rotate ? { rotate: 0 } : {}), ...(props.opacity ? { opacity: 1 } : {}) };

  const code = `const container = {\n  hidden: {},\n  show: { transition: { staggerChildren: ${f(stagger)} } },\n};\n\nconst item = {\n  hidden: ${JSON.stringify(hidden)},\n  show: {\n    ...${JSON.stringify(shown)},\n    transition: ${JSON.stringify(transition)},\n  },\n};\n\n<motion.ul variants={container} initial="hidden" animate="show">\n  <motion.li variants={item} />\n</motion.ul>`;

  const copy = async () => { try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} };
  const chip = (on: boolean) => `rounded-full border px-4 py-2 text-sm transition-colors ${on ? "border-signal bg-signal text-ink" : "border-line text-mist hover:border-signal hover:text-signal"}`;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0">
        <div className="flex min-h-[260px] items-center justify-center overflow-hidden rounded-2xl border border-line bg-black/10 p-6">
          <motion.ul key={run} initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : stagger } } }} className="flex flex-wrap items-center justify-center gap-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.li key={i} variants={{ hidden: reduce ? { opacity: 0 } : hidden, show: reduce ? { opacity: 1, transition: { duration: 0.2 } } : { ...shown, transition } }}
                className="h-14 w-14 rounded-md sm:h-16 sm:w-16" style={{ background: i % 2 ? "#B4FF39" : "#7fe3ff", opacity: undefined }} aria-hidden />
            ))}
          </motion.ul>
        </div>
        {reduce && <p className="mt-3 text-sm text-mist">Your system asks for reduced motion, so this preview only fades. The code below still gives the full animation.</p>}
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={() => setRun((r) => r + 1)} className="rounded-full border border-signal bg-signal px-6 py-2.5 font-mono text-xs uppercase tracking-wide text-ink">Play</button>
          <button onClick={copy} className="rounded-full border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-mist hover:border-signal hover:text-signal">{copied ? "Copied" : "Copy code"}</button>
        </div>
        <pre className="mt-6 overflow-auto rounded-sm border border-line p-4 text-xs leading-relaxed text-mist" tabIndex={0} aria-label="Generated Framer Motion code">{code}</pre>
      </div>

      <div className="space-y-6">
        <div>
          <p id="mk" className="font-mono text-xs uppercase tracking-wide text-mist">Motion type</p>
          <div role="radiogroup" aria-labelledby="mk" className="mt-3 flex gap-2">
            {(["spring", "tween"] as Kind[]).map((k) => <button key={k} role="radio" aria-checked={kind === k} onClick={() => setKind(k)} className={chip(kind === k)}>{k}</button>)}
          </div>
        </div>
        {kind === "spring" ? (
          <>
            <Slider id="stf" label="Stiffness" v={stiffness} set={setStiffness} min={20} max={600} step={10} />
            <Slider id="dmp" label="Damping" v={damping} set={setDamping} min={2} max={60} step={1} />
            <Slider id="mas" label="Mass" v={mass} set={setMass} min={0.2} max={4} step={0.1} />
          </>
        ) : (
          <>
            <Slider id="dur" label="Duration (s)" v={duration} set={setDuration} min={0.1} max={2} step={0.05} />
            <div>
              <label htmlFor="eas" className="block font-mono text-xs uppercase tracking-wide text-mist">Easing</label>
              <select id="eas" value={ease} onChange={(e) => setEase(e.target.value as (typeof EASES)[number])} className="mt-2 w-full rounded-sm border border-line bg-ink px-3 py-2.5 text-sm text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal">
                {EASES.map((e) => <option key={e}>{e}</option>)}
              </select>
            </div>
          </>
        )}
        <Slider id="stg" label="Stagger (s)" v={stagger} set={setStagger} min={0} max={0.3} step={0.01} />
        <Slider id="dst" label="Distance (px)" v={distance} set={setDistance} min={0} max={200} step={5} />
        <fieldset>
          <legend className="font-mono text-xs uppercase tracking-wide text-mist">Animate</legend>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            {(Object.keys(props) as (keyof typeof props)[]).map((p) => (
              <label key={p} className="flex items-center gap-2"><input type="checkbox" checked={props[p]} onChange={() => setProps((s) => ({ ...s, [p]: !s[p] }))} className="h-4 w-4 accent-[#B4FF39]" />{p}</label>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
}

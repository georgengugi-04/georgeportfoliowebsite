"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Swatch = { hex: string; rgb: [number, number, number]; share: number; name: string };

const NAMES: [string, [number, number, number]][] = [
  ["Ochre", [204, 119, 34]], ["Clay", [176, 101, 72]], ["Terracotta", [190, 98, 70]], ["Umber", [99, 81, 71]], ["Sienna", [136, 45, 23]],
  ["Sand", [194, 178, 128]], ["Straw", [228, 217, 111]], ["Sage", [156, 175, 136]], ["Moss", [107, 117, 66]], ["Olive", [110, 110, 50]],
  ["Charcoal", [54, 69, 79]], ["Soot", [35, 35, 32]], ["Bone", [227, 218, 201]], ["Rust", [183, 65, 14]], ["Ash", [178, 190, 181]],
  ["Dusk blue", [90, 110, 140]], ["Plum", [105, 60, 80]], ["Chalk", [240, 238, 230]], ["Deep forest", [34, 60, 40]], ["Mustard", [196, 154, 38]],
];
const nameOf = (c: [number, number, number]) => NAMES.reduce((best, n) => { const d = (n[1][0] - c[0]) ** 2 + (n[1][1] - c[1]) ** 2 + (n[1][2] - c[2]) ** 2; return d < best.d ? { d, n: n[0] } : best; }, { d: Infinity, n: "" }).n;
const hex = (c: number[]) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
const lum = ([r, g, b]: number[]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function hue([r, g, b]: number[]) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (!d) return { h: 0, s: 0 };
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: d / (mx || 1) };
}

// Deterministic k-means in RGB. Pixels are sampled from a small downscaled copy so it stays fast.
function extract(data: Uint8ClampedArray, k: number, earthOnly: boolean): Swatch[] {
  const px: number[][] = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const p = [data[i], data[i + 1], data[i + 2]];
    if (earthOnly) { const { h, s } = hue(p); if (s > 0.25 && h > 170 && h < 330) continue; } // drop blues, violets and magentas
    px.push(p);
  }
  if (px.length < k) return [];
  const step = Math.max(1, Math.floor(px.length / k));
  let cents: number[][] = [px[0].slice()];
  while (cents.length < k) { // farthest-point initialisation
    let far = px[0], fd = -1;
    for (let i = 0; i < px.length; i += Math.max(1, Math.floor(step / 4))) {
      const dmin = Math.min(...cents.map((c) => (c[0] - px[i][0]) ** 2 + (c[1] - px[i][1]) ** 2 + (c[2] - px[i][2]) ** 2));
      if (dmin > fd) { fd = dmin; far = px[i]; }
    }
    cents.push(far.slice());
  }
  let counts: number[] = [];
  for (let it = 0; it < 10; it++) {
    const sum = cents.map(() => [0, 0, 0]); counts = cents.map(() => 0);
    for (const p of px) {
      let bi = 0, bd = Infinity;
      for (let c = 0; c < k; c++) { const d = (cents[c][0] - p[0]) ** 2 + (cents[c][1] - p[1]) ** 2 + (cents[c][2] - p[2]) ** 2; if (d < bd) { bd = d; bi = c; } }
      sum[bi][0] += p[0]; sum[bi][1] += p[1]; sum[bi][2] += p[2]; counts[bi]++;
    }
    cents = cents.map((c, i) => (counts[i] ? sum[i].map((v) => v / counts[i]) : c));
  }
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  return cents.map((c, i) => ({ hex: hex(c), rgb: c.map(Math.round) as [number, number, number], share: counts[i] / total, name: nameOf(c as [number, number, number]) })).filter((s) => s.share > 0).sort((a, b) => lum(a.rgb) - lum(b.rgb));
}

const SAMPLE = "/projects/eartgalla/gallery/artwork-hyena.jpg";

export default function PaletteExtractor() {
  const [src, setSrc] = useState(SAMPLE);
  const [alt, setAlt] = useState("Painted artwork of a hyena in muted earth tones (sample)");
  const [k, setK] = useState(6);
  const [earth, setEarth] = useState(false);
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [copied, setCopied] = useState("");
  const img = useRef<HTMLImageElement | null>(null);
  const objUrl = useRef<string | null>(null);

  const run = useCallback((el: HTMLImageElement) => {
    const c = document.createElement("canvas");
    const scale = Math.min(1, 120 / Math.max(el.naturalWidth, el.naturalHeight));
    c.width = Math.max(1, Math.round(el.naturalWidth * scale)); c.height = Math.max(1, Math.round(el.naturalHeight * scale));
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) { setState("error"); return; }
    ctx.drawImage(el, 0, 0, c.width, c.height);
    const sw = extract(ctx.getImageData(0, 0, c.width, c.height).data, k, earth);
    setSwatches(sw); setState(sw.length ? "ready" : "error");
  }, [k, earth]);

  useEffect(() => { if (img.current?.complete && img.current.naturalWidth) run(img.current); }, [run]);

  useEffect(() => () => { if (objUrl.current) URL.revokeObjectURL(objUrl.current); }, []);

  const pick = (f: File | undefined) => {
    if (!f || !f.type.startsWith("image/")) return;
    if (objUrl.current) URL.revokeObjectURL(objUrl.current);
    objUrl.current = URL.createObjectURL(f);
    setState("loading"); setSrc(objUrl.current); setAlt(`Your photo: ${f.name}`);
  };
  const copy = async (text: string, id: string) => { try { await navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(""), 1500); } catch {} };
  const css = `:root {\n${swatches.map((s, i) => `  --palette-${i + 1}: ${s.hex}; /* ${s.name} */`).join("\n")}\n}`;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr]">
      <div>
        <div className="overflow-hidden rounded-2xl border border-line bg-black/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={img} src={src} alt={alt} onLoad={(e) => run(e.currentTarget)} onError={() => setState("error")} className="max-h-[480px] w-full object-contain" />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <label className="cursor-pointer rounded-full border border-signal bg-signal px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-ink has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-signal">
            Choose a photo
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
          </label>
          <button onClick={() => { setState("loading"); setSrc(SAMPLE); setAlt("Painted artwork of a hyena in muted earth tones (sample)"); }} className="rounded-full border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-mist hover:border-signal hover:text-signal">Use the sample</button>
        </div>
        <p className="mt-3 text-xs text-mist">Your photo is read in this browser only. It is never uploaded.</p>

        <div className="mt-6 grid gap-5">
          <div>
            <label htmlFor="pk" className="flex justify-between font-mono text-xs uppercase tracking-wide text-mist"><span>Colours</span><span>{k}</span></label>
            <input id="pk" type="range" min={3} max={8} value={k} onChange={(e) => setK(+e.target.value)} className="mt-3 w-full accent-[#B4FF39]" />
          </div>
          <button role="switch" aria-checked={earth} onClick={() => setEarth((v) => !v)} className={`rounded-sm border p-3 text-left text-sm transition-colors ${earth ? "border-signal text-paper" : "border-line text-mist hover:border-signal"}`}>
            Earth tones only: {earth ? "on" : "off"}
            <span className="mt-1 block text-xs text-mist">Ignores strongly saturated blues, violets and magentas so the palette stays warm and natural.</span>
          </button>
        </div>
      </div>

      <div role="status" aria-live="polite" aria-busy={state === "loading"}>
        {state === "loading" && <div className="h-48 animate-pulse rounded-sm border border-line bg-white/[0.04] motion-reduce:animate-none" />}
        {state === "error" && <div className="rounded-sm border-2 border-rust p-5 text-sm">That image couldn&apos;t be read, or had too few colours. Try another photo.</div>}
        {state === "ready" && (
          <>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {swatches.map((s) => (
                <li key={s.hex + s.share}>
                  <button onClick={() => copy(s.hex, s.hex)} aria-label={`Copy ${s.name} ${s.hex}`} className="w-full overflow-hidden rounded-sm border border-line text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal">
                    <span className="block h-24" style={{ background: s.hex }} />
                    <span className="block p-3">
                      <span className="block font-display text-lg">{s.name}</span>
                      <span className="block font-mono text-xs text-mist">{copied === s.hex ? "Copied" : s.hex} · {Math.round(s.share * 100)}%</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex h-6 overflow-hidden rounded-sm border border-line" aria-hidden>
              {swatches.map((s) => <span key={s.hex + s.share} style={{ background: s.hex, flexGrow: s.share }} />)}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button onClick={() => copy(css, "css")} className="rounded-full border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-mist hover:border-signal hover:text-signal">{copied === "css" ? "Copied" : "Copy as CSS variables"}</button>
              <button onClick={() => copy(swatches.map((s) => s.hex).join(", "), "hex")} className="rounded-full border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-mist hover:border-signal hover:text-signal">{copied === "hex" ? "Copied" : "Copy hex list"}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

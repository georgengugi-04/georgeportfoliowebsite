"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { creativeWorks } from "@/data/creative";

const PIECES = creativeWorks.filter((w) => w.category === "Artwork");
const MAX = 560; // longest side of the simulation, in px — keeps per-pixel lighting fast

type Field = { w: number; h: number; base: Uint8ClampedArray; gx: Float32Array; gy: Float32Array; invN: Float32Array };

function buildField(img: HTMLImageElement): Field {
  const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  const base = ctx.getImageData(0, 0, w, h).data;

  // luminance → height map, softened with a 3×3 box blur so noise doesn't read as bristles
  const lum = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) lum[i] = (0.299 * base[i * 4] + 0.587 * base[i * 4 + 1] + 0.114 * base[i * 4 + 2]) / 255;
  const bl = new Float32Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let oy = -1; oy <= 1; oy++)
        for (let ox = -1; ox <= 1; ox++) s += lum[Math.min(h - 1, Math.max(0, y + oy)) * w + Math.min(w - 1, Math.max(0, x + ox))];
      bl[y * w + x] = s / 9;
    }
  const gx = new Float32Array(w * h);
  const gy = new Float32Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      gx[i] = (bl[y * w + Math.min(w - 1, x + 1)] - bl[y * w + Math.max(0, x - 1)]) * 0.5;
      gy[i] = (bl[Math.min(h - 1, y + 1) * w + x] - bl[Math.max(0, y - 1) * w + x]) * 0.5;
    }
  return { w, h, base, gx, gy, invN: new Float32Array(w * h) };
}

function setRelief(f: Field, k: number) {
  for (let i = 0; i < f.invN.length; i++) f.invN[i] = 1 / Math.sqrt(1 + (f.gx[i] * k) ** 2 + (f.gy[i] * k) ** 2);
}

function render(f: Field, out: ImageData, lx: number, ly: number, lz: number, k: number, flat: boolean) {
  const { w, h, base, gx, gy, invN } = f;
  const d = out.data;
  const invR2 = 1 / (0.42 * Math.max(w, h)) ** 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const j = i * 4;
      if (flat) {
        d[j] = base[j];
        d[j + 1] = base[j + 1];
        d[j + 2] = base[j + 2];
        d[j + 3] = 255;
        continue;
      }
      const dx = lx - x;
      const dy = ly - y;
      const r2 = dx * dx + dy * dy;
      const invL = 1 / Math.sqrt(r2 + lz * lz);
      let ndl = (-gx[i] * k * dx - gy[i] * k * dy + lz) * invL * invN[i];
      if (ndl < 0) ndl = 0;
      const t = 1 / (1 + r2 * invR2);
      const v = 0.05 + 1.55 * ndl * t * t;
      d[j] = Math.min(255, base[j] * v * 1.04);
      d[j + 1] = Math.min(255, base[j + 1] * v * 0.95);
      d[j + 2] = Math.min(255, base[j + 2] * v * 0.82);
      d[j + 3] = 255;
    }
  }
}

export default function RakingLight() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const s = useRef({ field: null as Field | null, out: null as ImageData | null, lx: 0, ly: 0, lz: 60, k: 8, flat: false, dirty: true, last: 0, visible: true, reduce: false });
  const [idx, setIdx] = useState(0);
  const [height, setHeight] = useState(60);
  const [relief, setReliefUi] = useState(8);
  const [flat, setFlat] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const piece = PIECES[idx];

  // keep mutable render state in sync with the controls
  useEffect(() => {
    s.current.lz = height;
    s.current.dirty = true;
  }, [height]);
  useEffect(() => {
    const st = s.current;
    st.k = relief;
    if (st.field) setRelief(st.field, relief);
    st.dirty = true;
  }, [relief]);
  useEffect(() => {
    s.current.flat = flat;
    s.current.dirty = true;
  }, [flat]);

  // load the chosen painting and build its height field
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    const img = new window.Image();
    img.onload = () => {
      if (cancelled) return;
      const st = s.current;
      const f = buildField(img);
      setRelief(f, st.k);
      st.field = f;
      st.out = new ImageData(f.w, f.h);
      st.lx = f.w * 0.5;
      st.ly = f.h * 0.4;
      st.dirty = true;
      const c = canvasRef.current;
      if (c) {
        c.width = f.w;
        c.height = f.h;
      }
      setStatus("ready");
    };
    img.onerror = () => !cancelled && setStatus("error");
    img.src = piece.src;
    return () => {
      cancelled = true;
    };
  }, [piece.src]);

  // render loop: draws on interaction, and idles through a slow automatic sweep (unless reduced motion)
  useEffect(() => {
    const st = s.current;
    st.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([e]) => (st.visible = e.isIntersecting), { threshold: 0.05 });
    if (wrapRef.current) io.observe(wrapRef.current);
    let raf = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const f = st.field;
      const c = canvasRef.current;
      if (!f || !st.out || !c || !st.visible || document.hidden) return;
      const auto = !st.reduce && now - st.last > 2500;
      if (auto) {
        const t = now / 1000;
        st.lx = f.w * (0.5 + 0.42 * Math.sin(t * 0.55));
        st.ly = f.h * (0.5 + 0.36 * Math.sin(t * 0.41 + 1.3));
      }
      if (!auto && !st.dirty) return;
      render(f, st.out, st.lx, st.ly, st.lz, st.k, st.flat);
      c.getContext("2d")!.putImageData(st.out, 0, 0);
      st.dirty = false;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  const moveLight = (clientX: number, clientY: number) => {
    const c = canvasRef.current;
    const st = s.current;
    if (!c || !st.field) return;
    const r = c.getBoundingClientRect();
    st.lx = ((clientX - r.left) * st.field.w) / r.width;
    st.ly = ((clientY - r.top) * st.field.h) / r.height;
    st.last = performance.now();
    st.dirty = true;
  };

  const onKey = (e: React.KeyboardEvent) => {
    const st = s.current;
    if (!st.field) return;
    const step = 24;
    const m: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const v = m[e.key];
    if (!v) return;
    e.preventDefault();
    st.lx = Math.max(0, Math.min(st.field.w, st.lx + v[0]));
    st.ly = Math.max(0, Math.min(st.field.h, st.ly + v[1]));
    st.last = performance.now();
    st.dirty = true;
  };

  return (
    <div>
      <div role="group" aria-label="Choose a painting" className="mb-6 flex flex-wrap gap-2">
        {PIECES.map((p, i) => (
          <button key={p.src} onClick={() => setIdx(i)} aria-pressed={i === idx} className={clsx("rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wide transition-colors", i === idx ? "border-signal bg-signal text-ink" : "border-line text-mist hover:border-signal hover:text-signal")}>
            {p.title}
          </button>
        ))}
      </div>

      <div ref={wrapRef} className="relative mx-auto flex min-h-[320px] max-w-3xl items-center justify-center border border-line bg-black p-3 md:p-6">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          role="img"
          aria-label={`${piece.alt}. Move a lamp across it with the pointer or arrow keys to reveal the brushwork.`}
          onPointerMove={(e) => moveLight(e.clientX, e.clientY)}
          onPointerDown={(e) => moveLight(e.clientX, e.clientY)}
          onKeyDown={onKey}
          style={{ touchAction: "none" }}
          className={clsx("h-auto max-h-[72vh] w-auto max-w-full cursor-crosshair transition-opacity duration-500", status === "ready" ? "opacity-100" : "opacity-0")}
        />
        {status === "loading" && <p className="absolute font-mono text-xs uppercase tracking-wide text-mist">Setting up the lamp…</p>}
        {status === "error" && <p role="alert" className="absolute font-mono text-xs text-rust">Couldn&apos;t load this painting.</p>}
      </div>

      <div className="mx-auto mt-6 grid max-w-3xl gap-6 sm:grid-cols-3">
        <label className="block font-mono text-xs uppercase tracking-wide text-mist">
          Lamp height
          <input type="range" min={14} max={220} value={height} onChange={(e) => setHeight(+e.target.value)} className="mt-3 w-full accent-[#B4FF39]" />
          <span className="mt-1 block normal-case text-[11px]">Low = raking angle, long shadows</span>
        </label>
        <label className="block font-mono text-xs uppercase tracking-wide text-mist">
          Relief
          <input type="range" min={1} max={24} value={relief} onChange={(e) => setReliefUi(+e.target.value)} className="mt-3 w-full accent-[#B4FF39]" />
          <span className="mt-1 block normal-case text-[11px]">How strongly paint is lifted off the canvas</span>
        </label>
        <div>
          <button
            onPointerDown={() => setFlat(true)}
            onPointerUp={() => setFlat(false)}
            onPointerLeave={() => setFlat(false)}
            onKeyDown={(e) => (e.key === " " || e.key === "Enter") && setFlat(true)}
            onKeyUp={() => setFlat(false)}
            onBlur={() => setFlat(false)}
            className="btn-ghost w-full justify-center select-none"
          >
            Hold for the flat photo
          </button>
          <p className="mt-3 font-mono text-[11px] text-mist">Compare with the original image.</p>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-3xl text-sm text-mist">
        {piece.title}, {piece.caption?.toLowerCase()}. The relief is inferred from the photograph&apos;s brightness, not measured from the real surface.
      </p>
    </div>
  );
}

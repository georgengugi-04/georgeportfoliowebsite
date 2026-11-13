"use client";

import { useEffect, useRef, useState } from "react";

const SIZE = 460;

/** The Koshe.exe mark, split into red / green / blue channels that tear apart when you move. */
export default function GlitchMark() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [intensity, setIntensity] = useState(60);
  const [auto, setAuto] = useState(true);
  const [ready, setReady] = useState(false);
  const st = useRef({ x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0, burst: 0, intensity: 60, auto: true, reduce: false, visible: true });
  st.current.intensity = intensity;
  st.current.auto = auto;

  useEffect(() => {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    const s = st.current;
    s.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let channels: HTMLCanvasElement[] = [];
    let alive = true;

    const img = new Image();
    img.src = "/brand/koshe-logo.png";
    img.onload = () => {
      if (!alive) return;
      const src = document.createElement("canvas");
      src.width = src.height = SIZE;
      const sctx = src.getContext("2d", { willReadFrequently: true })!;
      sctx.drawImage(img, 0, 0, SIZE, SIZE);
      const data = sctx.getImageData(0, 0, SIZE, SIZE);
      channels = [0, 1, 2].map((ch) => {
        const o = document.createElement("canvas");
        o.width = o.height = SIZE;
        const octx = o.getContext("2d")!;
        const out = octx.createImageData(SIZE, SIZE);
        for (let i = 0; i < data.data.length; i += 4) {
          out.data[i + ch] = data.data[i + ch];
          out.data[i + 3] = data.data[i + 3];
        }
        octx.putImageData(out, 0, 0);
        return o;
      });
      setReady(true);
      loop(performance.now());
    };

    const io = new IntersectionObserver(([e]) => (s.visible = e.isIntersecting));
    io.observe(c);

    let nextAuto = performance.now() + 1200;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!s.visible || !channels.length) return;
      if (s.auto && !s.reduce && now > nextAuto) { s.burst = 1; nextAuto = now + 1800 + Math.random() * 1800; }
      s.vx *= 0.88; s.vy *= 0.88; s.burst *= 0.9;
      const k = s.intensity / 100;
      const power = Math.min(1, Math.hypot(s.vx, s.vy) / 40 + s.burst) * k;
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.globalCompositeOperation = "lighter";
      const dirX = s.vx || (Math.random() - 0.5), dirY = s.vy;
      const len = Math.hypot(dirX, dirY) || 1;
      channels.forEach((ch, i) => {
        const sh = (i - 1) * power * 34;
        ctx.drawImage(ch, (dirX / len) * sh, (dirY / len) * sh * 0.6);
      });
      // horizontal tears
      if (power > 0.08) {
        const n = Math.round(power * 8);
        for (let j = 0; j < n; j++) {
          const y = Math.random() * SIZE, h = 4 + Math.random() * 26 * power, dx = (Math.random() - 0.5) * 70 * power;
          ctx.globalCompositeOperation = "source-over";
          ctx.drawImage(c, 0, y, SIZE, h, dx, y, SIZE, h);
        }
      }
      ctx.globalCompositeOperation = "source-over";
    };

    return () => { alive = false; cancelAnimationFrame(raf); io.disconnect(); };
  }, []);

  const move = (cx: number, cy: number) => {
    const s = st.current;
    if (s.px || s.py) { s.vx += (cx - s.px) * 0.6; s.vy += (cy - s.py) * 0.6; }
    s.px = cx; s.py = cy;
  };
  const kick = () => { st.current.burst = 1; };

  return (
    <div className="grid items-center gap-10 md:grid-cols-[1fr_320px]">
      <div className="grid-field relative flex aspect-square w-full max-w-[560px] justify-self-center items-center justify-center overflow-hidden rounded-2xl border border-line bg-night">
        <canvas
          ref={canvas}
          width={SIZE}
          height={SIZE}
          role="img"
          aria-label="The Koshe.exe emblem. Move the pointer over it to tear its colour channels apart."
          tabIndex={0}
          className="h-[78%] w-[78%] touch-none"
          onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); move(((e.clientX - r.left) / r.width) * SIZE, ((e.clientY - r.top) / r.height) * SIZE); }}
          onPointerLeave={() => { st.current.px = 0; st.current.py = 0; }}
          onPointerDown={kick}
          onKeyDown={(e) => {
            const d = 30;
            if (e.key === "ArrowLeft") st.current.vx -= d;
            else if (e.key === "ArrowRight") st.current.vx += d;
            else if (e.key === "ArrowUp") st.current.vy -= d;
            else if (e.key === "ArrowDown") st.current.vy += d;
            else if (e.key === " " || e.key === "Enter") kick();
            else return;
            e.preventDefault();
          }}
        />
        {!ready && <span className="absolute font-mono text-xs text-mist">loading…</span>}
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="gm-int" className="flex justify-between font-mono text-xs uppercase tracking-wide text-mist">
            <span>Intensity</span><span>{intensity}%</span>
          </label>
          <input id="gm-int" type="range" min={0} max={100} value={intensity} onChange={(e) => setIntensity(+e.target.value)} className="mt-3 w-full accent-[#B4FF39]" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={kick} className="rounded-full border border-signal bg-signal px-4 py-2 font-mono text-xs uppercase tracking-wide text-ink">Glitch it</button>
          <button onClick={() => setAuto((a) => !a)} aria-pressed={auto} className="rounded-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-wide text-mist transition-colors hover:border-signal hover:text-signal aria-pressed:border-signal aria-pressed:text-signal">
            Auto glitch {auto ? "on" : "off"}
          </button>
        </div>
        <p className="text-sm text-mist">Move across the mark, tap it, or use the arrow keys when it is focused. Speed sets how far the red, green and blue copies drift apart.</p>
      </div>
    </div>
  );
}

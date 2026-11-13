"use client";

import { useEffect, useRef, useState } from "react";

type Mode = "repel" | "attract";

/** A lattice of points on springs. The pointer pushes (or pulls) them; a tap sends a ripple across the field. */
export default function SignalGrid() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>("repel");
  const s = useRef({ mode: "repel" as Mode, mx: -999, my: -999, pulses: [] as { x: number; y: number; t: number }[], visible: true });
  s.current.mode = mode;

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const st = s.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const GAP = 28;
    let w = 0, h = 0, dpr = 1, cols = 0, rows = 0;
    let px: Float32Array, py: Float32Array, vx: Float32Array, vy: Float32Array;
    let raf = 0;

    const resize = () => {
      const r = c.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width; h = r.height;
      c.width = w * dpr; c.height = h * dpr;
      cols = Math.floor(w / GAP) + 1; rows = Math.floor(h / GAP) + 1;
      const n = cols * rows;
      px = new Float32Array(n); py = new Float32Array(n); vx = new Float32Array(n); vy = new Float32Array(n);
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);
    const io = new IntersectionObserver(([e]) => (st.visible = e.isIntersecting)); io.observe(c);

    const t0 = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!st.visible) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const ox = (w - (cols - 1) * GAP) / 2, oy = (h - (rows - 1) * GAP) / 2;
      st.pulses = st.pulses.filter((p) => now - p.t < 1600);
      const sign = st.mode === "repel" ? 1 : -1;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        const hx = ox + i * GAP, hy = oy + j * GAP;
        let ax = -px[k] * 0.08, ay = -py[k] * 0.08;
        const x = hx + px[k], y = hy + py[k];
        const dx = x - st.mx, dy = y - st.my, d2 = dx * dx + dy * dy;
        if (d2 < 130 * 130 && d2 > 1) { const d = Math.sqrt(d2), f = (1 - d / 130) * 3.2 * sign; ax += (dx / d) * f; ay += (dy / d) * f; }
        let glow = 0;
        for (const p of st.pulses) {
          const age = (now - p.t) / 1000, ring = age * 520;
          const pdx = x - p.x, pdy = y - p.y, d = Math.hypot(pdx, pdy), diff = Math.abs(d - ring);
          if (diff < 46) { const f = (1 - diff / 46) * (1 - age / 1.6) * 4.5; if (d > 1) { ax += (pdx / d) * f; ay += (pdy / d) * f; } glow = Math.max(glow, f / 4.5); }
        }
        vx[k] = (vx[k] + ax) * 0.86; vy[k] = (vy[k] + ay) * 0.86;
        px[k] += vx[k]; py[k] += vy[k];
        const disp = Math.min(1, Math.hypot(px[k], py[k]) / 22);
        const a = 0.25 + Math.max(disp, glow) * 0.75;
        ctx.fillStyle = `rgba(180,255,57,${a.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(hx + px[k], hy + py[k], 1.6 + Math.max(disp, glow) * 2.2, 0, 6.2832); ctx.fill();
      }
      // idle: a slow orbiting pulse so the field is alive before anyone touches it
      if (!reduce && st.mx < 0 && Math.floor((now - t0) / 4000) !== Math.floor((now - 16 - t0) / 4000)) st.pulses.push({ x: w / 2, y: h / 2, t: now });
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, []);

  const at = (e: React.PointerEvent) => { const r = ref.current!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border border-line bg-night">
        <canvas
          ref={ref}
          role="img"
          aria-label="A grid of glowing points that move away from the pointer. Tap or press Enter to send a ripple across it."
          tabIndex={0}
          className="block h-[420px] w-full touch-none md:h-[520px]"
          onPointerMove={(e) => { const p = at(e); s.current.mx = p.x; s.current.my = p.y; }}
          onPointerLeave={() => { s.current.mx = -999; s.current.my = -999; }}
          onPointerDown={(e) => { const p = at(e); s.current.mx = p.x; s.current.my = p.y; s.current.pulses.push({ ...p, t: performance.now() }); }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              const r = ref.current!.getBoundingClientRect();
              s.current.pulses.push({ x: r.width / 2, y: r.height / 2, t: performance.now() });
            }
          }}
        />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {(["repel", "attract"] as Mode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m} className={"rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wide transition-colors " + (mode === m ? "border-signal bg-signal text-ink" : "border-line text-mist hover:border-signal hover:text-signal")}>{m}</button>
        ))}
        <p className="text-sm text-mist">Move across it, tap for a ripple, or press Enter when focused.</p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";

type Props = { size?: number; className?: string };

/**
 * Two googly eyes. The pupils chase the pointer (mouse, pen or a finger dragging) anywhere on the page,
 * wobble on a spring so they feel loose, glance in the scroll direction, and blink now and then.
 * With "reduce motion" on, they stay still. Decorative: hidden from assistive tech.
 */
export default function GooglyEyes({ size = 22, className = "" }: Props) {
  const eyes = useRef<(HTMLSpanElement | null)[]>([]);
  const pupils = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const pupilSize = size * 0.46;
    const reach = (size - pupilSize) / 2 - 1.5; // how far a pupil may travel inside the eye
    const state = [0, 1].map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }));
    const aim = { x: window.innerWidth / 2, y: window.innerHeight / 2, nudge: 0 };
    let raf = 0;
    let last = 0;
    let nudgeTimer: ReturnType<typeof setTimeout> | undefined;
    let lastScroll = window.scrollY;

    const frame = (t: number) => {
      const dt = Math.min(0.032, (t - last) / 1000 || 0.016);
      last = t;
      let moving = false;
      state.forEach((s, i) => {
        const eye = eyes.current[i];
        const pupil = pupils.current[i];
        if (!eye || !pupil) return;
        const r = eye.getBoundingClientRect();
        const dx = aim.x - (r.left + r.width / 2);
        const dy = aim.y + aim.nudge - (r.top + r.height / 2);
        const dist = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, dist / 90); // look further as the pointer gets further away
        const tx = (dx / dist) * reach * k;
        const ty = (dy / dist) * reach * k;
        // Loose spring: overshoots a little, which is what makes the eyes look googly.
        s.vx += ((tx - s.x) * 260 - s.vx * 9) * dt;
        s.vy += ((ty - s.y) * 260 - s.vy * 9) * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        const m = Math.hypot(s.x, s.y);
        if (m > reach) { s.x = (s.x / m) * reach; s.y = (s.y / m) * reach; }
        pupil.style.transform = `translate(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px)`;
        if (Math.abs(s.vx) + Math.abs(s.vy) > 0.05 || Math.abs(tx - s.x) + Math.abs(ty - s.y) > 0.05) moving = true;
      });
      raf = moving ? requestAnimationFrame(frame) : 0;
    };
    const wake = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };

    const onMove = (e: PointerEvent) => { aim.x = e.clientX; aim.y = e.clientY; wake(); };
    const onScroll = () => {
      const dy = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      if (Math.abs(dy) < 2) return;
      aim.nudge = dy > 0 ? 220 : -220; // glance where the page is heading
      clearTimeout(nudgeTimer);
      nudgeTimer = setTimeout(() => { aim.nudge = 0; wake(); }, 500);
      wake();
    };
    const onLeave = () => { aim.x = window.innerWidth / 2; aim.y = window.innerHeight / 2; wake(); };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    wake();

    // Blink every few seconds.
    let blinkTimer: ReturnType<typeof setTimeout>;
    const blink = () => {
      eyes.current.forEach((e) => e && (e.style.transform = "scaleY(0.08)"));
      setTimeout(() => eyes.current.forEach((e) => e && (e.style.transform = "")), 130);
      blinkTimer = setTimeout(blink, 2500 + Math.random() * 3500);
    };
    blinkTimer = setTimeout(blink, 2000);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(nudgeTimer);
      clearTimeout(blinkTimer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [size]);

  const pupil = size * 0.46;
  return (
    <span aria-hidden className={`inline-flex items-center gap-[3px] ${className}`}>
      {[0, 1].map((i) => (
        <span
          key={i}
          ref={(el) => { eyes.current[i] = el; }}
          style={{ width: size, height: size, transition: "transform 90ms" }}
          className="relative flex items-center justify-center overflow-hidden rounded-full border-2 border-night bg-white"
        >
          <span
            ref={(el) => { pupils.current[i] = el; }}
            style={{ width: pupil, height: pupil }}
            className="block rounded-full bg-night will-change-transform"
          />
        </span>
      ))}
    </span>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import RakingLight from "@/components/lab/RakingLight";

export const metadata: Metadata = {
  title: "Raking Light — Lab 002",
  description: "Drag a lamp across a real painting and watch brightness turn into relief. A Canvas 2D lighting experiment.",
  alternates: { canonical: "/lab/raking-light" },
};

export default function Page() {
  return (
    <div className="pb-24 pt-36 md:pt-44">
      <div className="container-page">
        <Reveal>
          <Link href="/lab" className="font-mono text-xs text-mist hover:text-signal">← Lab</Link>
          <p className="eyebrow mt-6">Lab — Experiment 002</p>
          <h1 className="mt-4 font-display text-display-xl text-balance">Raking Light</h1>
          <p className="mt-2 font-display text-2xl italic text-signal">See the paint, not the picture.</p>
          <p className="mt-6 max-w-xl text-mist text-balance">
            Conservators photograph paintings with a lamp held almost flat against the surface, so every ridge of paint throws a shadow. This does the same to a photograph: move the lamp with your pointer, finger or arrow keys.
          </p>
        </Reveal>
        <div className="mt-14"><RakingLight /></div>
        <Reveal className="mt-20 grid gap-8 border-t border-line pt-10 md:grid-cols-3">
          {[
            ["Height map", "Each pixel's brightness becomes a height, softened with a small blur so noise doesn't read as bristles."],
            ["Per-pixel lighting", "A surface normal is derived from the gradient, then lit by a point lamp with falloff. Roughly 350,000 pixels per frame, in plain JavaScript."],
            ["Considerate", "Renders only when the lamp moves or while on screen, idles slowly on its own, and holds still if you prefer reduced motion."],
          ].map(([t, b]) => (
            <div key={t}>
              <p className="font-mono text-xs uppercase tracking-wide text-signal">{t}</p>
              <p className="mt-2 text-sm leading-relaxed text-mist">{b}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </div>
  );
}

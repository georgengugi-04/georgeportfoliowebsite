import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import SignalGrid from "@/components/lab/SignalGrid";

export const metadata: Metadata = {
  title: "Signal Grid — Lab 005",
  description: "A lattice of points on springs that ripple away from your pointer. Canvas 2D, with touch and keyboard control.",
  alternates: { canonical: "/lab/signal-grid" },
};

export default function Page() {
  return (
    <div className="pb-24 pt-36 md:pt-44">
      <div className="container-page">
        <Reveal>
          <Link href="/lab" className="font-mono text-xs text-mist hover:text-signal">← Lab</Link>
          <p className="eyebrow mt-6">Lab — Experiment 005</p>
          <h1 className="mt-4 font-display text-display-xl text-balance">Signal Grid</h1>
          <p className="mt-2 font-display text-2xl italic text-signal">A field that notices you.</p>
          <p className="mt-6 max-w-xl text-mist text-balance">
            The same lime grid that sits behind this site, made physical. Every point is on a spring: push it, pull it, or send a ripple through the whole field.
          </p>
        </Reveal>
        <div className="mt-14"><SignalGrid /></div>
        <p className="mt-16 text-sm text-mist">
          Next: <Link href="/lab/glitch-mark" className="text-paper underline decoration-signal underline-offset-4">Glitch Mark</Link> · <Link href="/lab" className="text-paper underline decoration-signal underline-offset-4">All experiments</Link>
        </p>
      </div>
    </div>
  );
}

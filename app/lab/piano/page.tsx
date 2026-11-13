import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import Piano from "@/components/lab/Piano";

export const metadata: Metadata = {
  title: "Piano — Lab 006",
  description: "A two-octave piano built with the Web Audio API. Play it by touch, mouse or computer keyboard, and pick the waveform.",
  alternates: { canonical: "/lab/piano" },
};

export default function Page() {
  return (
    <div className="pb-24 pt-36 md:pt-44">
      <div className="container-page">
        <Reveal>
          <Link href="/lab" className="font-mono text-xs text-mist hover:text-signal">← Lab</Link>
          <p className="eyebrow mt-6">Lab — Experiment 006</p>
          <h1 className="mt-4 font-display text-display-xl text-balance">Piano</h1>
          <p className="mt-2 font-display text-2xl italic text-signal">Make some noise, politely.</p>
          <p className="mt-6 max-w-xl text-mist text-balance">
            A two-octave keyboard synthesised live in your browser with the Web Audio API. No samples, no downloads: every note is an oscillator with a small envelope.
          </p>
        </Reveal>
        <div className="mt-14"><Piano /></div>
        <p className="mt-16 text-sm text-mist">
          Previous: <Link href="/lab/signal-grid" className="text-paper underline decoration-signal underline-offset-4">Signal Grid</Link> · <Link href="/lab" className="text-paper underline decoration-signal underline-offset-4">All experiments</Link>
        </p>
      </div>
    </div>
  );
}

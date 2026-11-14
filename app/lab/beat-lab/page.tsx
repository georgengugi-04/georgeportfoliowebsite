import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import BeatLab from "@/components/lab/BeatLab";

export const metadata: Metadata = {
  title: "Beat Lab — Lab 007",
  description: "A 16-step sequencer with six synthesised drums and four melodic instruments, built with the Web Audio API. Pick a preset or write your own pattern.",
  alternates: { canonical: "/lab/beat-lab" },
};

export default function Page() {
  return (
    <div className="pb-24 pt-36 md:pt-44">
      <div className="container-page">
        <Reveal>
          <Link href="/lab" className="font-mono text-xs text-mist hover:text-signal">← Lab</Link>
          <p className="eyebrow mt-6">Lab — Experiment 007</p>
          <h1 className="mt-4 font-display text-display-xl text-balance">Beat Lab</h1>
          <p className="mt-2 font-display text-2xl italic text-signal">A band that lives in the browser.</p>
          <p className="mt-6 max-w-xl text-mist text-balance">
            Six drums, a bass, a pluck, a pad and a bell, all synthesised from oscillators and noise as you play. Build a loop on the grid, or start from a preset and bend it.
          </p>
        </Reveal>
        <div className="mt-14"><BeatLab /></div>
        <p className="mt-16 text-sm text-mist">
          Related: <Link href="/lab/piano" className="text-paper underline decoration-signal underline-offset-4">Piano</Link> · <Link href="/lab" className="text-paper underline decoration-signal underline-offset-4">All experiments</Link>
        </p>
      </div>
    </div>
  );
}

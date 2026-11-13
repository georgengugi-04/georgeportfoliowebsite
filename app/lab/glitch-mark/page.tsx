import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import GlitchMark from "@/components/lab/GlitchMark";

export const metadata: Metadata = {
  title: "Glitch Mark — Lab 004",
  description: "The Koshe.exe emblem split into red, green and blue channels that tear apart with pointer speed. Canvas 2D, with touch and keyboard control.",
  alternates: { canonical: "/lab/glitch-mark" },
};

export default function Page() {
  return (
    <div className="pb-24 pt-36 md:pt-44">
      <div className="container-page">
        <Reveal>
          <Link href="/lab" className="font-mono text-xs text-mist hover:text-signal">← Lab</Link>
          <p className="eyebrow mt-6">Lab — Experiment 004 · Koshe.exe</p>
          <h1 className="mt-4 font-display text-display-xl text-balance">Glitch Mark</h1>
          <p className="mt-2 font-display text-2xl italic text-signal">The brand, mid-crash.</p>
          <p className="mt-6 max-w-xl text-mist text-balance">
            The .exe in the name is a nod to software that misbehaves. This study splits the emblem into its three colour channels and lets your pointer speed decide how badly it falls apart.
          </p>
        </Reveal>
        <div className="mt-14"><GlitchMark /></div>
        <p className="mt-16 text-sm text-mist">
          Related: <Link href="/about" className="text-paper underline decoration-signal underline-offset-4">About Koshe.exe</Link> · <Link href="/design" className="text-paper underline decoration-signal underline-offset-4">Creative Studio</Link>
        </p>
      </div>
    </div>
  );
}

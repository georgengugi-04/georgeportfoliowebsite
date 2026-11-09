import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import SwipeGallery from "@/components/lab/SwipeGallery";

export const metadata: Metadata = {
  title: "Swipe Gallery — Lab 003",
  description: "An interaction study for the EartGalla collection: swipe real artworks to save or pass, with drag physics and keyboard control.",
  alternates: { canonical: "/lab/swipe-gallery" },
};

export default function Page() {
  return (
    <div className="pb-24 pt-36 md:pt-44">
      <div className="container-page">
        <Reveal>
          <Link href="/lab" className="font-mono text-xs text-mist hover:text-signal">← Lab</Link>
          <p className="eyebrow mt-6">Lab — Experiment 003 · EartGalla</p>
          <h1 className="mt-4 font-display text-display-xl text-balance">Swipe Gallery</h1>
          <p className="mt-2 font-display text-2xl italic text-signal">The gallery, one thumb at a time.</p>
          <p className="mt-6 max-w-xl text-mist text-balance">
            A gallery visit is a series of small decisions: stay or move on. This study turns that into a gesture. Throw a card right to keep it, left to let it go.
          </p>
        </Reveal>
        <div className="mt-14"><SwipeGallery /></div>
        <p className="mt-16 text-sm text-mist">
          Related: <Link href="/work/eartgalla-mobile" className="text-paper underline decoration-signal underline-offset-4">EartGalla Mobile</Link> · <Link href="/design" className="text-paper underline decoration-signal underline-offset-4">Creative Studio</Link>
        </p>
      </div>
    </div>
  );
}

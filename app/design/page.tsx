import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import CreativeGallery from "@/components/creative/CreativeGallery";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Creative Studio",
  description: "Graphic design, illustration, brand and artwork by George Ngugi (Koshe.exe).",
  alternates: { canonical: "/design" },
};

export default function DesignPage() {
  return (
    <div className="pb-24 pt-36 md:pt-44">
      <div className="container-page">
        <Reveal className="grid gap-8 md:grid-cols-[1.5fr_1fr] md:items-end">
          <div>
            <span className="eyebrow">Creative Studio — Koshe.exe</span>
            <h1 className="mt-4 font-display text-display-xl text-balance">Design is half of how I build.</h1>
          </div>
          <p className="text-mist text-balance">
            I design the way I code: start from what a person needs to see and feel, then make the details hold up. The same eye that sets a type scale in an app lays out a poster. Tap any piece to view it full screen.
          </p>
        </Reveal>
        <div className="mt-16">
          <CreativeGallery />
        </div>
        <Reveal className="mt-20 grid gap-8 border-t border-line pt-10 md:grid-cols-[1fr_auto] md:items-center">
          <p className="max-w-2xl text-sm text-mist">
            More is on the way: UI explorations and logo work. This studio only shows pieces that exist. The artwork shown comes from the EartGalla collection, where the brand, flyers and storefront are my work.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="https://instagram.com/k.o.s.h.e" target="_blank" rel="noreferrer" className="btn-ghost">Instagram @k.o.s.h.e <ArrowUpRight className="h-4 w-4" /></a>
            <Link href="/work/eartgalla" className="btn-ghost">EartGalla case study</Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

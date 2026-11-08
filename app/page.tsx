import Hero from "@/components/sections/Hero";
import IdentityStrip from "@/components/sections/IdentityStrip";
import FeaturedWork from "@/components/sections/FeaturedWork";
import Disciplines from "@/components/sections/Disciplines";
import AboutPreview from "@/components/sections/AboutPreview";
import FinalCTA from "@/components/sections/FinalCTA";
import CreativeGallery from "@/components/creative/CreativeGallery";
import Reveal from "@/components/ui/Reveal";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Home() {
  return (
    <>
      <Hero />
      <IdentityStrip />
      <FeaturedWork />
      <Disciplines />
      <section className="py-24 md:py-32">
        <div className="container-page">
          <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="eyebrow">Selected creative work</span>
              <h2 className="mt-4 font-display text-display-lg text-balance">Posters, brand, illustration, artwork.</h2>
            </div>
            <Link href="/design" className="btn-ghost">Full Creative Studio <ArrowUpRight className="h-4 w-4" /></Link>
          </Reveal>
          <CreativeGallery filters={false} limit={6} />
        </div>
      </section>
      <AboutPreview />
      <FinalCTA />
    </>
  );
}

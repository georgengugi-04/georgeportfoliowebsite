import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { ArrowRight } from "lucide-react";

export default function AboutPreview() {
  return (
    <section className="py-24 md:py-32">
      <div className="container-page grid gap-10 md:grid-cols-[1fr_2fr] md:gap-16">
        <Reveal><span className="eyebrow">About</span></Reveal>
        <Reveal delay={0.08}>
          <p className="max-w-3xl font-display text-display-md text-balance">
            I enjoy taking ideas, understanding the problems behind them and transforming them into usable digital experiences.
          </p>
          <div className="mt-8 grid max-w-3xl gap-6 text-mist sm:grid-cols-2">
            <p>
              I&apos;m a final-year BSc Information Technology student at KCA University in Nairobi. I started out curious about how everyday interfaces worked underneath, and kept following that curiosity into web, mobile and design.
            </p>
            <p>
              Working with the JKUAT / JHUB Africa community put me on real traceability problems in agriculture and livestock. I&apos;m aiming at engineering and product roles where building and designing sit in the same team.
            </p>
          </div>
          <Link href="/about" className="btn-ghost mt-8">Read the full story <ArrowRight className="h-4 w-4" /></Link>
        </Reveal>
      </div>
    </section>
  );
}

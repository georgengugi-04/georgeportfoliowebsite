import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { ArrowRight } from "lucide-react";

export default function AboutPreview() {
  return (
    <section className="py-24 md:py-32">
      <div className="container-page grid gap-10 md:grid-cols-[1fr_2fr] md:gap-16">
        <Reveal><span className="eyebrow">About</span></Reveal>
        <Reveal delay={0.08}>
          <h2 className="max-w-3xl font-display text-display-md text-balance">I build and design in the same head.</h2>
          <p className="mt-8 max-w-2xl text-lg text-mist">
            I design the screen and build the system behind it, so nothing gets lost in a handoff. Working with the JKUAT / JHUB Africa community put me on real agriculture and livestock traceability problems, which became GreenTrack and BeefTrace. I&apos;m a final-year BSc IT student at KCA University in Nairobi, looking for engineering and product roles.
          </p>
          <Link href="/about" className="btn-ghost mt-8">Read the full story <ArrowRight className="h-4 w-4" /></Link>
        </Reveal>
      </div>
    </section>
  );
}

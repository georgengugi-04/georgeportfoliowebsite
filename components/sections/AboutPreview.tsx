import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { ArrowRight } from "lucide-react";
import { timeline, typeLabel } from "@/data/experience";

export default function AboutPreview() {
  return (
    <section className="border-t border-line py-24 md:py-32" aria-labelledby="about-h">
      <div className="container-page grid gap-10 md:grid-cols-[1fr_2fr] md:gap-16">
        <Reveal><span className="eyebrow">About &amp; experience</span></Reveal>
        <div>
          <Reveal delay={0.08}>
            <h2 id="about-h" className="max-w-3xl font-display text-display-md text-balance">I build and design in the same head.</h2>
            <p className="mt-8 max-w-2xl text-lg text-mist">
              I design the screen and build the system behind it, so nothing gets lost in a handoff. Working with the JKUAT / JHUB Africa community put me on real agriculture and livestock traceability problems, which became GreenTrack and BeefTrace. I&apos;m a final-year BSc IT student at KCA University in Nairobi, looking for engineering and product roles.
            </p>
          </Reveal>
          <ol className="mt-12 border-t border-line">
            {timeline.map((t, i) => (
              <Reveal as="li" key={t.title} delay={i * 0.04} className="grid gap-1 border-b border-line py-5 sm:grid-cols-[10rem_1fr] sm:gap-6">
                <div className="font-mono text-[11px] uppercase tracking-wide text-mist">
                  <span className="block text-signal">{typeLabel[t.type]}</span>
                  {t.period}
                </div>
                <div>
                  <h3 className="font-display text-xl">{t.href ? <Link href={t.href} className="underline decoration-line underline-offset-4 hover:decoration-signal">{t.title}</Link> : t.title}</h3>
                  <p className="font-mono text-xs text-mist">{t.org}</p>
                  <p className="mt-2 max-w-2xl text-sm text-mist">{t.description}</p>
                </div>
              </Reveal>
            ))}
          </ol>
          <Link href="/about" className="btn-ghost mt-8">Read the full story <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </section>
  );
}

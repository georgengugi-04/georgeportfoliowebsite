import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import PhoneFrame from "@/components/work/PhoneFrame";
import { getProject } from "@/data/projects";
import { architectureExamples } from "@/data/skills";
import { creativeWorks } from "@/data/creative";

export default function Disciplines() {
  const gt = getProject("greentrack")!;
  const screens = (gt.screens ?? []).filter((s) => /pest-scan|dashboard|trace-journey/.test(s.src));
  const art = creativeWorks.filter((w) => ["artwork-hyena", "artwork-moon", "flyer-brand"].some((k) => w.src.includes(k)));

  return (
    <>
      {/* 01 — Engineering: technical, grid, monospaced */}
      <section className="border-t border-line py-24 md:py-32" aria-labelledby="eng-h">
        <div className="container-page grid gap-14 lg:grid-cols-[1fr_1.3fr]">
          <Reveal>
            <span className="eyebrow">01 — Engineering</span>
            <h2 id="eng-h" className="mt-4 font-display text-display-lg text-balance">Systems that stay correct.</h2>
            <p className="mt-6 max-w-md text-mist text-balance">
              Web applications, REST APIs, authentication and data models. I care about what happens when two people tap the same button at the same time.
            </p>
            <Link href="/engineering" className="btn-ghost mt-8">Engineering <ArrowUpRight className="h-4 w-4" /></Link>
          </Reveal>
          <div className="grid-field border border-line">
            {architectureExamples.map((a, i) => {
              const p = getProject(a.project)!;
              return (
                <Reveal key={a.title} delay={i * 0.06}>
                  <Link href={`/work/${p.slug}`} className="group block border-b border-line p-6 last:border-b-0 hover:bg-graphite/70">
                    <div className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-wide text-mist">
                      <span>{`arch/0${i + 1}`}</span>
                      <span className="text-signal">{p.title}</span>
                    </div>
                    <div className="mt-3 font-display text-2xl transition-transform group-hover:translate-x-1">{a.title}</div>
                    <p className="mt-2 max-w-lg text-sm text-mist">{a.body}</p>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 02 — Mobile: lime ground */}
      <section className="bg-signal py-24 text-ink md:py-32" aria-labelledby="mob-h">
        <div className="container-page">
          <div className="grid items-end gap-8 md:grid-cols-[1.2fr_1fr]">
            <Reveal>
              <span className="font-mono text-xs uppercase tracking-[0.18em]">02 — Mobile</span>
              <h2 id="mob-h" className="mt-4 font-display text-display-lg text-balance">Built for the phone in someone&apos;s hand.</h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="max-w-md text-ink/75 text-balance">
                Flutter and Dart apps with Firebase auth, role-based workflows and real data. GreenTrack is in active development; Tigala Mobile and EartGalla Mobile are the two newest builds.
              </p>
              <Link href="/work/greentrack" className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-mono text-sm text-paper transition-colors hover:bg-graphite">
                GreenTrack case study <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
          <div className="mt-14 grid grid-cols-3 gap-4 md:gap-8">
            {screens.map((s, i) => (
              <Reveal key={s.src} delay={i * 0.08} className={i === 1 ? "md:translate-y-10" : ""}>
                <PhoneFrame src={s.src} label={s.label} sizes="(max-width: 768px) 30vw, 28vw" className="[&_figcaption]:text-ink/70" />
              </Reveal>
            ))}
          </div>
          <p className="mt-16 font-mono text-xs uppercase tracking-wide text-ink/70 md:mt-24">Currently building: Tigala Mobile — Kenya&apos;s 42 tribes, their origins and folklore · EartGalla Mobile</p>
        </div>
      </section>

      {/* 03 — Creative studio: warm paper ground */}
      <section className="bg-paper py-24 text-ink md:py-32" aria-labelledby="cre-h">
        <div className="container-page">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-ink/60">03 — Creative studio</span>
              <h2 id="cre-h" className="mt-4 font-display text-display-lg text-balance">Where the visuals come from.</h2>
            </div>
            <Link href="/design" className="inline-flex items-center gap-2 rounded-full border border-ink/30 px-6 py-3 font-mono text-sm transition-colors hover:bg-ink hover:text-paper">
              Open the studio <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 items-start gap-4 md:grid-cols-12">
            {art.map((w, i) => (
              <Reveal key={w.src} delay={i * 0.08} className={["md:col-span-5", "md:col-span-4 md:mt-16", "col-span-2 md:col-span-3"][i]}>
                <Link href="/design" aria-label={`${w.title} — open Creative Studio`}>
                  <Image src={w.src} alt={w.alt} width={w.width} height={w.height} sizes="(max-width: 768px) 50vw, 33vw" className="h-auto w-full" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

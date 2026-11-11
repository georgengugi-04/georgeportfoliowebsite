import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { timeline, typeLabel } from "@/data/experience";
import { ArrowRight } from "lucide-react";
import CvLink from "@/components/ui/CvLink";

export const metadata: Metadata = {
  title: "About",
  description: "George Ngugi — final-year IT student at KCA University, software engineer, Flutter and React Native developer and creative designer from Nairobi, Kenya.",
  alternates: { canonical: "/about" },
};

const process = [
  { n: "01", title: "Understand the problem", body: "Before any interface, find out who is stuck and why." },
  { n: "02", title: "Design the experience", body: "Sketch the flow a real person would take, not the one that is easiest to build." },
  { n: "03", title: "Model the system", body: "Decide what data exists, who can touch it and how it moves." },
  { n: "04", title: "Build and test the edges", body: "The slow connection, the wrong role and the repeated request are where products break." },
  { n: "05", title: "Ship and iterate", body: "Get it in front of the people it is for. GreenTrack's Retailer role came from exactly that." },
];

export default function AboutPage() {
  return (
    <div className="pb-24 pt-36 md:pt-44">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.8fr]">
          <Reveal>
            <span className="eyebrow">About</span>
            <h1 className="mt-4 font-display text-display-xl text-balance">An engineer who designs. A designer who ships.</h1>
            <div className="mt-10 max-w-2xl space-y-5 text-lg text-mist">
              <p>
                I&apos;m George Ngugi, also known as <span className="text-signal">Koshe.exe</span>: a final-year BSc Information Technology student at KCA University in Nairobi, a software developer and a creative designer.
              </p>
              <p>
                It began with curiosity about how the interfaces I used every day worked underneath. That moved through web development into UI/UX, and then into full-stack and mobile engineering, because the products I wanted to build needed all of it. Drawing and graphic design never stopped running alongside: posters, illustrations and brand work are part of the same practice.
              </p>
              <p>
                Working with the JKUAT and JHUB Africa community put me on real traceability problems in agriculture and livestock. Real users, several roles, slow connections. Those constraints shaped GreenTrack and BeefTrace.
              </p>
              <p>
                Right now I&apos;m building <Link href="/work/eartgalla-mobile" className="text-paper underline decoration-signal underline-offset-4">EartGalla Mobile</Link>, a mobile app for community stories and languages, while continuing to develop GreenTrack. I&apos;m looking for engineering and product roles, and for collaborators with ideas worth building.</p>
            </div>
            <div className="mt-10"><CvLink variant="pop" label="Download my CV" className="!px-7 !py-3.5" /></div>
            <blockquote className="mt-12 max-w-2xl border-l-2 border-signal pl-6 font-display text-2xl text-balance">
              I enjoy taking ideas, understanding the problems behind them and transforming them into usable digital experiences.
            </blockquote>
          </Reveal>
          <Reveal delay={0.1} className="lg:pt-24">
            <div className="relative aspect-[4/5] overflow-hidden border border-line">
              <Image src="/profile/george.jpg" alt="Portrait of George Ngugi" fill sizes="(max-width: 1024px) 90vw, 30vw" className="object-cover" priority />
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 font-mono text-xs uppercase tracking-wide">
              <div><dt className="text-mist">Based in</dt><dd className="mt-1">Nairobi, Kenya</dd></div>
              <div><dt className="text-mist">Studying</dt><dd className="mt-1">BSc IT, KCA University</dd></div>
              <div><dt className="text-mist">Disciplines</dt><dd className="mt-1">Engineering · Mobile · Design</dd></div>
              <div><dt className="text-mist">Brand</dt><dd className="mt-1 text-signal">Koshe.exe</dd></div>
            </dl>
          </Reveal>
        </div>
      </div>

      <section className="mt-28 border-t border-line py-20" aria-labelledby="tl-h">
        <div className="container-page">
          <Reveal>
            <span className="eyebrow">Experience & credentials</span>
            <h2 id="tl-h" className="mt-4 max-w-2xl font-display text-display-md text-balance">Education, attachment, collaborations and independent work, kept distinct.</h2>
            <p className="mt-4 max-w-xl text-sm text-mist">Dates are shown only where they&apos;re verified. Nothing here is a job title I haven&apos;t held.</p>
          </Reveal>
          <ol className="mt-12 max-w-4xl">
            {timeline.map((e, i) => (
              <Reveal as="li" key={e.title} delay={i * 0.04} className="grid gap-3 border-t border-line py-7 last:border-b md:grid-cols-[150px_1fr] md:gap-10">
                <>
                  <div className="font-mono text-sm text-signal">{e.period}</div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-xl">{e.href ? <Link href={e.href} className="hover:text-signal">{e.title}</Link> : e.title}</h3>
                      <span className="chip">{typeLabel[e.type]}</span>
                    </div>
                    <div className="mt-1 text-sm text-mist">{e.org}</div>
                    <p className="mt-3 max-w-xl text-sm">{e.description}</p>
                  </div>
                </>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-line py-20" aria-labelledby="how-h">
        <div className="container-page">
          <Reveal><span className="eyebrow">Working philosophy</span><h2 id="how-h" className="mt-4 font-display text-display-md">How I build</h2></Reveal>
          <ol className="mt-10 grid max-w-4xl gap-px bg-line">
            {process.map((s) => (
              <li key={s.n} className="flex gap-6 bg-ink py-6 md:gap-10">
                <span className="w-8 shrink-0 font-mono text-sm text-signal">{s.n}</span>
                <div><div className="font-display text-xl">{s.title}</div><p className="mt-1 max-w-md text-sm text-mist">{s.body}</p></div>
              </li>
            ))}
          </ol>
          <Link href="/contact" className="btn-primary mt-12">Let&apos;s work together <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}

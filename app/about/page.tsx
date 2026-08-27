import type { Metadata } from "next";
import Image from "next/image";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "About",
  description: "Software engineer and UI/UX designer building traceability platforms and product interfaces from Nairobi, Kenya.",
};

const process = [
  { n: "01", title: "Understand the problem", body: "Before any interface, understand who's actually stuck and why." },
  { n: "02", title: "Design the experience", body: "Sketch the flow a real person would take, not the one that's easiest to build." },
  { n: "03", title: "Model the system", body: "Decide what data exists, who can touch it, and how it moves." },
  { n: "04", title: "Build the product", body: "Write the code that makes the design and the model actually work together." },
  { n: "05", title: "Test the edge cases", body: "The offline farmer, the slow connection, the wrong role — that's where products break." },
  { n: "06", title: "Ship", body: "Get it in front of the people it's for." },
  { n: "07", title: "Iterate", body: "Nothing is finished on the first pass — GreenTrack's Retailer role is proof of that." },
];

export default function AboutPage() {
  return (
    <div className="pt-40 pb-24">
      <div className="container-page">
        <Reveal>
          <span className="eyebrow">About</span>
          <h1 className="mt-4 font-display text-display-lg max-w-3xl text-balance">
            I build at the intersection of code and design.
          </h1>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 grid md:grid-cols-[1fr_260px] gap-10 items-start">
          <div className="max-w-2xl space-y-5 text-lg text-mist text-balance">
            <p>
              I&apos;m George Ngugi, a software engineer and UI/UX designer
              based in Nairobi, currently studying Information Technology at
              KCA University. Most of what I know now started as curiosity
              about how the interfaces I used every day actually worked
              underneath — and turned into building them myself.
            </p>
            <p>
              That curiosity moved through web development, into UI/UX, and
              eventually into full-stack and mobile engineering, because the
              products I wanted to build needed all three. Working with the
              JKUAT and JHUB Africa community pushed that further: real
              traceability problems in agriculture and livestock, real users
              with real constraints — slow connections, multiple roles,
              offline farms — not just a design brief.
            </p>
            <p>
              What I&apos;m building now — GreenTrack, BeefTrace and
              EartGalla — reflects that: systems with several moving roles,
              shared data models, and interfaces that have to hold up outside
              a design file. The engineering and the art both sit under the
              same personal brand — <span className="text-signal">Koshe.exe</span>.
            </p>
          </div>
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-line">
            <Image
              src="/profile/george.jpg"
              alt="George Ngugi"
              fill
              sizes="260px"
              className="object-cover"
              priority
            />
          </div>
        </Reveal>

        <div className="mt-10 max-w-2xl flex flex-wrap gap-3 font-mono text-xs uppercase tracking-wide text-mist">
          <span className="px-3 py-1.5 rounded-full border border-line">Learning</span>
          <span className="text-line">→</span>
          <span className="px-3 py-1.5 rounded-full border border-line">Experimenting</span>
          <span className="text-line">→</span>
          <span className="px-3 py-1.5 rounded-full border border-line">Building</span>
          <span className="text-line">→</span>
          <span className="px-3 py-1.5 rounded-full border border-line">Shipping</span>
          <span className="text-line">→</span>
          <span className="px-3 py-1.5 rounded-full border border-signal text-signal">Engineering real products</span>
        </div>
      </div>

      <div className="border-t border-line mt-24 md:mt-32 py-16">
        <div className="container-page">
          <Reveal>
            <span className="eyebrow">How I build</span>
          </Reveal>
          <div className="mt-10 flex flex-col max-w-3xl">
            {process.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.05}>
                <div className="flex gap-6 md:gap-10 py-6 border-t border-line last:border-b">
                  <span className="font-mono text-sm text-signal w-8 shrink-0">{step.n}</span>
                  <div>
                    <div className="font-display text-xl">{step.title}</div>
                    <p className="mt-1.5 text-sm text-mist max-w-md">{step.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

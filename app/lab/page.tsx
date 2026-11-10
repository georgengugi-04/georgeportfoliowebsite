import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { experiments } from "@/data/lab";

export default function LabIndex() {
  return (
    <div className="pb-24 pt-36 md:pt-44">
      <div className="container-page">
        <Reveal>
          <span className="eyebrow">Lab</span>
          <h1 className="mt-4 max-w-4xl font-display text-display-xl text-balance">Small experiments with a point of view.</h1>
          <p className="mt-6 max-w-xl text-lg text-mist text-balance">
            Where engineering and art trade ideas. Each one opens on its own page and works with touch, keyboard and reduced-motion settings.
          </p>
        </Reveal>
        <ul className="mt-20 border-t border-line">
          {experiments.map((e, i) => (
            <Reveal as="li" key={e.slug} delay={i * 0.05}>
              <>
                <Link href={`/lab/${e.slug}`} className="group grid items-center gap-4 border-b border-line py-9 md:grid-cols-[90px_1fr_auto] md:gap-10">
                  <span className="font-mono text-sm text-mist transition-colors group-hover:text-signal">{e.n}</span>
                  <div>
                    <h2 className="font-display text-3xl transition-transform duration-300 ease-engineer group-hover:translate-x-2 md:text-5xl">{e.title}</h2>
                    <p className="mt-2 font-display text-lg italic text-signal">{e.line}</p>
                    <p className="mt-3 max-w-xl text-sm text-mist">{e.blurb}</p>
                    <p className="mt-3 font-mono text-[11px] uppercase tracking-wide text-mist">{e.tech}</p>
                  </div>
                  <span className="hidden h-12 w-12 items-center justify-center rounded-full border border-line transition-colors group-hover:border-signal group-hover:bg-signal group-hover:text-ink md:flex">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </Link>
              </>
            </Reveal>
          ))}
        </ul>
      </div>
    </div>
  );
}

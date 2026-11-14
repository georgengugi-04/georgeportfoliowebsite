import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { liveExperiments, plannedExperiments } from "@/data/lab";

export default function LabIndex() {
  return (
    <div className="pb-24 pt-36 md:pt-44">
      <div className="container-page">
        <Reveal>
          <span className="eyebrow">Lab</span>
          <h1 className="mt-4 max-w-4xl font-display text-display-xl text-balance">Small experiments with a point of view.</h1>
          <p className="mt-6 max-w-xl text-lg text-mist text-balance">
            Where engineering and art trade ideas. Each live one opens on its own page and works with touch, keyboard and reduced-motion settings.
          </p>
        </Reveal>

        <h2 className="eyebrow mt-20">Live · {liveExperiments.length}</h2>
        <ul className="mt-6 border-t border-line">
          {liveExperiments.map((e, i) => (
            <Reveal as="li" key={e.slug} delay={Math.min(i, 6) * 0.04}>
              <Link href={`/lab/${e.slug}`} className="group grid items-center gap-4 border-b border-line py-9 md:grid-cols-[90px_1fr_auto] md:gap-10">
                <span className="font-mono text-sm text-mist transition-colors group-hover:text-signal">{e.n}</span>
                <div>
                  <h3 className="font-display text-3xl transition-transform duration-300 ease-engineer group-hover:translate-x-2 md:text-5xl">{e.title}</h3>
                  {e.line && <p className="mt-2 font-display text-lg italic text-signal">{e.line}</p>}
                  <p className="mt-3 max-w-xl text-sm text-mist">{e.summary}</p>
                  <ul className="mt-3 flex flex-wrap gap-2" aria-label="Tags">
                    {e.tags.map((t) => (
                      <li key={t} className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wide text-mist">{t}</li>
                    ))}
                  </ul>
                </div>
                <span className="hidden h-12 w-12 items-center justify-center rounded-full border border-line transition-colors group-hover:border-signal group-hover:bg-signal group-hover:text-ink md:flex">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>

        {plannedExperiments.length > 0 && (
          <section aria-labelledby="planned-h" className="mt-24">
            <h2 id="planned-h" className="eyebrow">Planned · {plannedExperiments.length}</h2>
            <p className="mt-3 max-w-xl text-sm text-mist">Ideas on the bench. Nothing here works yet, so nothing links anywhere.</p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plannedExperiments.map((e) => (
                <li key={e.slug} className="flex flex-col gap-3 rounded-sm border border-dashed border-line p-6">
                  <span className="w-fit rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wide text-mist">Planned</span>
                  <h3 className="font-display text-xl">{e.title}</h3>
                  <p className="text-sm text-mist">{e.summary}</p>
                  <p className="mt-auto font-mono text-[11px] uppercase tracking-wide text-mist">{e.tags.join(" · ")}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

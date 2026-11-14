import Link from "next/link";
import { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";

/** Shared frame for the interactive Lab pages: intro, the demo, a "how it works" note, a case-study link and a way back. */
export default function ExperimentShell({
  n, title, line, shows, how, related, demoNote, children,
}: {
  n: string; title: string; line: string; shows: ReactNode; how: ReactNode;
  related: { label: string; href: string }; demoNote?: string; children: ReactNode;
}) {
  return (
    <div className="pb-24 pt-36 md:pt-44">
      <div className="container-page">
        <Reveal>
          <Link href="/lab" className="font-mono text-xs text-mist hover:text-signal">← Lab</Link>
          <p className="eyebrow mt-6">Lab — Experiment {n}</p>
          <h1 className="mt-4 font-display text-display-xl text-balance">{title}</h1>
          <p className="mt-2 font-display text-2xl italic text-signal">{line}</p>
          <div className="mt-8 max-w-2xl">
            <h2 className="font-mono text-xs uppercase tracking-wide text-signal">What this shows</h2>
            <p className="mt-2 text-mist text-balance">{shows}</p>
          </div>
          {demoNote && <p className="mt-6 inline-block rounded-sm border border-dashed border-signal px-3 py-2 font-mono text-[11px] uppercase tracking-wide text-signal">{demoNote}</p>}
        </Reveal>
        <div className="mt-12">{children}</div>
        <Reveal className="mt-20 grid gap-10 border-t border-line pt-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-mono text-xs uppercase tracking-wide text-signal">How it works</h2>
            <div className="mt-3 max-w-xl space-y-3 text-sm leading-relaxed text-mist">{how}</div>
          </div>
          <div>
            <h2 className="font-mono text-xs uppercase tracking-wide text-signal">Related</h2>
            <p className="mt-3 text-sm"><Link href={related.href} className="text-paper underline decoration-signal underline-offset-4 hover:text-signal">{related.label} →</Link></p>
            <p className="mt-3 text-sm"><Link href="/lab" className="text-paper underline decoration-signal underline-offset-4 hover:text-signal">← Back to the Lab</Link></p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

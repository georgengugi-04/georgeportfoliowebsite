import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { skillGroups, architectureExamples } from "@/data/skills";
import { getProject, orderedProjects } from "@/data/projects";
import ProjectTile from "@/components/work/ProjectTile";

export const metadata: Metadata = {
  title: "Engineering",
  description: "Frontend, backend, mobile and database engineering by George Ngugi — grouped by capability and tied to the projects where each was used.",
  alternates: { canonical: "/engineering" },
};

export default function EngineeringPage() {
  const engineering = orderedProjects.filter((p) => p.disciplines.includes("engineering") && ["pamoja", "beeftrace", "greentrack"].includes(p.slug));
  return (
    <div className="pb-24 pt-36 md:pt-44">
      <div className="container-page">
        <Reveal>
          <span className="eyebrow">Engineering</span>
          <h1 className="mt-4 max-w-4xl font-display text-display-xl text-balance">Capability, not a logo wall.</h1>
          <p className="mt-6 max-w-xl text-lg text-mist text-balance">
            Skills are grouped by what they let me do, and each links to the project where I used it. No percentages and no inflated years — only what the work shows.
          </p>
        </Reveal>

        <div className="mt-20 border-t border-line">
          {skillGroups.map((g, gi) => (
            <Reveal key={g.id} delay={0.03} className="grid gap-6 border-b border-line py-10 md:grid-cols-[0.45fr_1fr] md:gap-12">
              <div>
                <span className="font-mono text-xs text-signal">{String(gi + 1).padStart(2, "0")}</span>
                <h2 className="mt-2 font-display text-3xl">{g.layer}</h2>
                <p className="mt-3 max-w-xs text-sm text-mist">{g.blurb}</p>
              </div>
              <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {g.skills.map((s) => (
                  <li key={s.name} className="border-t border-line pt-3">
                    <div className="font-display text-lg">{s.name}</div>
                    <div className="mt-1 text-sm text-mist">{s.note}</div>
                    {s.usedIn.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-x-3 font-mono text-[11px] uppercase tracking-wide">
                        {s.usedIn.map((slug) => (
                          <Link key={slug} href={`/work/${slug}`} className="text-signal hover:text-paper">
                            {getProject(slug)?.title} →
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <section className="mt-28" aria-labelledby="arch-h">
          <Reveal>
            <span className="eyebrow">Architecture examples</span>
            <h2 id="arch-h" className="mt-4 font-display text-display-md">Decisions I can explain.</h2>
          </Reveal>
          <div className="mt-10 grid gap-px bg-line md:grid-cols-3">
            {architectureExamples.map((a) => (
              <Link key={a.title} href={`/work/${a.project}`} className="bg-ink p-8 transition-colors hover:bg-graphite">
                <div className="font-mono text-[11px] uppercase tracking-wide text-signal">{getProject(a.project)?.title}</div>
                <div className="mt-3 font-display text-2xl">{a.title}</div>
                <p className="mt-3 text-sm text-mist">{a.body}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-28" aria-labelledby="cs-h">
          <Reveal>
            <span className="eyebrow">Selected engineering case studies</span>
            <h2 id="cs-h" className="mt-4 font-display text-display-md">Read the full stories.</h2>
          </Reveal>
          <div className="mt-12 grid gap-x-8 gap-y-16 md:grid-cols-2">
            {engineering.map((p, i) => (
              <ProjectTile key={p.slug} project={p} index={i} aspect="aspect-[16/10]" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

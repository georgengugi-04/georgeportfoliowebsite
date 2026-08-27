import type { Metadata } from "next";
import Reveal from "@/components/ui/Reveal";
import { timeline } from "@/data/experience";

export const metadata: Metadata = {
  title: "Experience",
  description: "Education, community involvement and team projects.",
};

const typeLabel: Record<string, string> = {
  education: "Education",
  project: "Project",
  team: "Team",
  community: "Community",
};

export default function ExperiencePage() {
  return (
    <div className="pt-40 pb-24">
      <div className="container-page">
        <Reveal>
          <span className="eyebrow">Experience</span>
          <h1 className="mt-4 font-display text-display-lg max-w-2xl text-balance">
            A changelog, not a résumé.
          </h1>
        </Reveal>

        <div className="mt-16 flex flex-col max-w-3xl">
          {timeline.map((entry, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div className="grid md:grid-cols-[140px_1fr] gap-4 md:gap-10 py-8 border-t border-line last:border-b">
                <div className="font-mono text-sm text-signal">{entry.period}</div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="font-display text-xl">{entry.title}</h2>
                    <span className="font-mono text-[11px] uppercase tracking-wide text-mist border border-line rounded-full px-2 py-0.5">
                      {typeLabel[entry.type]}
                    </span>
                  </div>
                  <div className="text-sm text-mist mt-1">{entry.org}</div>
                  <p className="mt-3 text-sm max-w-xl">{entry.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

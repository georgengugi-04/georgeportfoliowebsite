"use client";

import Link from "next/link";
import { useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { skillGroups } from "@/data/skills";
import { getProject } from "@/data/projects";

export default function SkillsPage() {
  const [active, setActive] = useState<{ name: string; note: string; usedIn: string[] } | null>(
    null
  );

  return (
    <div className="pt-40 pb-24">
      <div className="container-page">
        <Reveal>
          <span className="eyebrow">Skills</span>
          <h1 className="mt-4 font-display text-display-lg max-w-2xl text-balance">
            An engineering map, not a logo wall.
          </h1>
          <p className="mt-6 text-mist max-w-xl text-balance">
            Grouped by the layer each skill actually operates at. Hover or
            tap one to see what it&apos;s used for and where.
          </p>
        </Reveal>

        <div className="mt-16 grid lg:grid-cols-[1fr_320px] gap-12">
          <div className="flex flex-col">
            {skillGroups.map((group, gi) => (
              <Reveal key={group.layer} delay={gi * 0.05} className="py-8 border-t border-line last:border-b">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-display text-2xl">{group.layer}</h2>
                  <span className="text-xs text-mist font-mono hidden sm:block">{group.description}</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {group.skills.map((s) => (
                    <button
                      key={s.name}
                      onMouseEnter={() => setActive(s)}
                      onFocus={() => setActive(s)}
                      onClick={() => setActive(s)}
                      className="rounded-full border border-line px-4 py-2 text-sm font-mono hover:border-signal hover:text-signal focus-visible:border-signal transition-colors"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>

          <div className="lg:sticky lg:top-32 h-fit rounded-2xl border border-line p-6 min-h-[220px]">
            {active ? (
              <div>
                <div className="font-display text-xl">{active.name}</div>
                <p className="mt-2 text-sm text-mist">{active.note}</p>
                <div className="mt-5 eyebrow">Used in</div>
                <div className="mt-2 flex flex-col gap-1.5">
                  {active.usedIn.map((slug) => {
                    const p = getProject(slug);
                    if (!p) return null;
                    return (
                      <Link
                        key={slug}
                        href={`/work/${slug}`}
                        className="text-sm hover:text-signal transition-colors"
                      >
                        {p.title} →
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-mist">
                Hover or tap a skill to see the project it comes from.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

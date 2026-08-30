import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/data/projects";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected projects — traceability platforms, mobile systems and product concepts.",
};

const statusLabel: Record<string, string> = {
  live: "Live",
  "in-progress": "In progress",
  prototype: "Prototype",
  concept: "Concept",
};

export default function WorkPage() {
  return (
    <div className="pt-40 pb-24">
      <div className="container-page">
        <Reveal>
          <span className="eyebrow">Work</span>
          <h1 className="mt-4 font-display text-display-lg max-w-2xl text-balance">
            Products, prototypes and things still taking shape.
          </h1>
          <p className="mt-6 text-mist max-w-xl text-balance">
            A mix of shipped platforms, in-progress team projects and early
            concepts. Each one is labelled honestly by where it actually
            stands.
          </p>
        </Reveal>

        <div className="mt-16 flex flex-col">
          {projects.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.04}>
              <Link
                href={`/work/${p.slug}`}
                className="group grid md:grid-cols-[auto_1fr_auto_auto] items-center gap-4 md:gap-8 py-7 border-t border-line last:border-b"
              >
                <span className="font-mono text-sm text-mist group-hover:text-signal transition-colors">
                  0{i + 1}
                </span>
                <div>
                  <div className="flex items-center gap-3">
                    {p.logo && (
                      <Image
                        src={p.logo}
                        alt=""
                        width={100}
                        height={30}
                        className="h-5 md:h-6 w-auto object-contain"
                      />
                    )}
                    <h2 className="font-display text-xl md:text-3xl group-hover:translate-x-1 transition-transform duration-300 ease-engineer">
                      {p.title}
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-mist max-w-lg">{p.description}</p>
                </div>
                <span className="hidden md:inline-block font-mono text-xs uppercase tracking-wide text-mist">
                  {statusLabel[p.status]}
                </span>
                <span className="hidden md:flex w-10 h-10 rounded-full border border-line items-center justify-center group-hover:border-signal group-hover:bg-signal group-hover:text-ink transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

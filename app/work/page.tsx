import type { Metadata } from "next";
import Reveal from "@/components/ui/Reveal";
import { orderedProjects } from "@/data/projects";
import ProjectTile from "@/components/work/ProjectTile";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected projects — mobile apps, traceability platforms, backend services and creative products — each labelled by its real status.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <div className="pb-24 pt-36 md:pt-44">
      <div className="container-page">
        <Reveal>
          <span className="eyebrow">Work</span>
          <h1 className="mt-4 max-w-4xl font-display text-display-xl text-balance">Products, prototypes and things still taking shape.</h1>
          <p className="mt-6 max-w-xl text-lg text-mist text-balance">
            Each project says what it is, what stage it is at, and which part I built.
          </p>
        </Reveal>
        <h2 className="sr-only">All projects</h2>
        <div className="mt-20 grid gap-x-8 gap-y-20 md:grid-cols-2">
          {orderedProjects.map((p, i) => (
            <ProjectTile key={p.slug} project={p} index={i} aspect="aspect-[16/10]" priority={i < 2} />
          ))}
        </div>
      </div>
    </div>
  );
}

import Image from "next/image";
import clsx from "clsx";
import { Project, statusLabel } from "@/data/projects";

// Shows a real image when one exists; otherwise an honest typographic panel — never a fake screenshot.
export default function ProjectVisual({ project, className, sizes, priority }: { project: Project; className?: string; sizes: string; priority?: boolean }) {
  return (
    <div className={clsx("relative overflow-hidden rounded-sm border border-line bg-graphite", className)}>
      {project.heroImage ? (
        <Image
          src={project.heroImage}
          alt={project.heroImageAlt ?? `${project.title} screenshot`}
          fill
          sizes={sizes}
          priority={priority}
          className={clsx("object-cover transition-transform duration-700 ease-engineer group-hover:scale-[1.03]", project.slug === "eartgalla" ? "object-left" : "object-top")}
        />
      ) : (
        <div className="grid-field absolute inset-0 flex flex-col justify-between p-5 md:p-7">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-mist">{project.category.split("·")[0].trim()}</span>
          <div>
            <div className="font-display text-4xl md:text-6xl text-paper/90">{project.title}</div>
            <div className="mt-3 font-mono text-[11px] uppercase tracking-wide text-signal">
              {project.screensPending ? "Screens coming soon" : statusLabel[project.status]}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

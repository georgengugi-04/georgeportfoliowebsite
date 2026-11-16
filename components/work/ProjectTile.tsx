import Link from "next/link";
import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";
import { Project, statusLabel, isPlaceholder } from "@/data/projects";
import ProjectVisual from "./ProjectVisual";
import PhoneFrame from "./PhoneFrame";
import Reveal from "@/components/ui/Reveal";

export default function ProjectTile({
  project,
  index,
  className,
  aspect = "aspect-[4/3]",
  showPhones,
  priority,
  detailed,
}: {
  project: Project;
  index: number;
  className?: string;
  aspect?: string;
  showPhones?: boolean;
  priority?: boolean;
  /** Home page: also show the problem, my role and the stack. Fields that are still empty are skipped, never filled in. */
  detailed?: boolean;
}) {
  const phones = project.screens?.slice(1, 4);
  return (
    <Reveal delay={(index % 3) * 0.06} className={className}>
      <Link href={`/work/${project.slug}`} className="group block">
        {showPhones && phones ? (
          <div className={clsx("relative overflow-hidden rounded-sm border border-line bg-graphite grid-field px-6 pt-10 md:px-12", aspect)}>
            <div className="grid grid-cols-3 gap-3 md:gap-6 translate-y-6 md:translate-y-10 transition-transform duration-700 ease-engineer group-hover:translate-y-4">
              {phones.map((s, i) => (
                <div key={s.src} className={i === 1 ? "-translate-y-6 md:-translate-y-10" : ""}>
                  <PhoneFrame src={s.src} label={s.label} appName={project.title} aspect={project.screensAspect} priority={priority} sizes="(max-width: 768px) 30vw, 22vw" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ProjectVisual project={project} className={aspect} sizes="(max-width: 768px) 100vw, 60vw" priority={priority} />
        )}
        <div className="mt-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-mist">{String(index + 1).padStart(2, "0")}</span>
              <span className={clsx("chip", project.status === "live" && "chip-live")}>{statusLabel[project.status]}</span>
              <span className="font-mono text-[11px] uppercase tracking-wide text-mist">{project.category}</span>
            </div>
            <h3 className="mt-2 font-display text-2xl md:text-4xl transition-transform duration-300 ease-engineer group-hover:translate-x-1">{project.title}</h3>
            <p className="mt-2 max-w-xl text-sm md:text-base text-mist">{project.description}</p>
            {detailed && (
              <dl className="mt-4 grid max-w-xl gap-2.5 text-sm">
                {project.problem && (
                  <div>
                    <dt className="font-mono text-[11px] uppercase tracking-wide text-signal">Problem</dt>
                    <dd className="mt-0.5 line-clamp-3 text-mist">{project.problem}</dd>
                  </div>
                )}
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-wide text-signal">My role</dt>
                  <dd className="mt-0.5 text-mist">{project.role}</dd>
                </div>
              </dl>
            )}
            {detailed && project.technologies.length > 0 && (
              <ul className="mt-4 flex max-w-xl flex-wrap gap-1.5" aria-label={`${project.title} technologies`}>
                {project.technologies.slice(0, 6).map((t) => (
                  <li key={t} className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-paper/80">{t}</li>
                ))}
              </ul>
            )}
            {project.metric && !isPlaceholder(project.metric) && (
              <p className={clsx("mt-3 inline-block max-w-xl border-l-2 pl-3 font-mono text-[11px] uppercase tracking-wide", isPlaceholder(project.metric) ? "border-dashed border-line text-mist" : "border-signal text-paper")}>
                {project.metric}
              </p>
            )}
          </div>
          <span className="mt-1 hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line transition-colors group-hover:border-signal group-hover:bg-signal group-hover:text-ink sm:flex">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Github, ExternalLink } from "lucide-react";
import { projects, getProject, statusLabel } from "@/data/projects";
import PhoneFrame from "@/components/work/PhoneFrame";
import ProjectVisual from "@/components/work/ProjectVisual";
import Reveal from "@/components/ui/Reveal";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const project = getProject(params.slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { title: project.title, description: project.description },
  };
}

export default function CaseStudyPage({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug);
  if (!project) notFound();

  const hasDepth = project.architecture.length > 0 || project.challenges.length > 0 || !!project.problem;

  return (
    <div className="pt-36 md:pt-44 pb-24">
      {/* 01 — Overview */}
      <section className="container-page">
        <Reveal className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-wide text-mist">
          <span className="text-signal">{statusLabel[project.status]}</span>
          <span className="text-line">·</span>
          <span>{project.year}</span>
          <span className="text-line">·</span>
          <span>{project.category}</span>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-6 flex items-center gap-4">
            {project.logo && (
              <div className="relative h-10 md:h-12 w-auto shrink-0">
                <Image
                  src={project.logo}
                  alt={`${project.title} logo`}
                  width={160}
                  height={48}
                  className="h-10 md:h-12 w-auto object-contain object-left"
                />
              </div>
            )}
            <h1 className="font-display text-display-lg text-balance max-w-3xl">
              {project.title}
            </h1>
          </div>
          {project.subtitle && (
            <p className="mt-3 text-mist text-lg max-w-2xl">{project.subtitle}</p>
          )}
        </Reveal>

        <Reveal delay={0.14} className="mt-10 grid md:grid-cols-3 gap-8 border-t border-line pt-8">
          <div>
            <div className="eyebrow">Role</div>
            <div className="mt-2 text-sm">{project.role}</div>
          </div>
          <div>
            <div className="eyebrow">Technologies</div>
            <div className="mt-2 text-sm text-mist">{project.technologies.length ? project.technologies.join(" · ") : "Stack to be confirmed"}</div>
          </div>
          <div className="flex flex-wrap gap-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-signal text-ink px-4 py-2 text-sm font-mono font-medium hover:bg-paper transition-colors"
              >
                Live demo <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-mono hover:border-signal hover:text-signal transition-colors"
              >
                Source <Github className="w-3.5 h-3.5" />
              </a>
            )}
            {project.additionalLiveUrls?.map((u) => (
              <a key={u.url} href={u.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-mono hover:border-signal hover:text-signal transition-colors">
                {u.label} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ))}
            {project.socials?.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-mono hover:border-signal hover:text-signal transition-colors"
              >
                {s.label} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </Reveal>

        {project.heroImage && (
          <Reveal delay={0.2} className="mt-16">
            <ProjectVisual project={project} className="aspect-[16/9]" sizes="(max-width: 1400px) 100vw, 1400px" priority />
          </Reveal>
        )}
      </section>

      {/* Gallery */}
      {project.gallery.length > 0 && (
        <section className="container-page mt-16 grid sm:grid-cols-2 gap-4">
          {project.gallery.map((src) => (
            <div key={src} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-line bg-graphite">
              <Image src={src} alt={`${project.title} detail`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-top" />
            </div>
          ))}
        </section>
      )}

      {project.screens && project.screens.length > 0 && (
        <section className="container-page mt-24" aria-labelledby="screens-h">
          <Reveal>
            <span className="eyebrow" id="screens-h">The app</span>
          </Reveal>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {project.screens.map((sc, i) => (
              <li key={sc.src} className={i % 2 ? "lg:translate-y-8" : ""}>
                <PhoneFrame src={sc.src} label={sc.label} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {project.screensPending && (
        <section className="container-page mt-16">
          <Reveal className="grid-field rounded-sm border border-dashed border-line p-8 md:p-12">
            <span className="eyebrow">App screens</span>
            <p className="mt-3 max-w-xl text-mist">{project.screensPending}</p>
          </Reveal>
        </section>
      )}

      {/* 02 — Problem / 03 — Solution */}
      {project.problem && (<section className="container-page mt-24 md:mt-32 grid md:grid-cols-2 gap-12">
        <Reveal>
          <span className="eyebrow">02 — The problem</span>
          <p className="mt-4 text-lg text-balance">{project.problem}</p>
        </Reveal>
        <Reveal delay={0.08}>
          <span className="eyebrow">03 — The solution</span>
          <p className="mt-4 text-lg text-balance">{project.solution}</p>
        </Reveal>
      </section>)}

      {/* Flow / journey */}
      {project.flow && project.flow.length > 0 && (
        <section className="mt-24 md:mt-32 border-t border-line py-16">
          <div className="container-page">
            <Reveal>
              <span className="eyebrow">Journey</span>
            </Reveal>
            <Reveal delay={0.08} className="mt-8 flex flex-wrap items-center gap-3 font-mono text-sm uppercase tracking-wide">
              {project.flow.map((step, i) => (
                <span key={step} className="flex items-center gap-3">
                  <span className="px-3 py-1.5 rounded-full border border-line text-mist">{step}</span>
                  {i < project.flow!.length - 1 && <span className="text-line">→</span>}
                </span>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* 04 — My contribution */}
      {project.myContribution && (<section className="container-page mt-24 md:mt-32">
        <Reveal>
          <span className="eyebrow">04 — My engineering contribution</span>
          <p className="mt-4 text-lg max-w-3xl text-balance">{project.myContribution}</p>
        </Reveal>
        {project.teamContribution && (
          <Reveal delay={0.1} className="mt-6 rounded-xl border border-line p-6 max-w-3xl">
            <div className="eyebrow">Team contribution</div>
            <p className="mt-2 text-mist text-sm">{project.teamContribution}</p>
          </Reveal>
        )}
      </section>)}

      {/* 05 — Architecture */}
      {project.architecture.length > 0 && (
        <section className="border-t border-line mt-24 md:mt-32 py-16">
          <div className="container-page">
            <Reveal>
              <span className="eyebrow">05 — Architecture</span>
            </Reveal>
            <div className="mt-8 flex flex-col max-w-2xl">
              {project.architecture.map((layer, i) => (
                <Reveal key={layer} delay={i * 0.05}>
                  <div className="flex items-center gap-6 py-4 border-t border-line last:border-b">
                    <span className="font-mono text-xs text-signal w-6">0{i + 1}</span>
                    <span className="text-sm md:text-base">{layer}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 07 — Challenges */}
      {project.challenges.length > 0 && (
        <section className="container-page mt-24 md:mt-32">
          <Reveal>
            <span className="eyebrow">07 — Technical challenges</span>
          </Reveal>
          <div className="mt-10 grid gap-8">
            {project.challenges.map((c, i) => (
              <Reveal key={i} delay={i * 0.08} className="grid md:grid-cols-3 gap-6 border-t border-line pt-8">
                <div>
                  <div className="font-mono text-xs text-mist uppercase">Problem</div>
                  <p className="mt-2 text-sm">{c.problem}</p>
                </div>
                <div>
                  <div className="font-mono text-xs text-mist uppercase">Decision</div>
                  <p className="mt-2 text-sm">{c.decision}</p>
                </div>
                <div>
                  <div className="font-mono text-xs text-signal uppercase">Result</div>
                  <p className="mt-2 text-sm">{c.result}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* 08 — Outcomes */}
      {project.outcomes.length > 0 && (
        <section className="border-t border-line mt-24 md:mt-32 py-16">
          <div className="container-page">
            <Reveal>
              <span className="eyebrow">08 — Results</span>
            </Reveal>
            <ul className="mt-8 grid sm:grid-cols-2 gap-4 max-w-2xl">
              {project.outcomes.map((o, i) => (
                <Reveal key={o} delay={i * 0.05}>
                  <li className="flex gap-3 text-sm">
                    <span className="text-signal">—</span>
                    {o}
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {project.verification && (
        <section className="container-page mt-16">
          <Reveal className="rounded-sm border border-line p-6 max-w-3xl">
            <div className="eyebrow">Status & verification</div>
            <p className="mt-2 text-sm text-mist">{project.verification}</p>
          </Reveal>
        </section>
      )}

      {!hasDepth && !project.screensPending && (
        <section className="container-page mt-24 md:mt-32">
          <Reveal className="rounded-xl border border-line p-8 text-mist text-sm">
            The full write-up for {project.title} will be added once its details are verified.
            You can explore the live project in the meantime.
          </Reveal>
        </section>
      )}

      {/* 09 — Live product CTA */}
      {project.liveUrl && (
        <section className="container-page mt-24 md:mt-32">
          <Reveal className="border-t border-line pt-16 flex flex-col items-start">
            <span className="eyebrow">Live product</span>
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 font-display text-3xl md:text-5xl hover:text-signal transition-colors"
            >
              Explore {project.title} <ArrowUpRight className="w-8 h-8" />
            </a>
          </Reveal>
        </section>
      )}

      <section className="container-page mt-24">
        <Link href="/work" className="font-mono text-sm text-mist hover:text-signal transition-colors">
          ← Back to all work
        </Link>
      </section>
    </div>
  );
}

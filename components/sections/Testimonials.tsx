import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { publishableTestimonials } from "@/data/testimonials";
import { getProject } from "@/data/projects";

export default function Testimonials() {
  const items = publishableTestimonials();
  if (items.length === 0) return null; // hides itself until there is something real to show
  return (
    <section className="py-24 md:py-32" aria-labelledby="testimonials-h">
      <div className="container-page">
        <Reveal className="mb-12">
          <span className="eyebrow">In their words</span>
          <h2 id="testimonials-h" className="mt-4 max-w-2xl font-display text-display-lg text-balance">What collaborators say.</h2>
        </Reveal>
        <ul className="grid gap-6 md:grid-cols-2">
          {items.map((t, i) => {
            const project = getProject(t.project);
            return (
              <Reveal as="li" key={`${t.name}-${i}`} delay={i * 0.06} className={`flex flex-col justify-between rounded-sm border p-8 ${t.placeholder ? "border-dashed border-signal" : "border-line"}`}>
                <figure>
                  {t.placeholder && <p className="mb-4 font-mono text-[11px] uppercase tracking-wide text-signal">Placeholder · dev only · not shown on the live site</p>}
                  <blockquote className="font-display text-xl text-balance md:text-2xl">&ldquo;{t.quote}&rdquo;</blockquote>
                  <figcaption className="mt-6 font-mono text-xs uppercase tracking-wide text-mist">
                    <span className="text-paper">{t.name}</span> · {t.role}
                    {project && (<> · <Link href={`/work/${project.slug}`} className="underline decoration-signal underline-offset-4 hover:text-paper">{project.title}</Link></>)}
                  </figcaption>
                </figure>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

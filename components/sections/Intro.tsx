import Reveal from "@/components/ui/Reveal";

export default function Intro() {
  return (
    <section className="border-t border-line py-24 md:py-32">
      <div className="container-page grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16">
        <Reveal>
          <span className="eyebrow">01 — Who I am</span>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="font-display text-display-md text-balance max-w-3xl">
            I don&apos;t just build interfaces. I build the systems behind
            them.
          </p>
          <p className="mt-6 text-mist text-lg max-w-2xl text-balance">
            From responsive interfaces and mobile applications to data models,
            role-based dashboards and real-world traceability platforms, my
            work sits at the intersection of engineering and design — I care
            as much about how a QR scan resolves on a farmer&apos;s phone as
            I do about the type scale on the screen that shows it.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

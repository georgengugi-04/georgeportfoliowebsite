import Reveal from "@/components/ui/Reveal";

const industries = [
  { label: "Agriculture", project: "GreenTrack" },
  { label: "Livestock", project: "BeefTrace" },
  { label: "Commerce", project: "BagBoy" },
  { label: "Art", project: "EartGalla" },
];

export default function RealWorld() {
  return (
    <section className="border-t border-line py-24 md:py-32">
      <div className="container-page">
        <Reveal>
          <span className="eyebrow">04 — Built in the real world</span>
          <h2 className="mt-4 font-display text-display-md max-w-2xl text-balance">
            Different industries. Same engineering mindset.
          </h2>
        </Reveal>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line">
          {industries.map((it, i) => (
            <Reveal key={it.label} delay={i * 0.05} className="bg-ink p-8 h-full">
              <span className="font-mono text-xs text-mist">{it.label}</span>
              <div className="mt-4 font-display text-2xl">{it.project}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

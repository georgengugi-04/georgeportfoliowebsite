import type { Metadata } from "next";
import Reveal from "@/components/ui/Reveal";
import LivingRoot from "@/components/lab/LivingRoot";

export const metadata: Metadata = {
  title: "Living Root 2.0 — Lab 001",
  description: "The Breathing Forest: a procedurally grown tree and root system, three butterflies that land and take off on their own, a living forest floor and three moods of light, in Three.js.",
  alternates: { canonical: "/lab/living-root" },
};

export default function LabPage() {
  return (
    <div className="pt-40 pb-24 md:pb-32">
      <div className="container-page">
        <Reveal>
          <span className="eyebrow">Lab — Experiment 001</span>
          <h1 className="mt-4 font-display text-display-lg max-w-2xl text-balance">
            Living Root 2.0: the breathing forest.
          </h1>
          <p className="mt-6 text-mist max-w-xl text-balance">
            A tree grown from rules rather than modelled by hand: an irregular
            trunk, exposed roots that branch and crawl, thousands of individual
            leaves, and three butterflies that choose where to land. Move the
            light from morning to evening, push the wind, cut away the soil,
            or watch it all grow. Nothing is imported: every texture and shape
            is generated in your browser.
          </p>
        </Reveal>
      </div>

      <div className="container-page mt-14">
        <Reveal delay={0.1}>
          <LivingRoot />
        </Reveal>
      </div>

      <div className="container-page mt-20 md:mt-28">
        <Reveal delay={0.15} className="border-t border-line pt-12">
          <span className="eyebrow">How it&apos;s built</span>
          <h2 className="mt-4 font-display text-display-md max-w-xl">
            Rules for growth, a state machine for flight, and light that changes mood.
          </h2>
          <div className="mt-8 grid md:grid-cols-3 gap-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-signal">Geometry</p>
              <p className="mt-2 text-mist text-sm leading-relaxed">
                Trunk, limbs and roots are tapered tubes with noise in their radius and
                recursive, asymmetric branching. Leaves, ferns, grass and flowers are
                instanced, so thousands cost a handful of draw calls. Bark, soil and
                moss are generated on canvases at runtime.
              </p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-signal">Motion</p>
              <p className="mt-2 text-mist text-sm leading-relaxed">
                One wind field, applied in a shader, sways branches, leaves and grass
                coherently, and the shadow pass uses the same displacement. The pointer
                bends nearby plants. Each butterfly cruises, hovers, lands and takes off
                from its own state machine, and steers away from your cursor.
              </p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-signal">Light &amp; care</p>
              <p className="mt-2 text-mist text-sm leading-relaxed">
                Soft shadows, fog, drifting light shafts and contact shadows stand in for
                full ambient occlusion. Quality drops automatically on slow devices, motion
                is off under reduced-motion, and everything is disposed when you leave.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

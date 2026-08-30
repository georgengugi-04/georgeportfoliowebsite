import Reveal from "@/components/ui/Reveal";
import LivingRoot from "@/components/lab/LivingRoot";

export default function LabPage() {
  return (
    <div className="pt-40 pb-24 md:pb-32">
      <div className="container-page">
        <Reveal>
          <span className="eyebrow">Lab — Experiment 001</span>
          <h1 className="mt-4 font-display text-display-lg max-w-2xl text-balance">
            A hero section that grows.
          </h1>
          <p className="mt-6 text-mist max-w-xl text-balance">
            An instanced root grown from a curve, moss sampled along
            whichever side faces the light, and a butterfly that only lands
            once it decides the branch has gone still. Nothing here is a
            photo or an imported texture — bark, moss, flowers and wings are
            all painted onto a canvas at runtime.
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
            Three.js, instancing, and a state machine for the butterfly.
          </h2>
          <div className="mt-8 grid md:grid-cols-3 gap-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-signal">Geometry</p>
              <p className="mt-2 text-mist text-sm leading-relaxed">
                One tube swept along a hand-placed curve, with moss blades
                instanced along it — a few thousand cones, not individually
                authored, biased toward whichever side of the root faces up.
              </p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-signal">Motion</p>
              <p className="mt-2 text-mist text-sm leading-relaxed">
                Pollen drifts on a small custom vertex shader. The butterfly
                runs its own cruise → approach → land → take-off cycle,
                independent of the camera or the pointer.
              </p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-signal">Lifecycle</p>
              <p className="mt-2 text-mist text-sm leading-relaxed">
                Mounted and fully disposed on route change — geometries,
                materials, textures and the renderer itself — so leaving the
                page doesn&apos;t leave a WebGL context running behind it.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

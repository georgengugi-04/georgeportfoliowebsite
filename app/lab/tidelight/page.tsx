import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import Tidelight from "@/components/lab/Tidelight";

export const metadata: Metadata = {
  title: "Tidelight — Lab 008",
  description: "An interactive generative artwork: a bioluminescent, glass-bodied organism drifting in a deep digital ocean. Three.js with custom GLSL shaders.",
  alternates: { canonical: "/lab/tidelight" },
};

export default function Page() {
  return (
    <div className="pb-24 pt-28 md:pt-32">
      <div className="container-page">
        <Tidelight />
        <Reveal className="mt-16 grid gap-10 border-t border-line pt-12 md:grid-cols-[1fr_1.4fr]">
          <div>
            <span className="eyebrow">How it&apos;s built</span>
            <h2 className="mt-4 font-display text-display-md max-w-sm">One draw call per layer, all the motion on the GPU.</h2>
          </div>
          <ul className="space-y-4 text-mist">
            <li><span className="text-paper">The body.</span> A lathe-turned dome with a custom shader: Fresnel glass, radial canals and a breathing contraction, plus an inner web of glowing filaments.</li>
            <li><span className="text-paper">The tentacles.</span> Twenty-odd curved tubes merged into one geometry. Sway, pointer repulsion, trailing drag and the charge flare are computed in the vertex shader, so the CPU only updates a handful of uniforms per frame.</li>
            <li><span className="text-paper">The water.</span> Instanced, camera-facing particles drift and are pushed aside by your pointer and by each pulse; light shafts and fog are a single full-screen shader.</li>
            <li><span className="text-paper">Care for the device.</span> Fewer tentacles and particles on touch screens, a pixel-ratio cap that steps down if frames run slow, rendering that pauses off-screen, full cleanup of GPU resources on leaving, a very slow mode for reduced motion, and a poster fallback without WebGL.</li>
          </ul>
        </Reveal>
        <p className="mt-12 text-sm text-mist">
          Previous: <Link href="/lab/beat-lab" className="text-paper underline decoration-signal underline-offset-4">Beat Lab</Link> · <Link href="/lab" className="text-paper underline decoration-signal underline-offset-4">All experiments</Link>
        </p>
      </div>
    </div>
  );
}

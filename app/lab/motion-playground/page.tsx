import type { Metadata } from "next";
import ExperimentShell from "@/components/lab/ExperimentShell";
import MotionPlayground from "@/components/lab/MotionPlayground";

export const metadata: Metadata = {
  title: "Motion Playground — Lab 015",
  description: "Tune spring, easing, stagger and distance values, watch six elements animate, and copy the Framer Motion code.",
  alternates: { canonical: "/lab/motion-playground" },
};

export default function Page() {
  return (
    <ExperimentShell
      n="015" title="Motion Playground" line="Feel the numbers before you ship them."
      shows="Spring stiffness, damping and mass, or a tween's duration and easing, change how an interface feels more than almost anything else. Tune them here, replay the animation, and copy the code."
      how={<>
        <p>The preview is six real Framer Motion elements, the same library that animates the rest of this site, using variants: a parent sets <code>staggerChildren</code> and each child animates from a hidden to a shown state with the transition you chose. The code panel is generated from the same state, so what you copy is exactly what you see.</p>
        <p>Low damping with high stiffness overshoots and bounces; high damping settles without wobble; mass makes it feel heavier. If your system asks for reduced motion, the preview fades instead of moving, as the rest of the site does.</p>
      </>}
      related={{ label: "Swipe Gallery (Lab 003)", href: "/lab/swipe-gallery" }}
    >
      <MotionPlayground />
    </ExperimentShell>
  );
}

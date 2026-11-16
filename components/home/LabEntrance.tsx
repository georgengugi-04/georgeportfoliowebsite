import Image from "next/image";
import Link from "next/link";
import { SceneLink } from "@/components/worlds/SceneTransition";
import { experiments } from "@/data/lab";

/** Homepage Lab introduction. Uses a still render of Living Root, so the live scene is only mounted once (in the hero). */
export default function LabEntrance() {
  const live = experiments.filter((e) => e.status === "Live");
  const others = live.filter((e) => e.slug !== "living-root");
  return (
    <section id="lab" aria-labelledby="lab-title" className="relative bg-[#0a0b0a] text-white">
      <div className="relative min-h-[60svh] overflow-hidden">
        <Image src="/worlds/living-root-lab.jpg" alt="Roots and forest floor of the Living Root tree at dusk, with light shafts through the canopy." fill sizes="100vw" className="object-cover" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,#0a0b0a_0%,rgba(10,11,10,0.55)_45%,rgba(10,11,10,0.15)_100%)]" />
        <div className="container-page relative flex min-h-[60svh] flex-col justify-end pb-14 pt-24">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#B4FF39]">The Lab · creative engineering playground · {live.length} live experiments</p>
          <h2 id="lab-title" className="mt-4 max-w-3xl font-display text-[clamp(2.4rem,6vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em] text-balance">
            Beyond the products: the Lab.
          </h2>
          <p className="mt-5 max-w-xl text-white/80 text-balance">
            A playground of small, working experiments where engineering and art meet. The flagship is Living Root: a forest grown from rules in your browser, with a tree, roots, butterflies and three moods of light. Nothing in it is imported.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <SceneLink href="/lab/living-root" label="Living Root" className="inline-flex items-center rounded-full bg-[#B4FF39] px-6 py-3 font-mono text-[13px] font-medium uppercase tracking-wide text-[#0a0b0a] transition-colors hover:bg-white">
              Enter Living Root
            </SceneLink>
            <SceneLink href="/lab" label="The Lab" className="inline-flex items-center rounded-full border border-white/50 px-6 py-3 font-mono text-[13px] font-medium uppercase tracking-wide text-white transition-colors hover:border-[#B4FF39] hover:text-[#B4FF39]">
              All experiments
            </SceneLink>
          </div>
        </div>
      </div>
      <div className="container-page pb-20 pt-10">
        <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3" aria-label="More Lab experiments">
          {others.map((e) => (
            <li key={e.slug} className="border-t border-white/15">
              <Link href={`/lab/${e.slug}`} className="group flex items-baseline gap-4 py-3.5">
                <span className="font-mono text-[11px] text-[#B4FF39]">{e.n}</span>
                <span className="font-display text-lg text-white/90 transition-colors group-hover:text-[#B4FF39]">{e.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

export default function FinalCTA() {
  return (
    <section className="border-t border-line py-28 md:py-40">
      <div className="container-page">
        <Reveal>
          <span className="eyebrow">Contact</span>
          <h2 className="mt-5 max-w-5xl font-display text-[clamp(2.8rem,9vw,8rem)] leading-[0.92] tracking-[-0.04em] text-balance">
            Have an idea <span className="text-signal">worth building?</span>
          </h2>
          <p className="mt-8 max-w-xl text-lg text-mist text-balance">
            Companies, recruiters, collaborators, founders and clients — I&apos;d like to hear what you&apos;re working on.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/contact" className="btn-primary">Start a conversation <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/work" className="btn-ghost">See the work</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

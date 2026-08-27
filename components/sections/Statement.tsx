import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

export function BrandStatement() {
  return (
    <section className="border-t border-line py-28 md:py-40">
      <div className="container-page">
        <Reveal>
          <p className="font-display text-display-lg max-w-4xl text-balance">
            I like turning complicated problems into simple interfaces — then
            building the systems that make those interfaces work.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section className="border-t border-line py-24 md:py-32">
      <div className="container-page flex flex-col items-start">
        <Reveal>
          <span className="eyebrow">Let&apos;s build</span>
          <h2 className="mt-4 font-display text-display-md text-balance">
            Have an idea? Let&apos;s turn it into
            <br /> something real.
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 font-mono text-sm hover:border-signal hover:text-signal transition-colors"
          >
            View my work
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-signal text-ink px-6 py-3 font-mono text-sm font-medium hover:bg-paper transition-colors"
          >
            Start a conversation <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/data/projects";
import Reveal from "@/components/ui/Reveal";

const featured = projects.filter((p) =>
  ["beeftrace", "greentrack", "eartgalla"].includes(p.slug)
);

export default function FeaturedWork() {
  return (
    <section className="border-t border-line py-24 md:py-32">
      <div className="container-page">
        <Reveal className="flex items-end justify-between gap-4 mb-12">
          <div>
            <span className="eyebrow">02 — Selected work</span>
            <h2 className="mt-4 font-display text-display-md">Real products, not repos.</h2>
          </div>
          <Link
            href="/work"
            className="hidden md:inline-flex items-center gap-1.5 font-mono text-sm text-mist hover:text-signal transition-colors"
          >
            All work <ArrowUpRight className="w-4 h-4" />
          </Link>
        </Reveal>

        <div className="flex flex-col">
          {featured.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.06}>
              <Link
                href={`/work/${p.slug}`}
                className="group grid md:grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-10 py-8 border-t border-line last:border-b"
              >
                <span className="font-mono text-sm text-mist group-hover:text-signal transition-colors">
                  0{i + 1}
                </span>

                <div>
                  <div className="flex items-center gap-3">
                    {p.logo && (
                      <Image
                        src={p.logo}
                        alt=""
                        width={120}
                        height={36}
                        className="h-6 md:h-8 w-auto object-contain"
                      />
                    )}
                    <h3 className="font-display text-2xl md:text-4xl transition-transform duration-300 ease-engineer group-hover:translate-x-2">
                      {p.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-mist text-sm md:text-base max-w-xl">{p.description}</p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs uppercase tracking-wide text-mist">
                    <span>{p.year}</span>
                    <span className="text-line">·</span>
                    <span>{p.category}</span>
                  </div>
                </div>

                <motion.span
                  className="hidden md:flex w-12 h-12 rounded-full border border-line items-center justify-center group-hover:border-signal group-hover:bg-signal group-hover:text-ink transition-colors"
                >
                  <ArrowUpRight className="w-5 h-5" />
                </motion.span>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 md:hidden">
          <Link href="/work" className="inline-flex items-center gap-1.5 font-mono text-sm text-signal">
            All work <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

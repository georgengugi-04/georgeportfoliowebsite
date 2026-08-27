"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const stages = ["DESIGN", "BUILD", "TEST", "SHIP", "ITERATE"];

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-40 pb-24 md:pt-48 md:pb-32">
      <div className="absolute inset-0 grid-field [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,black,transparent)]" />

      <div className="container-page relative">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-line shrink-0">
            <Image
              src="/profile/george.jpg"
              alt="George Ngugi"
              fill
              sizes="36px"
              className="object-cover"
              priority
            />
          </div>
          <p className="eyebrow">George Ngugi — Nairobi, Kenya</p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 font-display text-display-xl text-paper text-balance max-w-4xl"
        >
          I build digital systems
          <br />
          that turn ideas into products.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 max-w-xl text-lg text-mist text-balance"
        >
          Software engineer, full-stack developer and UI/UX designer focused on
          building useful products across web, mobile and data-driven systems.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Link
            href="/work"
            className="inline-flex items-center gap-2 rounded-full bg-signal text-ink px-6 py-3 font-mono text-sm font-medium hover:bg-paper transition-colors"
          >
            View My Work <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 font-mono text-sm text-paper hover:border-signal hover:text-signal transition-colors"
          >
            Let&apos;s Build Something
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-mist"
        >
          {stages.map((s, i) => (
            <span key={s} className="flex items-center gap-3">
              <span className={i === 0 ? "text-signal" : ""}>{s}</span>
              {i < stages.length - 1 && <span className="text-line">→</span>}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

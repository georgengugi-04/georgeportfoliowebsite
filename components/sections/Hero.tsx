"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import CvLink from "@/components/ui/CvLink";

const disciplines = ["Software Engineering", "Mobile Development", "Creative Design"];

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-32 md:pb-28 md:pt-40">
      <div className="grid-field pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_30%_20%,black,transparent)]" />
      <div className="container-page relative grid items-end gap-12 lg:grid-cols-[1.45fr_0.8fr]">
        <div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs uppercase tracking-[0.18em]">
            <span className="text-signal">George Ngugi</span>
            <span className="text-mist">Nairobi, Kenya</span>
            <span className="text-mist">aka Koshe.exe</span>
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 font-display text-[clamp(2.6rem,7.2vw,6.6rem)] leading-[0.95] tracking-[-0.035em] text-balance"
          >
            I build digital products and design <span className="text-signal">experiences</span> that matter.
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-8 max-w-xl text-lg text-mist text-balance">
            Software engineer, mobile developer and creative designer exploring the intersection of technology, design and real-world problems.
          </motion.p>

          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-8 flex flex-wrap gap-2" aria-label="Disciplines">
            {disciplines.map((d, i) => (
              <li key={d} className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] ${i === 0 ? "border-signal/60 text-signal" : "border-line text-paper/80"}`}>
                {d}
              </li>
            ))}
          </motion.ul>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }} className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/work" className="btn-primary">
              Explore My Work <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="btn-ghost">
              Let&apos;s Collaborate
            </Link>
            <CvLink variant="pop" label="Download CV" />
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div className="absolute -right-3 -top-3 h-full w-full border border-signal/40" aria-hidden />
          <div className="relative aspect-[4/5] overflow-hidden bg-graphite">
            <Image src="/profile/george.jpg" alt="Portrait of George Ngugi" fill sizes="(max-width: 1024px) 80vw, 30vw" className="object-cover" priority />
          </div>
          <div className="absolute -bottom-4 left-4 right-4 flex items-center justify-between border border-line bg-ink/90 px-4 py-3 font-mono text-[11px] uppercase tracking-wide backdrop-blur">
            <span className="text-mist">BSc IT · KCA University</span>
            <span className="flex items-center gap-1.5 text-signal">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden /> Open to work
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

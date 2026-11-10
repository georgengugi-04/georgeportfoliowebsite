"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import clsx from "clsx";
import { nav } from "@/data/site";
import ThemeToggle from "./ThemeToggle";
import CvLink from "@/components/ui/CvLink";

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("no-scroll");
    };
  }, [open]);

  return (
    <>
      <header className={clsx("fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-engineer", scrolled ? "py-3" : "py-5")}>
        <div className="container-page">
          <div
            className={clsx(
              "flex items-center justify-between rounded-full border transition-all duration-300 ease-engineer",
              scrolled || open ? "border-line bg-ink/85 px-5 py-2.5 backdrop-blur-md" : "border-transparent px-1 py-1"
            )}
          >
            <Link href="/" className="flex items-center gap-2" aria-label="Koshe.exe — George Ngugi — home">
              <Image src="/brand/koshe-mark.png" alt="" aria-hidden width={140} height={114} className="h-8 w-auto object-contain md:h-9" priority />
              <span className="font-mono text-sm tracking-tight">Koshe<span className="text-signal">.exe</span></span>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
              {nav.map((l) => {
                const active = isActive(pathname, l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={clsx("relative px-3 py-2 font-mono text-[13px] uppercase tracking-wide transition-colors", active ? "text-signal" : "text-mist hover:text-paper")}
                  >
                    {l.label}
                    {active && <motion.span layoutId="nav-active" className="absolute -bottom-0.5 left-3 right-3 h-px bg-signal" />}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle variant="icon" className="min-[1200px]:hidden" />
              <CvLink variant="pop" label="CV" className="hidden min-[1360px]:inline-flex !px-4 !py-1.5 !text-[13px]" />
              <ThemeToggle className="hidden min-[1200px]:inline-flex" />
              <Link href="/contact" className="hidden items-center gap-2 whitespace-nowrap rounded-full bg-signal px-4 py-2 font-mono text-[13px] font-medium text-ink transition-colors hover:bg-paper md:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-ink" aria-hidden />
                Available — let&apos;s talk
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <button
                ref={toggleRef}
                className="p-2 text-paper lg:hidden"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Close menu" : "Open menu"}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 overflow-y-auto bg-ink lg:hidden">
            <nav className="container-page flex min-h-full flex-col justify-center gap-1 pb-10 pt-28" aria-label="Mobile">
              {nav.map((l, i) => {
                const active = isActive(pathname, l.href);
                return (
                  <motion.div key={l.href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.04 }}>
                    <Link href={l.href} aria-current={active ? "page" : undefined} className={clsx("flex items-baseline justify-between border-b border-line py-3 font-display text-4xl", active ? "text-signal" : "text-paper")}>
                      {l.label}
                      <span className="font-mono text-xs text-mist">0{i + 1}</span>
                    </Link>
                  </motion.div>
                );
              })}
              <div className="mt-8 flex flex-wrap gap-3">
                <ThemeToggle />
                <CvLink variant="pop" className="!px-4 !py-2 !text-xs" />
              </div>
              <Link href="/contact" className="btn-primary mt-4 self-start">
                <span className="h-1.5 w-1.5 rounded-full bg-ink" aria-hidden /> Available — let&apos;s talk
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import clsx from "clsx";

const links = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
<<<<<<< HEAD
  { href: "/lab", label: "Lab" },
=======
>>>>>>> 9fda05821d0f94652ecb25a828cd713a8867b03a
  { href: "/about", label: "About" },
  { href: "/skills", label: "Skills" },
  { href: "/experience", label: "Experience" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={clsx(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-engineer",
          scrolled ? "py-3" : "py-6"
        )}
      >
        <div className="container-page">
          <div
            className={clsx(
              "flex items-center justify-between rounded-full border transition-all duration-300 ease-engineer",
              scrolled
                ? "bg-ink/80 backdrop-blur-md border-line px-5 py-2.5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)]"
                : "border-transparent px-1 py-1"
            )}
          >
            <Link
              href="/"
              className="flex items-center gap-2"
              aria-label="Koshe.exe — George Ngugi — home"
            >
              <Image
                src="/brand/koshe-logo.png"
                alt="Koshe.exe"
                width={128}
                height={40}
                className="h-6 md:h-7 w-auto object-contain"
                priority
              />
            </Link>

            <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
              {links.slice(1, -1).map((l) => {
                const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={clsx(
                      "relative px-3 py-2 text-sm font-mono uppercase tracking-wide transition-colors",
                      active ? "text-signal" : "text-mist hover:text-paper"
                    )}
                  >
                    {l.label}
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute left-3 right-3 -bottom-0.5 h-px bg-signal"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/contact"
                className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-signal text-ink px-4 py-2 text-sm font-mono font-medium hover:bg-paper transition-colors"
              >
                Let&apos;s Build
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <button
                className="md:hidden p-2 text-paper"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label={open ? "Close menu" : "Open menu"}
              >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-ink md:hidden"
          >
            <motion.nav
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="h-full flex flex-col justify-center container-page gap-2"
              aria-label="Mobile"
            >
              {links.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.05 }}
                >
                  <Link
                    href={l.href}
                    className="block font-display text-4xl py-3 border-b border-line text-paper"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

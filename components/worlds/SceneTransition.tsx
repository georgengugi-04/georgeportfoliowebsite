"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ComponentProps, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Detail = { href: string; x: number; y: number; label: string };
const EVENT = "scene-enter";

/** A real <Link>. With motion allowed, a plain click plays the iris transition instead of an instant jump. */
export function SceneLink({ label, onClick, ...props }: ComponentProps<typeof Link> & { label: string }) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    const detail: Detail = { href: String(props.href), x: e.clientX || r.left + r.width / 2, y: e.clientY || r.top + r.height / 2, label };
    window.dispatchEvent(new CustomEvent<Detail>(EVENT, { detail }));
  };
  return <Link {...props} onClick={handle} />;
}

/** Mounted once in the layout. An iris opens from the clicked point, the route changes underneath, then it lifts. */
export default function SceneTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [tx, setTx] = useState<(Detail & { id: number }) | null>(null);
  const target = useRef<string | null>(null);

  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<Detail>).detail;
      target.current = d.href;
      document.documentElement.setAttribute("data-scene", "1");
      setTx({ ...d, id: Date.now() });
      window.setTimeout(() => router.push(d.href), 620);
    };
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, [router]);

  // lift once the new route is in place (with a failsafe)
  useEffect(() => {
    if (!tx || !target.current) return;
    if (pathname === target.current.split("?")[0].split("#")[0]) {
      const t = window.setTimeout(() => {
        setTx(null);
        document.documentElement.removeAttribute("data-scene");
      }, 350);
      return () => window.clearTimeout(t);
    }
  }, [pathname, tx]);
  useEffect(() => {
    if (!tx) return;
    const t = window.setTimeout(() => {
      setTx(null);
      document.documentElement.removeAttribute("data-scene");
    }, 3500);
    return () => window.clearTimeout(t);
  }, [tx]);

  return (
    <AnimatePresence>
      {tx && (
        <motion.div
          key={tx.id}
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[95] flex items-center justify-center bg-[#0a0b0a]"
          initial={{ clipPath: `circle(0px at ${tx.x}px ${tx.y}px)` }}
          animate={{ clipPath: `circle(160vmax at ${tx.x}px ${tx.y}px)`, transition: { duration: 0.62, ease: [0.7, 0, 0.2, 1] } }}
          exit={{ opacity: 0, transition: { duration: 0.45 } }}
        >
          <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.25, duration: 0.4 } }} className="font-mono text-xs uppercase tracking-[0.3em] text-[#B4FF39]">
            {tx.label}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

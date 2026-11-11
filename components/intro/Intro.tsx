"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const COUNT_MS = 1900; // the "loading" counter
const OUT_MS = 750; // curtain opening

/**
 * First-visit intro. The markup is in the server HTML but hidden by CSS; a tiny inline script in <head>
 * sets html[data-intro="1"] before first paint (home page only, once per session, never under
 * reduced motion), which is what reveals it. It always dismisses itself, can be skipped, and a pure-CSS
 * failsafe hides it even if JavaScript never runs. Add ?intro to the home URL to replay it.
 */
export default function Intro() {
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const finishing = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const setInert = (on: boolean) => {
    document.querySelectorAll<HTMLElement>("body > *").forEach((el) => {
      if (el === root.current || el.tagName === "SCRIPT" || el.tagName === "NEXT-ROUTE-ANNOUNCER") return;
      if (on) el.setAttribute("inert", "");
      else el.removeAttribute("inert");
    });
  };

  const finish = useCallback((quick: boolean) => {
    if (finishing.current) return;
    finishing.current = true;
    timers.current.forEach(clearTimeout);
    root.current?.classList.add("is-out");
    if (counter.current) counter.current.textContent = "100";
    timers.current.push(
      setTimeout(() => {
        try { sessionStorage.setItem("introSeen", "1"); } catch {}
        document.documentElement.removeAttribute("data-intro");
        setInert(false);
        window.scrollTo(0, 0);
        setDone(true);
      }, quick ? 450 : OUT_MS)
    );
  }, []);

  useEffect(() => {
    if (document.documentElement.getAttribute("data-intro") !== "1") { setDone(true); return; }
    setInert(true);
    skip.current?.focus();

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      if (counter.current) counter.current.textContent = String(Math.round(eased * 100)).padStart(3, "0");
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    timers.current.push(setTimeout(() => finish(false), COUNT_MS + 250));

    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" || e.key === "Enter" || e.key === " ") { e.preventDefault(); finish(true); } };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      timers.current.forEach(clearTimeout);
      window.removeEventListener("keydown", onKey);
      setInert(false);
    };
  }, [finish]);

  if (done) return null;

  return (
    <div ref={root} className="intro" role="dialog" aria-modal="true" aria-label="Welcome to Koshe.exe" onClick={() => finish(true)}>
      <div className="intro-curtain intro-curtain-top" />
      <div className="intro-curtain intro-curtain-bottom" />

      <div className="intro-stage">
        <button ref={skip} type="button" className="intro-skip" onClick={(e) => { e.stopPropagation(); finish(true); }}>
          Skip intro <span aria-hidden>↵</span>
        </button>

        <div className="intro-center">
          <Image src="/brand/koshe-mark.png" alt="" aria-hidden width={140} height={114} priority className="intro-mark" />
          <p className="intro-word" aria-hidden>
            <span className="intro-word-inner">Koshe<span className="text-lime">.exe</span></span>
          </p>
          <ul className="intro-roles">
            <li style={{ animationDelay: "0.85s" }}>Software engineer</li>
            <li aria-hidden className="intro-dot" style={{ animationDelay: "0.95s" }}>◆</li>
            <li style={{ animationDelay: "1.05s" }}>Mobile developer</li>
            <li aria-hidden className="intro-dot" style={{ animationDelay: "1.15s" }}>◆</li>
            <li style={{ animationDelay: "1.25s" }}>Creative designer</li>
          </ul>
        </div>

        <div className="intro-foot">
          <span>George Ngugi · Nairobi, Kenya</span>
          <span className="intro-count"><span ref={counter}>000</span>%</span>
        </div>
        <div className="intro-bar"><span /></div>
      </div>
    </div>
  );
}

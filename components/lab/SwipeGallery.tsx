"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { Heart, RotateCcw, X } from "lucide-react";
import clsx from "clsx";
import { creativeWorks, CreativeWork } from "@/data/creative";

const deck = creativeWorks;

function Art({ w, priority }: { w: CreativeWork; priority?: boolean }) {
  const landscape = w.width > w.height;
  return (
    <>
      {landscape && <Image src={w.src} alt="" aria-hidden fill sizes="64px" draggable={false} className="scale-125 object-cover opacity-50 blur-2xl" />}
      <Image src={w.src} alt={w.alt} fill sizes="320px" priority={priority} draggable={false} className={clsx("relative", landscape ? "object-contain" : "object-cover")} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-16 text-white">
        <div className="font-display text-xl leading-tight">{w.title}</div>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-wide text-signal">
          {w.category}
          {w.caption ? ` · ${w.caption}` : ""}
        </div>
      </div>
    </>
  );
}

export default function SwipeGallery() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState<CreativeWork[]>([]);
  const [busy, setBusy] = useState(false);
  const [announce, setAnnounce] = useState("");
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-14, 14]);
  const saveOp = useTransform(x, [30, 130], [0, 1]);
  const passOp = useTransform(x, [-130, -30], [1, 0]);

  const done = index >= deck.length;

  const decide = useCallback(
    (dir: 1 | -1) => {
      if (busy || index >= deck.length) return;
      const w = deck[index];
      setBusy(true);
      animate(x, dir * 460, {
        duration: reduce ? 0 : 0.28,
        ease: "easeIn",
        onComplete: () => {
          if (dir === 1) setSaved((s) => [...s, w]);
          setAnnounce(dir === 1 ? `Saved ${w.title}` : `Passed ${w.title}`);
          setIndex((i) => i + 1);
          x.set(0);
          setBusy(false);
        },
      });
    },
    [busy, index, reduce, x]
  );

  const restart = () => {
    x.set(0);
    setSaved([]);
    setIndex(0);
    setAnnounce("Deck restarted");
  };

  useEffect(() => {
    x.set(0);
  }, [index, x]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      decide(1);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      decide(-1);
    }
  };

  return (
    <div className="grid items-start gap-12 lg:grid-cols-[auto_1fr]">
      <div className="mx-auto w-full max-w-[330px]">
        <div className="rounded-[2.4rem] border border-line bg-graphite p-2.5 shadow-[0_40px_80px_-40px_rgba(180,255,57,0.25)]">
          <div className="relative flex h-[600px] flex-col overflow-hidden rounded-[1.9rem] bg-ink">
            <div className="flex items-center justify-between px-5 pb-2 pt-4">
              <span className="font-display text-lg">Eart<span className="text-signal">Galla</span></span>
              <span className="font-mono text-[10px] uppercase tracking-wide text-mist">{done ? deck.length : index + 1} / {deck.length}</span>
            </div>

            <div
              tabIndex={0}
              role="group"
              aria-label="Artwork deck. Press the right arrow to save and the left arrow to pass."
              onKeyDown={onKey}
              className="relative mx-4 flex-1 outline-offset-4"
            >
              {done ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="font-display text-3xl">That&apos;s the collection.</div>
                  <p className="mt-3 text-sm text-mist">You saved {saved.length} of {deck.length}.</p>
                  <button onClick={restart} className="btn-ghost mt-6"><RotateCcw className="h-4 w-4" /> Start again</button>
                </div>
              ) : (
                <>
                  {[2, 1].map((off) => {
                    const w = deck[index + off];
                    return w ? (
                      <div key={w.src} className="absolute inset-0 overflow-hidden rounded-2xl border border-line bg-black" style={{ transform: `translateY(${off * 12}px) scale(${1 - off * 0.05})`, opacity: 1 - off * 0.25 }} aria-hidden>
                        <Image src={w.src} alt="" fill sizes="320px" className={w.width > w.height ? "object-contain" : "object-cover"} />
                      </div>
                    ) : null;
                  })}
                  <motion.div
                    key={deck[index].src}
                    drag={busy ? false : "x"}
                    dragElastic={0.9}
                    dragMomentum={false}
                    dragConstraints={{ left: 0, right: 0 }}
                    style={{ x, rotate: reduce ? 0 : rotate }}
                    onDragEnd={(_, info) => {
                      if (Math.abs(info.offset.x) > 110 || Math.abs(info.velocity.x) > 600) decide(info.offset.x > 0 ? 1 : -1);
                      else animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
                    }}
                    className="absolute inset-0 cursor-grab touch-pan-y overflow-hidden rounded-2xl border border-line bg-black active:cursor-grabbing"
                  >
                    <Art w={deck[index]} priority />
                    <motion.div style={{ opacity: saveOp }} className="pointer-events-none absolute left-4 top-4 -rotate-12 rounded-md border-2 border-signal px-3 py-1 font-mono text-sm font-bold uppercase tracking-widest text-signal">Save</motion.div>
                    <motion.div style={{ opacity: passOp }} className="pointer-events-none absolute right-4 top-4 rotate-12 rounded-md border-2 border-mist px-3 py-1 font-mono text-sm font-bold uppercase tracking-widest text-mist">Pass</motion.div>
                  </motion.div>
                </>
              )}
            </div>

            <div className="flex items-center justify-center gap-6 px-4 pb-5 pt-4">
              <button onClick={() => decide(-1)} disabled={done || busy} aria-label="Pass this artwork" className="flex h-14 w-14 items-center justify-center rounded-full border border-line text-mist transition-colors hover:border-paper hover:text-paper disabled:opacity-30">
                <X className="h-6 w-6" />
              </button>
              <button onClick={() => decide(1)} disabled={done || busy} aria-label="Save this artwork" className="flex h-14 w-14 items-center justify-center rounded-full bg-signal text-ink transition-colors hover:bg-paper disabled:opacity-30">
                <Heart className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">Saved ({saved.length})</p>
        {saved.length === 0 ? (
          <p className="mt-4 max-w-md text-mist">Drag a card right to save it, left to pass. Or use the buttons, or the arrow keys once the deck is focused.</p>
        ) : (
          <ul className="mt-4 grid max-w-md grid-cols-4 gap-2">
            {saved.map((w) => (
              <li key={w.src} className="relative aspect-square overflow-hidden border border-line bg-graphite">
                <Image src={w.src} alt={w.title} fill sizes="90px" className="object-cover" />
              </li>
            ))}
          </ul>
        )}
        <div className="mt-10 max-w-md border-l-2 border-signal pl-5 text-sm text-mist">
          <strong className="text-paper">An interaction study, not the app.</strong> This explores how browsing the EartGalla collection could feel in a thumb-sized interface. It uses real pieces from the gallery. The shipped EartGalla Mobile screens will appear in its case study once they&apos;re ready.
        </div>
      </div>
      <p className="sr-only" aria-live="polite">{announce}</p>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { creativeWorks, creativeCategories, creativeSlots, CreativeWork } from "@/data/creative";

export default function CreativeGallery({ filters = true, limit, slots = false }: { filters?: boolean; limit?: number; slots?: boolean }) {
  const [cat, setCat] = useState<(typeof creativeCategories)[number]>("All");
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  let items: CreativeWork[] = cat === "All" ? creativeWorks : creativeWorks.filter((w) => w.category === cat);
  if (limit) {
    // category-balanced pick: one work per category first, then fill in order
    const firsts = creativeCategories.slice(1).map((c) => items.find((w) => w.category === c)).filter((w): w is CreativeWork => !!w);
    items = [...firsts, ...items.filter((w) => !firsts.includes(w))].slice(0, limit);
  }
  const openSlots = slots ? creativeSlots.filter((s) => cat === "All" || s.category === cat) : [];

  const close = useCallback(() => {
    setOpenIdx(null);
    triggerRef.current?.focus();
  }, []);
  const step = useCallback((d: number) => setOpenIdx((i) => (i === null ? i : (i + d + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (openIdx === null) return;
    document.body.classList.add("no-scroll");
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "Tab") {
        e.preventDefault(); // single-control focus trap: keep focus on the dialog controls
        closeRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("no-scroll");
    };
  }, [openIdx, close, step]);

  const current = openIdx !== null ? items[openIdx] : null;

  return (
    <div>
      {filters && (
        <div role="group" aria-label="Filter creative work by category" className="mb-10 flex flex-wrap gap-2">
          {creativeCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={clsx("rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wide transition-colors", cat === c ? "border-signal bg-signal text-ink" : "border-line text-mist hover:border-signal hover:text-signal")}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <ul className="masonry">
        {items.map((w, i) => (
          <li key={w.src}>
            <button
              onClick={(e) => {
                triggerRef.current = e.currentTarget;
                setOpenIdx(i);
              }}
              className="group relative block w-full overflow-hidden bg-graphite text-left"
              aria-label={`Open ${w.title} full screen`}
            >
              <Image src={w.src} alt={w.alt} width={w.width} height={w.height} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="h-auto w-full transition-transform duration-700 ease-engineer group-hover:scale-[1.04]" />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-ink/90 to-transparent p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                <span className="block font-display text-lg">{w.title}</span>
                <span className="font-mono text-[11px] uppercase tracking-wide text-signal">{w.category}</span>
              </span>
            </button>
          </li>
        ))}
        {openSlots.map((s) => (
          <li key={`slot-${s.category}`}>
            <div className="flex aspect-[4/5] flex-col items-center justify-center gap-2 border border-dashed border-line p-6 text-center">
              <span className="font-mono text-[11px] uppercase tracking-wide text-signal">{s.category}</span>
              <span className="font-display text-lg text-mist">Open slot</span>
              <span className="max-w-[16rem] text-xs text-mist">{s.hint}. Nothing is shown here until a real piece is added.</span>
            </div>
          </li>
        ))}
      </ul>

      {current && (
        <div role="dialog" aria-modal="true" aria-label={current.title} className="fixed inset-0 z-[90] flex flex-col bg-ink/95 backdrop-blur-sm" onClick={close}>
          <div className="flex items-center justify-between p-4 md:p-6" onClick={(e) => e.stopPropagation()}>
            <div>
              <div className="font-display text-xl">{current.title}</div>
              <div className="font-mono text-[11px] uppercase tracking-wide text-signal">
                {current.category}
                {current.caption ? ` · ${current.caption}` : ""}
              </div>
            </div>
            <button ref={closeRef} onClick={close} aria-label="Close preview" className="rounded-full border border-line p-2.5 hover:border-signal hover:text-signal">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative min-h-0 flex-1" onClick={(e) => e.stopPropagation()}>
            <Image src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain p-4 md:p-10" priority />
          </div>
          {items.length > 1 && (
            <div className="flex justify-center gap-3 p-4" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => step(-1)} aria-label="Previous work" className="rounded-full border border-line p-3 hover:border-signal hover:text-signal">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="self-center font-mono text-xs text-mist">
                {(openIdx ?? 0) + 1} / {items.length}
              </span>
              <button onClick={() => step(1)} aria-label="Next work" className="rounded-full border border-line p-3 hover:border-signal hover:text-signal">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

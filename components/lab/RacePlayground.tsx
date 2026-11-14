"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { simulate } from "@/lib/raceSim";

function Switch({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={clsx("flex w-full items-start gap-4 rounded-sm border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal", checked ? "border-signal" : "border-line hover:border-signal")}>
      <span aria-hidden className={clsx("mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full border p-0.5 transition-colors", checked ? "border-signal bg-signal" : "border-line")}>
        <span className={clsx("h-4 w-4 rounded-full transition-transform motion-reduce:transition-none", checked ? "translate-x-5 bg-ink" : "bg-mist")} />
      </span>
      <span><span className="block font-display text-lg">{label}: {checked ? "on" : "off"}</span><span className="mt-1 block text-sm text-mist">{hint}</span></span>
    </button>
  );
}

const actorColour: Record<string, string> = { Alice: "text-signal", Ben: "text-[#7fb8ff]", Database: "text-mist", Network: "text-rust" };

export default function RacePlayground() {
  const [tx, setTx] = useState(false);
  const [idem, setIdem] = useState(false);
  const [shown, setShown] = useState(0);
  const { steps, verdict } = useMemo(() => simulate(tx, idem), [tx, idem]);
  const done = shown >= steps.length;
  const state = shown > 0 ? steps[Math.min(shown, steps.length) - 1] : null;

  const set = (fn: () => void) => { fn(); setShown(0); };

  return (
    <div className="grid gap-10 lg:grid-cols-[360px_1fr]">
      <div className="space-y-4">
        <Switch checked={tx} onChange={(v) => set(() => setTx(v))} label="Transaction" hint="Lock the stock row while checking and updating it, so the second buyer waits and then sees the true number." />
        <Switch checked={idem} onChange={(v) => set(() => setIdem(v))} label="Idempotency key" hint="Each request carries a unique key. A repeated key returns the first result instead of running again." />
        <div className="flex flex-wrap gap-2 pt-2">
          <button onClick={() => setShown((s) => Math.min(steps.length, s + 1))} disabled={done} className="rounded-full border border-signal bg-signal px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-ink disabled:opacity-40">Next step</button>
          <button onClick={() => setShown(steps.length)} disabled={done} className="rounded-full border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-mist hover:border-signal hover:text-signal disabled:opacity-40">Run all</button>
          <button onClick={() => setShown(0)} className="rounded-full border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-mist hover:border-signal hover:text-signal">Reset</button>
        </div>
        <dl className="grid grid-cols-2 gap-3 pt-2">
          <div className="rounded-sm border border-line p-4"><dt className="font-mono text-[11px] uppercase text-mist">Stock</dt><dd className="mt-1 font-display text-3xl">{state ? state.stock : 1}</dd></div>
          <div className="rounded-sm border border-line p-4"><dt className="font-mono text-[11px] uppercase text-mist">Reservations</dt><dd className="mt-1 font-display text-3xl">{state ? state.reservations.length : 0}<span className="ml-2 font-mono text-xs text-mist">{state?.reservations.join(", ")}</span></dd></div>
        </dl>
      </div>

      <div>
        <ol aria-live="polite" className="space-y-2">
          {steps.slice(0, shown).map((s, i) => (
            <li key={i} className={clsx("grid grid-cols-[84px_1fr] gap-3 rounded-sm border px-4 py-3 text-sm", s.tone === "bad" ? "border-rust/70" : s.tone === "good" ? "border-signal/60" : "border-line")}>
              <span className={clsx("font-mono text-[11px] uppercase tracking-wide", actorColour[s.actor])}>{s.actor}</span>
              <span className="text-paper">{s.text}</span>
            </li>
          ))}
          {shown === 0 && <li className="rounded-sm border border-dashed border-line px-4 py-8 text-center text-sm text-mist">Choose your settings, then press Next step to replay what happens.</li>}
        </ol>
        {done && (
          <div role="status" className={clsx("mt-6 rounded-sm border-2 p-5", verdict.kind === "ok" ? "border-signal" : verdict.kind === "warn" ? "border-[#e8b84a]" : "border-rust")}>
            <p className="font-mono text-[11px] uppercase tracking-wide text-mist">{verdict.kind === "ok" ? "Correct outcome" : verdict.kind === "warn" ? "Partly correct" : "Failure"}</p>
            <p className="mt-1 font-display text-xl">{verdict.title}</p>
            <p className="mt-2 text-sm text-mist">{verdict.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}

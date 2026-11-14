"use client";

import { useId, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { CustodyEvent, STAGES, stageById, fmtDate, fmtHours } from "@/data/custody";

type Link = { id: string; stageId: string; location: string };
const START = new Date("2026-01-12T06:00:00+03:00").getTime();
let counter = 0;
const uid = () => `l${++counter}`;
const mk = (stageId: string, location = ""): Link => ({ id: uid(), stageId, location: location || `${stageById(stageId)?.label} point` });

const EXAMPLE = () => [mk("harvest", "Demo Farm"), mk("pack", "Demo Farm"), mk("transport", "Road to Nairobi"), mk("market", "Demo Market"), mk("sale", "Demo Market")];

// The single source of truth: Link[] → CustodyEvent[]. Everything on screen is derived from this.
function toEvents(chain: Link[]): CustodyEvent[] {
  let t = START;
  return chain.map((l, i) => {
    const stage = stageById(l.stageId)!;
    const ev: CustodyEvent = { id: l.id, stageId: l.stageId, at: new Date(t).toISOString(), location: l.location, note: stage.blurb };
    t += stage.defaultHours * 3.6e6;
    void i;
    return ev;
  });
}

function checks(chain: Link[]) {
  const issues: string[] = [];
  const ids = chain.map((c) => c.stageId);
  if (ids.length === 0) return ["The chain is empty. Add a Harvest stage to begin."];
  if (ids[0] !== "harvest") issues.push("A chain should start at Harvest so the origin is recorded.");
  const t = ids.indexOf("transport"), p = ids.indexOf("pack");
  if (t >= 0 && (p < 0 || p > t)) issues.push("Transport happens before Packing, so the crate has no QR label yet to track.");
  if (ids.includes("cold") && ids.indexOf("cold") < p) issues.push("Cold storage comes before Packing.");
  if (ids[ids.length - 1] !== "sale") issues.push("The chain doesn't end at the consumer, so the journey isn't complete.");
  return issues;
}

export default function CustodyChain() {
  const [chain, setChain] = useState<Link[]>(EXAMPLE);
  const [pick, setPick] = useState(STAGES[0].id);
  const selId = useId();
  const events = useMemo(() => toEvents(chain), [chain]);
  const issues = useMemo(() => checks(chain), [chain]);
  const handoffs = events.reduce((n, e, i) => n + (i > 0 && stageById(e.stageId)?.role !== stageById(events[i - 1].stageId)?.role ? 1 : 0), 0);
  const elapsed = events.length > 1 ? (new Date(events[events.length - 1].at).getTime() - START) / 3.6e6 : 0;

  const move = (i: number, d: number) => setChain((c) => { const n = [...c]; const j = i + d; if (j < 0 || j >= n.length) return c; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const remove = (id: string) => setChain((c) => c.filter((l) => l.id !== id));
  const btn = "rounded-full border border-line p-2 text-mist transition-colors hover:border-signal hover:text-signal disabled:opacity-30 disabled:hover:border-line disabled:hover:text-mist focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal";

  return (
    <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <ol className="relative border-l border-line pl-6">
          {chain.length === 0 && <li className="rounded-sm border border-dashed border-line px-4 py-8 text-center text-sm text-mist">No stages yet. Add one below.</li>}
          {events.map((e, i) => {
            const stage = stageById(e.stageId)!;
            const gap = i > 0 ? (new Date(e.at).getTime() - new Date(events[i - 1].at).getTime()) / 3.6e6 : null;
            return (
              <li key={e.id} className="relative pb-6 last:pb-0">
                <span aria-hidden className="absolute -left-[31px] top-3 h-3 w-3 rounded-full border-2 border-signal bg-ink" />
                {gap !== null && <p className="mb-2 font-mono text-[11px] text-mist">↓ {fmtHours(gap)} later</p>}
                <div className="rounded-sm border border-line p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-wide text-signal">{i + 1}. {stage.label} · held by {stage.role}</p>
                      <p className="mt-1 text-sm text-mist">{stage.blurb}</p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button className={btn} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${stage.label} up`}><ArrowUp className="h-4 w-4" /></button>
                      <button className={btn} onClick={() => move(i, 1)} disabled={i === events.length - 1} aria-label={`Move ${stage.label} down`}><ArrowDown className="h-4 w-4" /></button>
                      <button className={btn} onClick={() => remove(e.id)} aria-label={`Remove ${stage.label}`}><X className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <label className="mt-3 block font-mono text-[11px] uppercase text-mist">
                    Location
                    <input value={chain[i].location} onChange={(ev) => setChain((c) => c.map((l) => (l.id === e.id ? { ...l, location: ev.target.value } : l)))} maxLength={60}
                      className="mt-1 w-full rounded-sm border border-line bg-transparent px-3 py-2 font-sans text-sm normal-case text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal" />
                  </label>
                  <p className="mt-2 font-mono text-[11px] text-mist">{fmtDate(e.at)}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor={selId} className="block font-mono text-[11px] uppercase text-mist">Add a stage</label>
            <select id={selId} value={pick} onChange={(e) => setPick(e.target.value)} className="mt-1 rounded-sm border border-line bg-ink px-3 py-2.5 text-sm text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal">
              {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <button onClick={() => setChain((c) => [...c, mk(pick)])} className="inline-flex items-center gap-2 rounded-full border border-signal bg-signal px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-ink"><Plus className="h-4 w-4" /> Add</button>
          <button onClick={() => setChain(EXAMPLE())} className="rounded-full border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-mist hover:border-signal hover:text-signal">Reset example</button>
          <button onClick={() => setChain([])} className="rounded-full border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-mist hover:border-rust hover:text-rust">Clear</button>
        </div>
      </div>

      <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
        <dl className="grid grid-cols-3 gap-3">
          {[["Stages", String(events.length)], ["Handoffs", String(handoffs)], ["Elapsed", fmtHours(elapsed)]].map(([k, v]) => (
            <div key={k} className="rounded-sm border border-line p-4"><dt className="font-mono text-[11px] uppercase text-mist">{k}</dt><dd className="mt-1 font-display text-xl">{v}</dd></div>
          ))}
        </dl>
        <div role="status" aria-live="polite" className={`rounded-sm border-2 p-5 ${issues.length ? "border-[#e8b84a]" : "border-signal"}`}>
          <p className="font-mono text-[11px] uppercase tracking-wide text-mist">{issues.length ? "Chain check: gaps found" : "Chain check: complete"}</p>
          {issues.length ? <ul className="mt-2 space-y-1.5 text-sm text-paper">{issues.map((i) => <li key={i}>— {i}</li>)}</ul> : <p className="mt-2 text-sm text-paper">Origin to consumer, in a sensible order.</p>}
        </div>
        <details className="rounded-sm border border-line p-4">
          <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-wide text-signal">View the data model (JSON)</summary>
          <pre className="mt-3 max-h-72 overflow-auto text-[11px] leading-relaxed text-mist" tabIndex={0}>{JSON.stringify(events, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
}

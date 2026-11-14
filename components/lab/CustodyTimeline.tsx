import { CustodyEvent, stageById, fmtDate, fmtHours } from "@/data/custody";

/** Presentational timeline used by the QR Trace custody page. */
export default function CustodyTimeline({ events }: { events: CustodyEvent[] }) {
  return (
    <ol className="relative border-l border-line pl-6">
      {events.map((e, i) => {
        const stage = stageById(e.stageId);
        const gap = i > 0 ? (new Date(e.at).getTime() - new Date(events[i - 1].at).getTime()) / 3.6e6 : null;
        return (
          <li key={e.id} className="relative pb-8 last:pb-0">
            <span aria-hidden className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-signal bg-ink" />
            <p className="font-mono text-[11px] uppercase tracking-wide text-signal">{stage?.label ?? e.stageId} · {stage?.role}</p>
            <p className="mt-1 font-display text-lg">{e.location}</p>
            <p className="mt-1 text-sm text-mist">{e.note}</p>
            <p className="mt-1 font-mono text-[11px] text-mist">{fmtDate(e.at)}{gap !== null && ` · ${fmtHours(gap)} after the previous step`}</p>
          </li>
        );
      })}
    </ol>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CustodyTimeline from "@/components/lab/CustodyTimeline";
import { getBatch, mockBatches } from "@/data/mockBatches";
import { fmtHours } from "@/data/custody";

export const dynamicParams = false;
export const generateStaticParams = () => mockBatches.map((b) => ({ batch: b.id }));

export function generateMetadata({ params }: { params: { batch: string } }): Metadata {
  const b = getBatch(params.batch);
  return {
    title: b ? `Demo batch ${b.id}` : "Batch not found",
    description: "A demo custody history page reached by scanning a mock QR code. Mock data only.",
    robots: { index: false, follow: true }, // demo pages stay out of search results
    alternates: b ? { canonical: `/lab/qr-trace/${b.id}` } : undefined,
  };
}

export default function Page({ params }: { params: { batch: string } }) {
  const b = getBatch(params.batch);
  if (!b) notFound();
  const hours = (new Date(b.events[b.events.length - 1].at).getTime() - new Date(b.events[0].at).getTime()) / 3.6e6;
  return (
    <div className="pb-24 pt-36 md:pt-44">
      <div className="container-page max-w-3xl">
        <Link href="/lab/qr-trace" className="font-mono text-xs text-mist hover:text-signal">← QR Trace Demo</Link>
        <p className="mt-6 inline-block rounded-sm border border-dashed border-signal px-3 py-2 font-mono text-[11px] uppercase tracking-wide text-signal">Demo page · mock data · not a real batch</p>
        <h1 className="mt-6 font-display text-display-lg text-balance">{b.crop}</h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-wide text-mist">Batch {b.id} · {b.quantityKg} kg · {b.farm}</p>
        <dl className="mt-8 grid grid-cols-3 gap-4">
          {[["Handoffs", String(b.events.length)], ["Field to shelf", fmtHours(hours)], ["Batch", b.id.split("-")[1]]].map(([k, v]) => (
            <div key={k} className="rounded-sm border border-line p-4"><dt className="font-mono text-[11px] uppercase text-mist">{k}</dt><dd className="mt-1 font-display text-xl">{v}</dd></div>
          ))}
        </dl>
        <h2 className="eyebrow mt-12 mb-6">Custody history</h2>
        <CustodyTimeline events={b.events} />
        <p className="mt-12 text-sm text-mist">This is what a buyer would see after scanning the code. See how the real thing is built in the <Link href="/work/greentrack" className="text-paper underline decoration-signal underline-offset-4">GreenTrack case study</Link>.</p>
      </div>
    </div>
  );
}

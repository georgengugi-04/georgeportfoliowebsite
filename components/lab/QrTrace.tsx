"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { encode } from "uqr";
import { mockBatches } from "@/data/mockBatches";

export default function QrTrace() {
  const [id, setId] = useState(mockBatches[0].id);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => setOrigin(window.location.origin), []);

  const batch = mockBatches.find((b) => b.id === id)!;
  const path = `/lab/qr-trace/${id}`;
  const url = origin ? origin + path : "";
  const qr = useMemo(() => (url ? encode(url, { ecc: "M", border: 0 }).data : null), [url]);

  const svg = useMemo(() => {
    if (!qr) return "";
    const n = qr.length, q = 3; // quiet zone, in modules
    let d = "";
    qr.forEach((row, y) => row.forEach((on, x) => { if (on) d += `M${x + q} ${y + q}h1v1h-1z`; }));
    // Always dark-on-light: QR scanners need contrast whatever the site theme is.
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n + q * 2} ${n + q * 2}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#0A0B0A"/></svg>`;
  }, [qr]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };
  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    a.download = `${id}-qr.svg`; a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <div className="grid items-start gap-10 md:grid-cols-[320px_1fr]">
      <div>
        <div className="rounded-2xl border border-line bg-white p-4" aria-live="polite">
          {svg ? (
            <div role="img" aria-label={`QR code for mock batch ${id}. It opens the demo custody history page.`} className="aspect-square w-full [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
          ) : (
            <div className="aspect-square w-full animate-pulse rounded bg-neutral-200 motion-reduce:animate-none" aria-label="Generating QR code" />
          )}
        </div>
        <p className="mt-3 font-mono text-[11px] text-mist">Encodes: <span className="break-all text-paper">{url || "…"}</span></p>
      </div>

      <div>
        <fieldset>
          <legend className="font-mono text-xs uppercase tracking-wide text-mist">Pick a mock batch</legend>
          <div className="mt-3 flex flex-col gap-2">
            {mockBatches.map((b) => (
              <label key={b.id} className={`flex cursor-pointer items-center justify-between gap-4 rounded-sm border px-4 py-3 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal ${id === b.id ? "border-signal text-paper" : "border-line text-mist hover:border-signal"}`}>
                <span className="flex items-center gap-3">
                  <input type="radio" name="batch" value={b.id} checked={id === b.id} onChange={() => setId(b.id)} className="accent-[#B4FF39]" />
                  <span><span className="text-paper">{b.crop}</span> · {b.quantityKg} kg · {b.farm}</span>
                </span>
                <span className="font-mono text-[11px]">{b.id}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={path} className="rounded-full border border-signal bg-signal px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-ink">Open custody page →</Link>
          <button onClick={copy} className="rounded-full border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-mist hover:border-signal hover:text-signal">{copied ? "Copied" : "Copy link"}</button>
          <button onClick={download} disabled={!svg} className="rounded-full border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-mist hover:border-signal hover:text-signal disabled:opacity-40">Download SVG</button>
        </div>
        <p className="mt-6 max-w-lg text-sm text-mist">
          Point a phone camera at the code (on the live site) or press the button to see what a buyer would see. {batch.crop} batch {batch.id} is mock data, not real produce.
        </p>
      </div>
    </div>
  );
}

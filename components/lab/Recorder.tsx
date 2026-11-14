"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";

type Graph = { ctx: AudioContext; node: AudioNode };
type Status = "idle" | "recording" | "done";

const MAX_SECS = 300;
const MIMES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
const pickMime = () => (typeof MediaRecorder === "undefined" ? "" : MIMES.find((m) => MediaRecorder.isTypeSupported(m)) ?? "");
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * Records whatever the instrument is playing, optionally mixed with the visitor's voice from the microphone.
 * Everything stays in the browser: the recording is a local blob they can play back or download, nothing is uploaded.
 */
export default function Recorder({ getGraph, name }: { getGraph: () => Graph; name: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [voice, setVoice] = useState(true);
  const [secs, setSecs] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [ext, setExt] = useState("webm");
  const rec = useRef<{ mr: MediaRecorder; stop: () => void } | null>(null);
  const timer = useRef<ReturnType<typeof setInterval>>();
  const urlRef = useRef<string | null>(null);

  // Decided after mount so the server HTML and first client render match.
  const [caps, setCaps] = useState<{ supported: boolean; hasMic: boolean } | null>(null);
  useEffect(() => setCaps({ supported: typeof MediaRecorder !== "undefined", hasMic: !!navigator.mediaDevices?.getUserMedia }), []);
  const hasMic = !!caps?.hasMic;

  const finishTimer = () => { clearInterval(timer.current); };

  const stop = useCallback(() => { rec.current?.stop(); }, []);

  const start = async () => {
    setNote("");
    if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null; setUrl(null); }
    const { ctx, node } = getGraph();
    const dest = ctx.createMediaStreamDestination();
    node.connect(dest);
    let micStream: MediaStream | null = null;
    let micSrc: MediaStreamAudioSourceNode | null = null;
    if (voice && hasMic) {
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
        micSrc = ctx.createMediaStreamSource(micStream);
        micSrc.connect(dest);
      } catch {
        setNote("The microphone was blocked or isn't available, so this take has the instruments only.");
      }
    } else if (voice && !hasMic) {
      setNote("This browser can't reach a microphone, so this take has the instruments only.");
    }
    const mime = pickMime();
    const mr = new MediaRecorder(dest.stream, mime ? { mimeType: mime } : undefined);
    const chunks: Blob[] = [];
    mr.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    mr.onstop = () => {
      finishTimer();
      try { node.disconnect(dest); } catch {}
      micSrc?.disconnect();
      micStream?.getTracks().forEach((t) => t.stop());
      const type = mr.mimeType || mime || "audio/webm";
      const blob = new Blob(chunks, { type });
      const u = URL.createObjectURL(blob);
      urlRef.current = u;
      setExt(type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm");
      setUrl(u); setStatus("done"); rec.current = null;
    };
    rec.current = { mr, stop: () => { if (mr.state !== "inactive") mr.stop(); } };
    mr.start(250);
    setSecs(0); setStatus("recording");
    timer.current = setInterval(() => setSecs((s) => { if (s + 1 >= MAX_SECS) stop(); return s + 1; }), 1000);
  };

  const discard = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null; setUrl(null); setStatus("idle"); setSecs(0);
  };

  useEffect(() => () => { finishTimer(); rec.current?.stop(); if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);

  if (!caps) return null;
  if (!caps.supported) {
    return <p className="mt-10 rounded-2xl border border-line p-5 text-sm text-mist">Recording isn&apos;t supported in this browser. Try a recent Chrome, Edge, Firefox or Safari.</p>;
  }

  return (
    <section aria-labelledby="rec-h" className="mt-10 rounded-2xl border border-line p-5 sm:p-6">
      <h2 id="rec-h" className="eyebrow">Record a song</h2>
      <p className="mt-3 max-w-xl text-sm text-mist">
        Record what you play, and sing or speak over it if you like. Your recording stays on this device: it is not uploaded anywhere. Wear headphones so the microphone doesn&apos;t pick up the speakers.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        {status !== "recording" ? (
          <button onClick={start} className="inline-flex items-center gap-2 rounded-full border border-rust px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-rust transition-colors hover:bg-rust hover:text-paper">
            <span className="h-2.5 w-2.5 rounded-full bg-current" aria-hidden /> {status === "done" ? "Record again" : "Record"}
          </button>
        ) : (
          <button onClick={stop} className="inline-flex items-center gap-2 rounded-full border border-rust bg-rust px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-paper">
            <span className="h-2.5 w-2.5 animate-pulse rounded-sm bg-current" aria-hidden /> Stop · {fmt(secs)}
          </button>
        )}
        <label className={clsx("flex cursor-pointer items-center gap-2 text-sm", status === "recording" ? "opacity-50" : "text-paper")}>
          <input type="checkbox" checked={voice} disabled={status === "recording"} onChange={(e) => setVoice(e.target.checked)} className="h-4 w-4 accent-[#B4FF39]" />
          Include my voice (microphone)
        </label>
      </div>

      <p role="status" aria-live="polite" className="mt-3 min-h-[1.25rem] text-sm text-mist">
        {status === "recording" ? `Recording… ${fmt(secs)} (stops by itself at ${fmt(MAX_SECS)})` : note}
      </p>

      {url && status === "done" && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <audio controls src={url} className="w-full sm:max-w-md" />
          <div className="flex gap-2">
            <a href={url} download={`koshe-${name}-${new Date().toISOString().slice(0, 10)}.${ext}`} className="rounded-full border border-signal px-4 py-2 font-mono text-xs uppercase tracking-wide text-signal transition-colors hover:bg-signal hover:text-ink">Download</a>
            <button onClick={discard} className="rounded-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-wide text-mist hover:border-rust hover:text-rust">Discard</button>
          </div>
        </div>
      )}
    </section>
  );
}

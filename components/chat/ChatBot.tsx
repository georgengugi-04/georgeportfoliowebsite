"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUp, X } from "lucide-react";
import GooglyEyes from "./GooglyEyes";
import { answer, suggestions, type BotReply } from "./answers";

type Msg = { id: number; from: "bot" | "user"; reply: BotReply };

const intro: BotReply = {
  text: "Hi! I'm the Koshe.exe bot, a small scripted assistant (not an AI). I can tell you about George's projects, tech stack and CV, or how to reach him.",
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, from: "bot", reply: intro }]);
  const [text, setText] = useState("");
  const idRef = useRef(1);
  const launcher = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => { if (open) input.current?.focus(); }, [open]);
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight }); }, [msgs, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); launcher.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = (raw: string) => {
    const q = raw.trim().slice(0, 200);
    if (!q) return;
    const userMsg: Msg = { id: idRef.current++, from: "user", reply: { text: q } };
    setMsgs((m) => [...m, userMsg]);
    setText("");
    const t = setTimeout(() => setMsgs((m) => [...m, { id: idRef.current++, from: "bot", reply: answer(q) }]), 350);
    timers.current.push(t);
  };
  const onSubmit = (e: FormEvent) => { e.preventDefault(); send(text); };

  return (
    <>
      {open && (
        <section
          role="dialog"
          aria-label="Chat with the Koshe.exe assistant"
          className="fixed inset-x-3 bottom-24 z-[45] flex h-[min(72vh,540px)] flex-col overflow-hidden rounded-2xl border border-line bg-ink text-paper shadow-2xl sm:inset-x-auto sm:right-5 sm:w-[380px]"
        >
          <div className="flex items-center gap-3 border-b border-line bg-graphite px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lime"><GooglyEyes size={13} /></span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-base leading-tight">Koshe.exe bot</h2>
              <p className="font-mono text-[10px] uppercase tracking-wide text-mist">Scripted assistant · not AI</p>
            </div>
            <button type="button" onClick={() => { setOpen(false); launcher.current?.focus(); }} aria-label="Close chat" className="rounded-full p-2 text-mist transition-colors hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={log} role="log" aria-live="polite" aria-label="Conversation" className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {msgs.map((m) => (
              <div key={m.id} className={m.from === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.from === "user" ? "rounded-br-sm bg-lime text-night" : "rounded-bl-sm bg-graphite"}`}>
                  <p>{m.reply.text}</p>
                  {m.reply.links && m.reply.links.length > 0 && (
                    <ul className="mt-2.5 flex flex-wrap gap-2">
                      {m.reply.links.map((l) => (
                        <li key={l.href + l.label}>
                          {l.external || l.href.endsWith(".pdf") ? (
                            <a href={l.href} {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : { download: true })} className="inline-block rounded-full border border-signal px-3 py-1 font-mono text-xs text-signal transition-colors hover:bg-signal hover:text-ink">{l.label}</a>
                          ) : (
                            <Link href={l.href} className="inline-block rounded-full border border-signal px-3 py-1 font-mono text-xs text-signal transition-colors hover:bg-signal hover:text-ink">{l.label}</Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>

          <ul className="flex gap-2 overflow-x-auto border-t border-line px-4 py-2.5 [scrollbar-width:none]" aria-label="Suggested questions">
            {suggestions.map((s) => (
              <li key={s} className="shrink-0">
                <button type="button" onClick={() => send(s)} className="rounded-full border border-line px-3 py-1.5 font-mono text-xs text-mist transition-colors hover:border-signal hover:text-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal">{s}</button>
              </li>
            ))}
          </ul>

          <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-line p-3">
            <label htmlFor="chat-input" className="sr-only">Ask a question</label>
            <input
              ref={input}
              id="chat-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={200}
              autoComplete="off"
              placeholder="Ask about projects, skills, CV…"
              className="min-w-0 flex-1 rounded-full border border-line bg-ink px-4 py-2.5 text-base text-paper placeholder:text-mist focus:border-signal focus:outline-none sm:text-sm"
            />
            <button type="submit" aria-label="Send message" disabled={!text.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime text-night transition-opacity disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal">
              <ArrowUp className="h-4 w-4" />
            </button>
          </form>
        </section>
      )}

      <button
        ref={launcher}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        className="fixed bottom-5 right-4 z-[44] flex h-16 w-16 items-center justify-center rounded-full border-2 border-night bg-lime shadow-[0_10px_30px_-8px_rgba(0,0,0,0.6)] transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal sm:right-5"
      >
        <GooglyEyes size={22} />
      </button>
    </>
  );
}

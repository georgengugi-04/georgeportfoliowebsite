"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import clsx from "clsx";

const types = ["Web platform", "Mobile app", "UI/UX or graphic design", "Role / opportunity", "Something else"];
type Errors = Partial<Record<"name" | "email" | "message", string>>;
type State = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

const validate = (v: { name: string; email: string; message: string }): Errors => {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = "Please enter a valid email address.";
  if (v.message.trim().length < 10) e.message = "Tell me a little more — at least 10 characters.";
  return e;
};

export default function ContactForm({ fallbackEmail }: { fallbackEmail?: string }) {
  const [values, setValues] = useState({ name: "", email: "", message: "", company: "" });
  const [type, setType] = useState(types[0]);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, type }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) return setState({ kind: "sent" });
      if (res.status === 503)
        return setState({ kind: "error", message: "The contact form isn't connected to an email service yet, so your message was NOT sent." + (fallbackEmail ? " Please email me directly instead." : "") });
      if (res.status === 422 && data.errors) {
        setErrors(data.errors);
        return setState({ kind: "idle" });
      }
      setState({ kind: "error", message: data.error || "Something went wrong and your message was not sent. Please try again." });
    } catch {
      setState({ kind: "error", message: "Network error — your message was not sent. Please check your connection and try again." });
    }
  }

  if (state.kind === "sent")
    return (
      <div role="status" className="border border-signal p-8">
        <div className="font-display text-2xl text-signal">Message sent.</div>
        <p className="mt-3 text-sm text-mist">Thanks for reaching out. I&apos;ll reply to {values.email} soon.</p>
      </div>
    );

  const field = "mt-2 w-full border-b bg-transparent py-3 outline-none transition-colors focus-visible:border-signal";
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-7" aria-describedby={state.kind === "error" ? "form-error" : undefined}>
      {(["name", "email"] as const).map((f) => (
        <div key={f}>
          <label htmlFor={f} className="eyebrow">{f === "name" ? "Name" : "Email"}</label>
          <input
            id={f}
            name={f}
            type={f === "email" ? "email" : "text"}
            autoComplete={f}
            value={values[f]}
            onChange={(e) => setValues({ ...values, [f]: e.target.value })}
            aria-invalid={!!errors[f]}
            aria-describedby={errors[f] ? `${f}-err` : undefined}
            className={clsx(field, errors[f] ? "border-rust" : "border-line")}
            placeholder={f === "name" ? "Your name" : "you@example.com"}
          />
          {errors[f] && <p id={`${f}-err`} className="mt-1.5 text-xs text-rust">{errors[f]}</p>}
        </div>
      ))}
      <fieldset>
        <legend className="eyebrow">What is it about?</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {types.map((t) => (
            <button type="button" key={t} aria-pressed={type === t} onClick={() => setType(t)} className={clsx("rounded-full border px-4 py-2 font-mono text-xs transition-colors", type === t ? "border-signal text-signal" : "border-line text-mist hover:text-paper")}>
              {t}
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="message" className="eyebrow">Message</label>
        <textarea id="message" name="message" rows={5} value={values.message} onChange={(e) => setValues({ ...values, message: e.target.value })} aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-err" : undefined} className={clsx(field, "resize-none", errors.message ? "border-rust" : "border-line")} placeholder="What are you building?" />
        {errors.message && <p id="message-err" className="mt-1.5 text-xs text-rust">{errors.message}</p>}
      </div>
      {/* honeypot — real visitors never see or fill this */}
      <div className="absolute left-[-9999px]" aria-hidden>
        <label htmlFor="company">Company</label>
        <input id="company" tabIndex={-1} autoComplete="off" value={values.company} onChange={(e) => setValues({ ...values, company: e.target.value })} />
      </div>
      {state.kind === "error" && (
        <p id="form-error" role="alert" className="border border-rust/60 p-4 text-sm text-rust">
          {state.message}
          {fallbackEmail && <> <a href={`mailto:${fallbackEmail}`} className="underline">{fallbackEmail}</a></>}
        </p>
      )}
      <button type="submit" disabled={state.kind === "sending"} className="btn-primary self-start disabled:opacity-60">
        {state.kind === "sending" ? <>Sending <Loader2 className="h-4 w-4 animate-spin" /></> : <>Send message <ArrowRight className="h-4 w-4" /></>}
      </button>
    </form>
  );
}

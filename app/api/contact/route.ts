import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Sends mail through Resend's REST API. Requires RESEND_API_KEY and CONTACT_TO_EMAIL (see README).
// If they aren't set the route answers 503 — it never pretends a message was sent.
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (clean(body.company, 100)) return NextResponse.json({ ok: true }); // honeypot: silently drop bots

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const message = clean(body.message, 5000);
  const type = clean(body.type, 80);

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Please enter a valid email address.";
  if (message.length < 10) errors.message = "Tell me a little more — at least 10 characters.";
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
      to: [to],
      reply_to: email,
      subject: `Portfolio enquiry — ${type || "General"} — ${name}`,
      text: `From: ${name} <${email}>\nTopic: ${type}\n\n${message}`,
    }),
  });
  if (!res.ok) return NextResponse.json({ error: "The email service rejected the message. Please try again later." }, { status: 502 });
  return NextResponse.json({ ok: true });
}

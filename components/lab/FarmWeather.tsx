"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Daily = { date: string; tmax: number; tmin: number; rain: number; prob: number; code: number };
type Data = { fetchedAt: number; temp: number; humidity: number; wind: number; precip: number; code: number; daily: Daily[] };
type Status = "loading" | "ready" | "error" | "offline";

const URL_ = "https://api.open-meteo.com/v1/forecast?latitude=-1.2921&longitude=36.8219&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=Africa%2FNairobi&forecast_days=5";
const CACHE = "kw-nairobi-v1";

const WMO: Record<number, string> = { 0: "Clear sky", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Fog", 48: "Rime fog", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain", 80: "Rain showers", 81: "Heavy showers", 82: "Violent showers", 95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Severe thunderstorm" };
const describe = (c: number) => WMO[c] ?? "Mixed conditions";
const day = (iso: string, i: number) => (i === 0 ? "Today" : new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric" }).format(new Date(iso + "T12:00:00")));

function notes(d: Data): string[] {
  const t = d.daily[0], n: string[] = [];
  if (t.prob >= 60 || t.rain >= 5) n.push("Rain is likely today: hold off spraying and top-dressing, and check drainage.");
  else if (t.prob <= 20 && t.rain < 1) n.push("A dry day is likely: good for spraying, weeding and harvesting.");
  if (t.tmax >= 28) n.push("A warm afternoon: water early in the morning or late in the day.");
  if (t.tmin <= 10) n.push("A cool night: protect young seedlings.");
  if (d.wind >= 25) n.push("It is windy: avoid spraying, as the drift will waste product.");
  if (!n.length) n.push("Steady conditions: no special precautions from the forecast.");
  return n;
}

function readCache(): Data | null {
  try { const s = localStorage.getItem(CACHE); return s ? (JSON.parse(s) as Data) : null; } catch { return null; }
}

export default function FarmWeather() {
  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState("");
  const ctl = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    ctl.current?.abort();
    if (!navigator.onLine) { setData(readCache()); setStatus("offline"); return; }
    const c = new AbortController(); ctl.current = c;
    const timeout = setTimeout(() => c.abort(), 10000);
    setStatus("loading");
    try {
      const r = await fetch(URL_, { signal: c.signal });
      if (!r.ok) throw new Error(`The weather service answered ${r.status}.`);
      const j = await r.json();
      const d: Data = {
        fetchedAt: Date.now(), temp: j.current.temperature_2m, humidity: j.current.relative_humidity_2m, wind: j.current.wind_speed_10m, precip: j.current.precipitation, code: j.current.weather_code,
        daily: j.daily.time.map((t: string, i: number): Daily => ({ date: t, tmax: j.daily.temperature_2m_max[i], tmin: j.daily.temperature_2m_min[i], rain: j.daily.precipitation_sum[i], prob: j.daily.precipitation_probability_max[i] ?? 0, code: j.daily.weather_code[i] })),
      };
      try { localStorage.setItem(CACHE, JSON.stringify(d)); } catch {}
      setData(d); setStatus("ready");
    } catch (e) {
      if (c.signal.aborted && ctl.current !== c) return; // superseded by a newer request
      setErr(c.signal.aborted ? "The request took too long." : e instanceof Error ? e.message : "Something went wrong.");
      setData(readCache()); setStatus(navigator.onLine ? "error" : "offline");
    } finally { clearTimeout(timeout); }
  }, []);

  useEffect(() => {
    void load();
    const on = () => void load();
    const off = () => { ctl.current?.abort(); setData(readCache()); setStatus("offline"); };
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); ctl.current?.abort(); };
  }, [load]);

  const retry = <button onClick={() => void load()} className="mt-4 rounded-full border border-signal bg-signal px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-ink">Try again</button>;

  return (
    <div aria-busy={status === "loading"}>
      {status === "loading" && !data && (
        <div role="status" aria-label="Loading the Nairobi forecast" className="space-y-4">
          <div className="h-40 animate-pulse rounded-sm border border-line bg-white/[0.04] motion-reduce:animate-none" />
          <div className="grid grid-cols-5 gap-3">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-28 animate-pulse rounded-sm border border-line bg-white/[0.04] motion-reduce:animate-none" />)}</div>
          <p className="font-mono text-xs text-mist">Fetching from Open-Meteo…</p>
        </div>
      )}

      {status === "error" && (
        <div role="alert" className="mb-6 rounded-sm border-2 border-rust p-5">
          <p className="font-display text-xl">Couldn&apos;t load the forecast</p>
          <p className="mt-1 text-sm text-mist">{err} {data ? "Showing the last saved forecast below." : ""}</p>
          {retry}
        </div>
      )}
      {status === "offline" && (
        <div role="status" className="mb-6 rounded-sm border-2 border-[#e8b84a] p-5">
          <p className="font-display text-xl">You&apos;re offline</p>
          <p className="mt-1 text-sm text-mist">{data ? `Showing the forecast saved at ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(data.fetchedAt)}. It will refresh when you reconnect.` : "No saved forecast on this device yet. It will load as soon as you reconnect."}</p>
        </div>
      )}

      {data && (
        <div className={status === "offline" || status === "error" ? "opacity-70" : ""}>
          <div className="grid gap-6 rounded-sm border border-line p-6 md:grid-cols-[auto_1fr]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wide text-mist">Nairobi now</p>
              <p className="mt-1 font-display text-6xl">{Math.round(data.temp)}°C</p>
              <p className="mt-1 text-paper">{describe(data.code)}</p>
            </div>
            <dl className="grid grid-cols-3 content-center gap-4 text-sm">
              {[["Humidity", `${data.humidity}%`], ["Wind", `${Math.round(data.wind)} km/h`], ["Rain now", `${data.precip} mm`]].map(([k, v]) => (
                <div key={k}><dt className="font-mono text-[11px] uppercase text-mist">{k}</dt><dd className="mt-1 font-display text-2xl">{v}</dd></div>
              ))}
            </dl>
          </div>

          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5" aria-label="Five-day outlook">
            {data.daily.map((d, i) => (
              <li key={d.date} className="rounded-sm border border-line p-4">
                <p className="font-mono text-[11px] uppercase text-signal">{day(d.date, i)}</p>
                <p className="mt-2 font-display text-xl">{Math.round(d.tmax)}° <span className="text-mist">/ {Math.round(d.tmin)}°</span></p>
                <p className="mt-1 text-xs text-mist">{describe(d.code)}</p>
                <p className="mt-2 font-mono text-[11px] text-mist">{d.prob}% rain · {d.rain} mm</p>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-sm border border-line p-5">
            <p className="font-mono text-[11px] uppercase tracking-wide text-signal">Farm notes for today</p>
            <ul className="mt-2 space-y-1.5 text-sm text-paper">{notes(data).map((n) => <li key={n}>— {n}</li>)}</ul>
            <p className="mt-3 text-xs text-mist">Simple rules applied to the forecast. Not agronomic advice.</p>
          </div>
        </div>
      )}

      {status === "offline" && !data && <div className="rounded-sm border border-dashed border-line px-4 py-12 text-center text-sm text-mist">Waiting for a connection…</div>}
      {status === "error" && !data && null}
      <p className="mt-6 font-mono text-[11px] text-mist">Data: <a href="https://open-meteo.com/" className="underline decoration-signal underline-offset-4 hover:text-paper" rel="noopener noreferrer" target="_blank">Open-Meteo.com</a> · no API key · Nairobi (−1.29, 36.82)</p>
    </div>
  );
}

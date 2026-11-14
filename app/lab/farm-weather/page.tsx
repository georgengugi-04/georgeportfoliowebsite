import type { Metadata } from "next";
import ExperimentShell from "@/components/lab/ExperimentShell";
import FarmWeather from "@/components/lab/FarmWeather";

export const metadata: Metadata = {
  title: "Nairobi Farm Weather — Lab 012",
  description: "Live Nairobi weather and a five-day outlook from Open-Meteo with loading, error and offline states, plus plain-language farm notes.",
  alternates: { canonical: "/lab/farm-weather" },
};

export default function Page() {
  return (
    <ExperimentShell
      n="012" title="Nairobi Farm Weather" line="The forecast, in farm terms."
      shows="Weather decides when to spray, water and harvest. This widget pulls live conditions for Nairobi and turns the forecast into short, practical notes, and it stays useful when the connection is bad."
      how={<>
        <p>The browser calls the free Open-Meteo forecast API directly, with no key and no server of mine in between. While it waits you see a skeleton; if the request fails or times out after 10 seconds you get a plain error and a retry button; if the device is offline you see the last forecast saved in this browser, marked with when it was saved, and it refreshes by itself when the connection returns.</p>
        <p>The farm notes are a handful of fixed rules on the numbers (rain chance, high and low temperature, wind). They are a convenience, not agronomic advice. The same pattern of states matters in GreenTrack, where farmers often have weak connectivity.</p>
      </>}
      related={{ label: "GreenTrack case study", href: "/work/greentrack" }}
    >
      <FarmWeather />
    </ExperimentShell>
  );
}

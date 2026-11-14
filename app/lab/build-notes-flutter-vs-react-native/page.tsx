import type { Metadata } from "next";
import Link from "next/link";
import ExperimentShell from "@/components/lab/ExperimentShell";
import { findings } from "@/data/buildNotes";
import { getProject } from "@/data/projects";

export const metadata: Metadata = {
  title: "Build Notes: Flutter vs React Native — Lab 017",
  description: "A factual comparison of Flutter and React Native, with the projects where I have used each.",
  alternates: { canonical: "/lab/build-notes-flutter-vs-react-native" },
};

const rows: [string, string, string][] = [
  ["Language", "Dart", "JavaScript / TypeScript"],
  ["How the UI is drawn", "Its own rendering engine paints every pixel, so widgets look the same on every platform", "Renders to the platform's native views through React"],
  ["Mental model", "Everything is a widget; UI is a tree rebuilt from state", "Components and hooks, the same model as React on the web"],
  ["Getting started", "Flutter SDK plus Android Studio or Xcode", "Expo lets you run on a phone with Expo Go, no native toolchain at first"],
  ["Sharing code with the web", "Possible (Flutter web), but a separate world from a typical web stack", "Natural if you already write React and TypeScript"],
  ["Backend pairing used here", "Firebase (Auth, Firestore, Storage)", "Not yet connected to a backend in my project"],
];

export default function Page() {
  const flutter = getProject("greentrack");
  const rn = getProject("eartgalla-mobile");
  return (
    <ExperimentShell
      n="017" title="Build Notes: Flutter vs React Native" line="Two ways to build the same screen."
      shows="A plain comparison of the two frameworks and where I have actually used each. Personal findings appear below only once I have written them, so nothing here is made up."
      how={<>
        <p>The comparison table states general, well-known differences between the frameworks. The project cards are pulled from this site&apos;s own project data, so they stay accurate if those projects change. The findings section reads from a data file and stays hidden while it is empty.</p>
      </>}
      related={{ label: "GreenTrack case study", href: "/work/greentrack" }}
    >
      <div className="overflow-x-auto rounded-sm border border-line">
        <table className="w-full min-w-[560px] text-left text-sm">
          <caption className="sr-only">Flutter compared with React Native</caption>
          <thead className="border-b border-line font-mono text-[11px] uppercase tracking-wide text-mist"><tr><th scope="col" className="px-4 py-3 font-normal">&nbsp;</th><th scope="col" className="px-4 py-3 font-normal">Flutter</th><th scope="col" className="px-4 py-3 font-normal">React Native</th></tr></thead>
          <tbody>{rows.map(([a, b, c]) => (
            <tr key={a} className="border-b border-line align-top last:border-0"><th scope="row" className="px-4 py-3 font-normal text-mist">{a}</th><td className="px-4 py-3">{b}</td><td className="px-4 py-3">{c}</td></tr>
          ))}</tbody>
        </table>
      </div>

      <h2 className="mt-14 font-display text-2xl">Where I have used each</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {[{ p: flutter, name: "Flutter" }, { p: rn, name: "React Native" }].map(({ p, name }) => p && (
          <Link key={p.slug} href={`/work/${p.slug}`} className="block rounded-sm border border-line p-5 transition-colors hover:border-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal">
            <p className="font-mono text-xs uppercase tracking-wide text-signal">{name}</p>
            <p className="mt-2 font-display text-xl">{p.title}</p>
            <p className="mt-2 text-sm text-mist">{p.description}</p>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-wide text-mist">{p.technologies.join(" · ")}</p>
          </Link>
        ))}
      </div>

      {findings.length > 0 && (
        <section className="mt-14" aria-labelledby="mf">
          <h2 id="mf" className="font-display text-2xl">My findings</h2>
          <ul className="mt-5 space-y-5">
            {findings.map((f) => (
              <li key={f.title} className="rounded-sm border border-line p-5">
                <h3 className="font-display text-lg">{f.title}</h3>
                <p className="mt-3 text-sm"><span className="text-signal">Flutter:</span> {f.flutter}</p>
                <p className="mt-2 text-sm"><span className="text-signal">React Native:</span> {f.reactNative}</p>
                {f.verdict && <p className="mt-3 text-sm text-mist">{f.verdict}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </ExperimentShell>
  );
}

import type { Metadata } from "next";
import ExperimentShell from "@/components/lab/ExperimentShell";
import QrTrace from "@/components/lab/QrTrace";

export const metadata: Metadata = {
  title: "QR Trace Demo — Lab 009",
  description: "Generate a QR code for a mock crop batch and open its custody history. A traceability demo using mock data only.",
  alternates: { canonical: "/lab/qr-trace" },
};

export default function Page() {
  return (
    <ExperimentShell
      n="009" title="QR Trace Demo" line="Scan the crate, read the story."
      demoNote="Demo · mock data only · no real produce or farms"
      shows="A QR code on a crate can carry a buyer straight to that batch's journey. Pick a mock batch, get its code, and open the custody history it points to."
      how={<>
        <p>The code is generated in your browser from a URL that contains the batch ID. A small library (uqr, about 8 KB gzipped, no dependencies) turns the URL into a grid of modules, and the page draws them as one SVG path in black on white so any camera can read it.</p>
        <p>The URL points to a page that looks the batch up by ID and lists its custody events, each one a stage, a place, a time and a note. In a real system that lookup would hit a database and each handoff would be written by an authenticated user; here it reads a few invented records.</p>
      </>}
      related={{ label: "GreenTrack case study", href: "/work/greentrack" }}
    >
      <QrTrace />
    </ExperimentShell>
  );
}

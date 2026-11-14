import type { Metadata } from "next";
import ExperimentShell from "@/components/lab/ExperimentShell";
import PaletteExtractor from "@/components/lab/PaletteExtractor";

export const metadata: Metadata = {
  title: "Earth-Tone Palette Extractor — Lab 013",
  description: "Pull a usable earth-tone palette out of a photograph with k-means clustering on a Canvas, then copy it as hex codes or CSS variables.",
  alternates: { canonical: "/lab/palette-extractor" },
};

export default function Page() {
  return (
    <ExperimentShell
      n="013" title="Earth-Tone Palette Extractor" line="Take the colours, leave the photograph."
      shows="Pick a photo (or use the sample painting) and get the handful of colours that make it feel the way it does, named in plain earth-tone words and ready to paste into CSS."
      how={<>
        <p>The image is drawn onto a small Canvas, about 120 pixels on its long side, and its pixels are grouped into 3 to 8 clusters with k-means: each cluster centre becomes a swatch, and its share of the pixels is the percentage. Starting points are chosen deterministically, so the same photo always gives the same palette.</p>
        <p>The colour names come from the nearest match in a small hand-written list of earth tones, so they are approximate. &ldquo;Earth tones only&rdquo; drops very saturated blues, violets and magentas before clustering. Everything runs in your browser; the photo is not uploaded.</p>
      </>}
      related={{ label: "EartGalla case study", href: "/work/eartgalla" }}
    >
      <PaletteExtractor />
    </ExperimentShell>
  );
}

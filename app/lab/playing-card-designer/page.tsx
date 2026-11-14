import type { Metadata } from "next";
import ExperimentShell from "@/components/lab/ExperimentShell";
import CardDesigner from "@/components/lab/CardDesigner";

export const metadata: Metadata = {
  title: "Playing Card Designer — Lab 014",
  description: "Compose a playing card from rank, suit, palette and pattern, then export it as SVG or PNG. Built with SVG and no fonts to embed.",
  alternates: { canonical: "/lab/playing-card-designer" },
};

export default function Page() {
  return (
    <ExperimentShell
      n="014" title="Playing Card Designer" line="Deal yourself something original."
      shows="Compose a playing card (any rank, any suit), restyle it with earth-tone palettes and patterns, add a caption and export it as a print-ready PNG or a clean SVG."
      how={<>
        <p>The card is one SVG built from state: the four suits are paths on a 100-unit grid, the number cards use the standard pip layouts (the lower half rotated 180°), and the background patterns are SVG <code>&lt;pattern&gt;</code> fills. Because the shapes are paths, not font glyphs, the file looks the same anywhere.</p>
        <p>Export serialises the live SVG. For PNG it is drawn onto a Canvas at three times the size (900 × 1260 px). This is the same kind of work as the illustrated card series in the Creative Studio, here as a tool anyone can use.</p>
      </>}
      related={{ label: "Creative Studio: playing cards", href: "/design" }}
    >
      <CardDesigner />
    </ExperimentShell>
  );
}

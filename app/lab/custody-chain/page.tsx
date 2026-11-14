import type { Metadata } from "next";
import ExperimentShell from "@/components/lab/ExperimentShell";
import CustodyChain from "@/components/lab/CustodyChain";

export const metadata: Metadata = {
  title: "Custody Chain Visualizer — Lab 011",
  description: "Build a farm-to-table custody timeline: add, remove and reorder stages and see handoffs, elapsed time and gaps update from one data model.",
  alternates: { canonical: "/lab/custody-chain" },
};

export default function Page() {
  return (
    <ExperimentShell
      n="011" title="Custody Chain Visualizer" line="Farm to table, link by link."
      demoNote="Demo · illustrative stages and times, not real batches"
      shows="A traceable product is a chain of handoffs. Add, remove and reorder the stages and see the timeline, the number of handoffs, the elapsed time and any gaps in the chain recalculate."
      how={<>
        <p>The whole page is derived from one small model: a <code>CustodyStage</code> describes a kind of step (who holds the product, a typical delay), and a <code>CustodyEvent</code> is one stage happening to a batch, with a place and a timestamp. The list you edit is turned into events, and the timeline, stats and checks are all computed from them. Open the JSON panel to see the events.</p>
        <p>The chain check applies simple rules: it should start at harvest, a crate should be packed and labelled before it travels, and the story should end at the consumer. Times are generated from typical delays; in a real system each event would be written by an authenticated user at the moment of handoff.</p>
      </>}
      related={{ label: "BeefTrace case study", href: "/work/beeftrace" }}
    >
      <CustodyChain />
    </ExperimentShell>
  );
}

import type { Metadata } from "next";
import ExperimentShell from "@/components/lab/ExperimentShell";
import RacePlayground from "@/components/lab/RacePlayground";

export const metadata: Metadata = {
  title: "Race-Condition Playground — Lab 010",
  description: "Replay two buyers reserving the last item and toggle transactions and idempotency keys to see which failure each one prevents.",
  alternates: { canonical: "/lab/race-playground" },
};

export default function Page() {
  return (
    <ExperimentShell
      n="010" title="Race-Condition Playground" line="Two buyers, one item left."
      demoNote="Simulation · a scripted replay, not a live database"
      shows="What goes wrong when two requests reserve the same last item, and what a database transaction and an idempotency key each fix. Flip the switches and replay it."
      how={<>
        <p>Two buyers, Alice and Ben, send a reservation at almost the same moment. Without a transaction, each reads the stock before the other has written, both see 1 and both succeed: an oversell. With a transaction, the stock row is locked, so Ben waits and then sees 0. (An atomic <code>UPDATE … WHERE stock &gt; 0</code> gives the same guarantee.)</p>
        <p>Then Alice&apos;s success response is lost and her app retries. An idempotency key lets the server recognise the repeat and return the first result; without it the retry is treated as a new purchase and wrongly rejected. The two protections solve different problems, so you need both.</p>
        <p>This page replays a fixed script computed by a small pure function. Nothing here touches a database; the engineering behind it is in PAMOJA.</p>
      </>}
      related={{ label: "PAMOJA case study", href: "/work/pamoja" }}
    >
      <RacePlayground />
    </ExperimentShell>
  );
}

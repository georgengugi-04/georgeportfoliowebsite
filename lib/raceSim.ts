// A deterministic replay of two people reserving the last item. Pure functions, no randomness, no network.
export type Actor = "Alice" | "Ben" | "Database" | "Network";
export type Step = { actor: Actor; text: string; tone: "neutral" | "good" | "bad"; stock: number; reservations: string[] };
export type Verdict = { kind: "ok" | "bad" | "warn"; title: string; text: string };

export function simulate(transaction: boolean, idempotency: boolean): { steps: Step[]; verdict: Verdict } {
  const steps: Step[] = [];
  let stock = 1;
  const res: string[] = [];
  const push = (actor: Actor, text: string, tone: Step["tone"] = "neutral") => steps.push({ actor, text, tone, stock, reservations: [...res] });
  const key = (k: string) => (idempotency ? ` (Idempotency-Key: ${k})` : "");

  push("Database", "One item left in stock.");
  push("Alice", `POST /reserve${key("A-1")}`);
  push("Ben", `POST /reserve${key("B-1")}`);

  if (!transaction) {
    push("Alice", "SELECT stock → 1. Enough, carry on.");
    push("Ben", "SELECT stock → 1. Reads before Alice has written, so it also sees 1.", "bad");
    res.push("Alice"); stock = 0;
    push("Alice", "INSERT reservation, UPDATE stock = 0.");
    res.push("Ben");
    push("Ben", "INSERT reservation, UPDATE stock = 0. Ben was told there was one left, too.", "bad");
  } else {
    push("Alice", "BEGIN; SELECT stock FOR UPDATE → 1. The row is now locked.");
    push("Ben", "BEGIN; SELECT stock FOR UPDATE. Blocked: waits for Alice's lock.");
    res.push("Alice"); stock = 0;
    push("Alice", "INSERT reservation, UPDATE stock = 0, COMMIT.", "good");
    push("Ben", "Lock released. SELECT stock → 0. ROLLBACK, respond 409 sold out.", "good");
  }

  push("Network", "Alice's success response is lost on a weak connection. Her app times out and retries.");
  if (idempotency) {
    push("Alice", "POST /reserve (Idempotency-Key: A-1), the same request again.");
    push("Database", transaction ? "Key A-1 already completed: return Alice's original reservation. Nothing is written twice." : "Key A-1 already completed: return Alice's original reservation, no second write.", "good");
  } else {
    push("Alice", "POST /reserve again. The server has no way to know this is a repeat.");
    push("Database", transaction ? "Treated as a new request: stock is 0 → 409 sold out. Alice is told she lost an item she actually holds." : "Treated as a new request: stock is 0 → sold out, even though Alice holds a reservation.", "bad");
  }

  let verdict: Verdict;
  if (!transaction) {
    verdict = { kind: "bad", title: "Oversold: 2 reservations for 1 item", text: idempotency ? "The idempotency key protected Alice's retry, but it can't stop two different people racing. Ben used a different key, so both writes went through." : "Both buyers got the item, and Alice's retry was told it was sold out. Stock says 0, but two people each expect delivery." };
  } else if (!idempotency) {
    verdict = { kind: "warn", title: "Stock is right, but Alice is told she failed", text: "The transaction stopped the double-booking: one reservation, stock 0. Without an idempotency key, though, the retry looks like a new purchase and is rejected, so Alice may buy elsewhere or complain." };
  } else {
    verdict = { kind: "ok", title: "Correct: 1 reservation, stock 0", text: "The transaction serialised the two buyers so only Alice got the last item, and the idempotency key made her retry safe: she gets the same reservation back, and nothing is duplicated." };
  }
  return { steps, verdict };
}

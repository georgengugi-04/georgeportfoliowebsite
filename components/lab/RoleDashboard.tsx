"use client";

import { useState } from "react";
import clsx from "clsx";

// MOCK DATA: invented animals, farms and people.
type Status = "Registered" | "In transit" | "Received";
type Animal = { tag: string; breed: string; farm: string; weightKg: number; status: Status; carrier: string; checkpoint: string; priceKes: number };
const START: Animal[] = [
  { tag: "DEMO-A101", breed: "Boran", farm: "Demo Farm A", weightKg: 412, status: "Registered", carrier: "-", checkpoint: "Demo Farm A", priceKes: 92000 },
  { tag: "DEMO-A102", breed: "Sahiwal", farm: "Demo Farm A", weightKg: 388, status: "In transit", carrier: "Demo Transport Co.", checkpoint: "Demo weighbridge", priceKes: 85000 },
  { tag: "DEMO-B201", breed: "Friesian cross", farm: "Demo Farm B", weightKg: 445, status: "Received", carrier: "Demo Transport Co.", checkpoint: "Demo Butchery, Nairobi", priceKes: 98000 },
  { tag: "DEMO-B202", breed: "Boran", farm: "Demo Farm B", weightKg: 401, status: "In transit", carrier: "Demo Haulage", checkpoint: "Demo roadblock check", priceKes: 90000 },
];

type Role = "Farmer" | "Transporter" | "Retailer";
type Action = "register" | "editWeight" | "updateTransport" | "verify" | "viewPrice";
const ROLES: Role[] = ["Farmer", "Transporter", "Retailer"];
const ACTIONS: { id: Action; label: string }[] = [
  { id: "register", label: "Register an animal" }, { id: "editWeight", label: "Edit weight" }, { id: "updateTransport", label: "Update transport status" },
  { id: "verify", label: "Verify history" }, { id: "viewPrice", label: "See price" },
];
// The whole permission model is this one table. Every button and column below asks can().
const PERMS: Record<Role, Action[]> = {
  Farmer: ["register", "editWeight", "viewPrice"],
  Transporter: ["updateTransport"],
  Retailer: ["verify", "viewPrice"],
};
const can = (r: Role, a: Action) => PERMS[r].includes(a);

export default function RoleDashboard() {
  const [role, setRole] = useState<Role>("Farmer");
  const [rows, setRows] = useState<Animal[]>(START);
  const [msg, setMsg] = useState("");
  const [seq, setSeq] = useState(300);

  const guard = (a: Action, fn: () => void, okMsg: string) => {
    if (!can(role, a)) { setMsg(`403 Forbidden: the ${role} role isn't allowed to ${ACTIONS.find((x) => x.id === a)!.label.toLowerCase()}.`); return; }
    fn(); setMsg(okMsg);
  };

  const visible = rows.filter((r) => (role === "Farmer" ? r.farm === "Demo Farm A" : role === "Transporter" ? r.status === "In transit" || r.status === "Registered" : r.status === "Received" || r.status === "In transit"));

  const cols: { key: string; label: string; show: boolean; cell: (r: Animal) => React.ReactNode }[] = [
    { key: "tag", label: "Tag", show: true, cell: (r) => r.tag },
    { key: "breed", label: "Breed", show: role !== "Transporter", cell: (r) => r.breed },
    { key: "weight", label: "Weight", show: role !== "Transporter", cell: (r) => `${r.weightKg} kg` },
    { key: "status", label: "Status", show: true, cell: (r) => r.status },
    { key: "where", label: role === "Transporter" ? "Last checkpoint" : "Location", show: true, cell: (r) => r.checkpoint },
    { key: "carrier", label: "Carrier", show: role !== "Farmer", cell: (r) => r.carrier },
    { key: "price", label: "Price (KES)", show: can(role, "viewPrice"), cell: (r) => r.priceKes.toLocaleString("en-KE") },
  ];

  const btn = "rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal";
  const heading = { Farmer: "Your herd", Transporter: "Today's consignments", Retailer: "Incoming and received stock" }[role];

  return (
    <div>
      <div role="tablist" aria-label="Choose a role" className="flex flex-wrap gap-2">
        {ROLES.map((r) => (
          <button key={r} role="tab" aria-selected={role === r} id={`tab-${r}`} aria-controls="role-panel" onClick={() => { setRole(r); setMsg(""); }}
            className={clsx("rounded-full border px-5 py-2.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal", role === r ? "border-signal bg-signal text-ink" : "border-line text-mist hover:border-signal hover:text-signal")}>{r}</button>
        ))}
      </div>

      <div role="tabpanel" id="role-panel" aria-labelledby={`tab-${role}`} className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <h3 className="font-display text-2xl">{heading}</h3>
          <div className="relative mt-4 overflow-x-auto rounded-sm border border-line">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-line font-mono text-[11px] uppercase tracking-wide text-mist"><tr>{cols.filter((c) => c.show).map((c) => <th key={c.key} scope="col" className="px-4 py-3 font-normal">{c.label}</th>)}<th scope="col" className="px-4 py-3 font-normal"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.tag} className="border-b border-line last:border-0">
                    {cols.filter((c) => c.show).map((c) => <td key={c.key} className="px-4 py-3">{c.cell(r)}</td>)}
                    <td className="px-4 py-3 text-right">
                      {role === "Farmer" && <button className={clsx(btn, "border-line text-mist hover:border-signal hover:text-signal")} onClick={() => guard("editWeight", () => setRows((x) => x.map((a) => (a.tag === r.tag ? { ...a, weightKg: a.weightKg + 5 } : a))), `Mock: ${r.tag} weight updated to ${r.weightKg + 5} kg.`)}>+5 kg</button>}
                      {role === "Transporter" && <button className={clsx(btn, "border-line text-mist hover:border-signal hover:text-signal")} onClick={() => guard("updateTransport", () => setRows((x) => x.map((a) => (a.tag === r.tag ? { ...a, status: a.status === "Registered" ? "In transit" : "Received", carrier: "Demo Transport Co.", checkpoint: a.status === "Registered" ? "Left the farm gate" : "Demo Butchery, Nairobi" } : a))), `Mock: ${r.tag} moved to the next status.`)}>{r.status === "Registered" ? "Pick up" : "Deliver"}</button>}
                      {role === "Retailer" && <button className={clsx(btn, "border-line text-mist hover:border-signal hover:text-signal")} onClick={() => guard("verify", () => {}, `Mock: ${r.tag}: farm ${r.farm} → ${r.carrier} → ${r.checkpoint}. History matches.`)}>Verify</button>}
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && <tr><td className="px-4 py-8 text-center text-mist" colSpan={8}>Nothing for this role right now.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button className={clsx(btn, can(role, "register") ? "border-signal bg-signal text-ink" : "border-line text-mist")} aria-disabled={!can(role, "register")}
              onClick={() => guard("register", () => { setRows((x) => [...x, { tag: `DEMO-A${seq}`, breed: "Boran", farm: "Demo Farm A", weightKg: 380, status: "Registered", carrier: "-", checkpoint: "Demo Farm A", priceKes: 80000 }]); setSeq((s) => s + 1); }, "Mock: a new animal was registered. Switch to the Transporter to see it appear.")}>
              + Register animal
            </button>
            <button className={clsx(btn, "border-line text-mist hover:border-rust hover:text-rust")} onClick={() => guard("editWeight", () => {}, "")}>Try an edit as {role}</button>
          </div>
          <p role="status" aria-live="polite" className={clsx("mt-4 min-h-[1.5rem] text-sm", msg.startsWith("403") ? "text-rust" : "text-paper")}>{msg}</p>
        </div>

        <div>
          <h3 className="font-mono text-xs uppercase tracking-wide text-signal">Permissions · {role}</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {ACTIONS.map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-sm border border-line px-3 py-2">
                <span>{a.label}</span>
                <span className={can(role, a.id) ? "text-signal" : "text-mist"}>{can(role, a.id) ? "Allowed" : "Denied"}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-mist">All three dashboards read the same list of animals; what you see and can do comes from this table.</p>
        </div>
      </div>
    </div>
  );
}

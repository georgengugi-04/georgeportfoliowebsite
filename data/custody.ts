// One data model shared by the QR Trace demo and the Custody Chain Visualizer.
// A CustodyStage is a *kind* of step in a supply chain; a CustodyEvent is one stage actually happening to one batch.

export type CustodyStage = {
  id: string;
  label: string;
  role: string; // who holds the product during this stage
  blurb: string;
  defaultHours: number; // typical gap before the *next* event in the demo
};

export type CustodyEvent = {
  id: string;
  stageId: string;
  at: string; // ISO timestamp
  location: string;
  note: string;
};

export const STAGES: CustodyStage[] = [
  { id: "harvest", label: "Harvest", role: "Farmer", blurb: "Picked and weighed at the farm.", defaultHours: 3 },
  { id: "sort", label: "Wash & sort", role: "Farmer", blurb: "Cleaned, graded and rejected items removed.", defaultHours: 2 },
  { id: "pack", label: "Packing", role: "Farmer / aggregator", blurb: "Crated and labelled with the batch QR code.", defaultHours: 2 },
  { id: "inspect", label: "Inspection", role: "Inspector", blurb: "Quality and safety check recorded.", defaultHours: 2 },
  { id: "cold", label: "Cold storage", role: "Aggregator", blurb: "Held at controlled temperature.", defaultHours: 12 },
  { id: "transport", label: "Transport", role: "Transporter", blurb: "Moved by road to the next stop.", defaultHours: 5 },
  { id: "market", label: "Market / retail", role: "Retailer", blurb: "Received and displayed for sale.", defaultHours: 24 },
  { id: "sale", label: "Sold to consumer", role: "Consumer", blurb: "Purchased; the QR code shows the whole journey.", defaultHours: 0 },
];

export const stageById = (id: string) => STAGES.find((s) => s.id === id);

export const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Nairobi" }).format(new Date(iso));

export const fmtHours = (h: number) => (h < 1 ? "under an hour" : h < 24 ? `${Math.round(h)} h` : `${Math.floor(h / 24)} d ${Math.round(h % 24)} h`);

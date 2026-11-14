import { CustodyEvent } from "./custody";

// MOCK DATA. These batches, farms, places and times are invented for the QR Trace demo and describe no real produce.
export type MockBatch = {
  id: string; // appears in the demo URL: /lab/qr-trace/<id>
  crop: string;
  quantityKg: number;
  farm: string;
  events: CustodyEvent[];
};

const ev = (id: string, stageId: string, at: string, location: string, note: string): CustodyEvent => ({ id, stageId, at, location, note });

export const mockBatches: MockBatch[] = [
  {
    id: "DEMO-TOM-0001", crop: "Tomatoes", quantityKg: 120, farm: "Demo Farm A",
    events: [
      ev("e1", "harvest", "2026-01-12T06:30:00+03:00", "Demo Farm A", "120 kg picked, weighed on site."),
      ev("e2", "sort", "2026-01-12T09:10:00+03:00", "Demo Farm A", "6 kg rejected for bruising."),
      ev("e3", "pack", "2026-01-12T11:00:00+03:00", "Demo Farm A", "Packed in 12 crates, QR labels applied."),
      ev("e4", "transport", "2026-01-12T14:00:00+03:00", "Demo Road Route 1", "Collected by Demo Transport Co."),
      ev("e5", "market", "2026-01-13T05:30:00+03:00", "Demo Market, Nairobi", "Received; crate seals intact."),
      ev("e6", "sale", "2026-01-13T10:15:00+03:00", "Demo Market, Nairobi", "Sold to a shopper who scanned the code."),
    ],
  },
  {
    id: "DEMO-KAL-0002", crop: "Kale (sukuma wiki)", quantityKg: 60, farm: "Demo Farm B",
    events: [
      ev("e1", "harvest", "2026-02-03T05:45:00+03:00", "Demo Farm B", "60 kg cut at dawn."),
      ev("e2", "sort", "2026-02-03T07:30:00+03:00", "Demo Farm B", "Washed; yellowed leaves removed."),
      ev("e3", "inspect", "2026-02-03T09:00:00+03:00", "Demo Farm B", "Visual inspection passed."),
      ev("e4", "transport", "2026-02-03T10:30:00+03:00", "Demo Road Route 2", "Moved by pickup to the retailer."),
      ev("e5", "market", "2026-02-03T13:00:00+03:00", "Demo Greengrocer, Nairobi", "Received and displayed."),
    ],
  },
  {
    id: "DEMO-AVO-0003", crop: "Avocados", quantityKg: 200, farm: "Demo Farm C",
    events: [
      ev("e1", "harvest", "2026-03-18T07:00:00+03:00", "Demo Farm C", "200 kg picked."),
      ev("e2", "sort", "2026-03-18T10:00:00+03:00", "Demo Farm C", "Graded by size."),
      ev("e3", "pack", "2026-03-18T12:00:00+03:00", "Demo Farm C", "Boxed, QR labels applied."),
      ev("e4", "cold", "2026-03-18T14:00:00+03:00", "Demo Aggregation Hub", "Held overnight in cold storage."),
      ev("e5", "transport", "2026-03-19T06:00:00+03:00", "Demo Road Route 3", "Loaded for the city."),
      ev("e6", "market", "2026-03-19T11:00:00+03:00", "Demo Supermarket, Nairobi", "Received at the store."),
    ],
  },
];

export const getBatch = (id: string) => mockBatches.find((b) => b.id === id);

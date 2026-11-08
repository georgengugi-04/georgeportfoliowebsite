export type TimelineType = "education" | "attachment" | "collaboration" | "independent" | "assessment";

export type TimelineEntry = {
  period: string; // only what is verified — no invented dates
  title: string;
  org: string;
  type: TimelineType;
  description: string;
  href?: string;
};

export const typeLabel: Record<TimelineType, string> = {
  education: "Education",
  attachment: "Attachment",
  collaboration: "Collaboration",
  independent: "Independent",
  assessment: "Technical assessment",
};

// Exact start/end dates are intentionally omitted until confirmed.
export const timeline: TimelineEntry[] = [
  {
    period: "Final year",
    title: "BSc, Information Technology",
    org: "KCA University, Nairobi",
    type: "education",
    description: "Undergraduate degree in Information Technology, currently in the final year.",
  },
  {
    period: "2025 — present",
    title: "Attachment & project work",
    org: "JHUB Africa (JKUAT)",
    type: "attachment",
    description:
      "Worked inside the JKUAT / JHUB Africa ecosystem with a small product team on agriculture and livestock traceability projects.",
  },
  {
    period: "2025 — present",
    title: "GreenTrack — Flutter developer",
    org: "Team project",
    type: "collaboration",
    description:
      "App architecture, UI implementation and Firebase integration for a farm-to-table traceability app spanning several supply-chain roles.",
    href: "/work/greentrack",
  },
  {
    period: "2025 — present",
    title: "BeefTrace — frontend engineer & UI/UX designer",
    org: "Team project",
    type: "collaboration",
    description:
      "Design system and Next.js build of the product-facing web experience for a livestock traceability platform. Backend and platform work belongs to the wider team.",
    href: "/work/beeftrace",
  },
  {
    period: "2026",
    title: "PAMOJA — stock reservation service",
    org: "Stage 5 technical assessment",
    type: "assessment",
    description:
      "Transactional, idempotent stock reservation API on PostgreSQL with automated tests. Assessment work, not employment or a production system.",
    href: "/work/pamoja",
  },
  {
    period: "2026",
    title: "EartGalla — gallery & marketplace",
    org: "Independent project",
    type: "independent",
    description: "Web storefront, enquiry-based purchase flow and brand graphics for an African art gallery.",
    href: "/work/eartgalla",
  },
  {
    period: "Now",
    title: "Tigala Mobile & EartGalla Mobile",
    org: "Independent projects",
    type: "independent",
    description: "Two mobile applications currently in development: a cultural archive of Kenya's 42 tribes, and a mobile gallery.",
    href: "/work/tigala-mobile",
  },
];

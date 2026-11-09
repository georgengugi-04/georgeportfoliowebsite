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

// Dates come from George's CV (Nov 2026). Entries the CV does not date use a descriptive label, never a guessed year.
export const timeline: TimelineEntry[] = [
  {
    period: "Expected Nov 2026",
    title: "BSc, Information Technology",
    org: "KCA University, Nairobi",
    type: "education",
    description: "Undergraduate degree in Information Technology, in the final year with graduation expected in November 2026.",
  },
  {
    period: "Jun – Sep 2026",
    title: "Mobile Developer (attachment)",
    org: "JHUB Africa",
    type: "attachment",
    description:
      "Worked on GreenTrack: Flutter mobile development, Firebase authentication and Firestore data, weather and crop-health integrations, testing and improvements from user feedback. Joined field validation with farmers and stakeholders in Subukia, Nakuru County.",
    href: "/work/greentrack",
  },
  {
    period: "Team project",
    title: "BeefTrace — software developer",
    org: "Livestock traceability platform",
    type: "collaboration",
    description:
      "Contributed to a livestock traceability platform covering digital livestock records, animal identification and QR-based traceability, with work on data management and the product-facing interfaces. Backend and platform work belongs to the wider team.",
    href: "/work/beeftrace",
  },
  {
    period: "Assessment",
    title: "PAMOJA — stock reservation service",
    org: "Backend engineering assessment",
    type: "assessment",
    description:
      "Node.js, TypeScript and PostgreSQL reservation API that prevents overselling under concurrent requests, with idempotency keys and 64 automated tests. Assessment work, not employment or a production system.",
    href: "/work/pamoja",
  },
  {
    period: "Ongoing",
    title: "EartGalla — founder & developer",
    org: "Independent project",
    type: "independent",
    description: "A digital platform for Kenyan art, culture and creative communities: gallery presentation, artist discovery, enquiry-based purchasing and brand graphics.",
    href: "/work/eartgalla",
  },
  {
    period: "Now",
    title: "EartGalla Mobile",
    org: "Independent project",
    type: "independent",
    description: "A mobile application for the EartGalla gallery, currently in development.",
    href: "/work/eartgalla-mobile",
  },
];

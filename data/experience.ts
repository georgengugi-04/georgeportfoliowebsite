export type TimelineEntry = {
  period: string;
  title: string;
  org: string;
  type: "education" | "project" | "team" | "community";
  description: string;
};

// Fill in exact dates / titles — placeholders are marked clearly rather than invented.
export const timeline: TimelineEntry[] = [
  {
    period: "In progress",
    title: "BSc, Information Technology",
    org: "KCA University, Nairobi",
    type: "education",
    description: "Undergraduate studies in Information Technology.",
  },
  {
    period: "Ongoing",
    title: "Contributor, JHUB Africa",
    org: "JKUAT / JHUB Africa",
    type: "community",
    description: "Working within the JKUAT / JHUB Africa ecosystem alongside a small product team.",
  },
  {
    period: "Ongoing",
    title: "GreenTrack — Flutter developer",
    org: "Team project",
    type: "project",
    description:
      "Architecture, UI implementation and Firebase integration for a farm-to-table traceability app spanning five supply-chain roles.",
  },
  {
    period: "Ongoing",
    title: "BeefTrace — Frontend & UI/UX engineer",
    org: "Team project",
    type: "project",
    description:
      "Design system and Next.js build-out for a livestock traceability platform's product-facing site.",
  },
];

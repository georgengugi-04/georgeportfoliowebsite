export type Skill = { name: string; usedIn: string[]; note: string };
export type SkillGroup = {
  id: string;
  layer: string;
  blurb: string; // what this capability actually means
  skills: Skill[];
};

// "usedIn" lists only projects where the technology is documented in data/projects.ts.
export const skillGroups: SkillGroup[] = [
  {
    id: "frontend",
    layer: "Frontend",
    blurb: "Responsive, accessible interfaces and component systems driven by a design system.",
    skills: [
      { name: "React", usedIn: ["beeftrace", "eartgalla"], note: "Component architecture" },
      { name: "Next.js", usedIn: ["beeftrace", "eartgalla"], note: "App Router sites and product surfaces" },
      { name: "TypeScript", usedIn: ["beeftrace", "eartgalla"], note: "Typed application code" },
      { name: "JavaScript", usedIn: ["eartgalla"], note: "Interaction and cart behaviour" },
      { name: "HTML & CSS", usedIn: ["eartgalla"], note: "Semantic, responsive markup" },
      { name: "Tailwind CSS", usedIn: ["beeftrace"], note: "Token-driven styling" },
      { name: "Framer Motion · GSAP", usedIn: ["beeftrace"], note: "Purposeful scroll and UI motion" },
    ],
  },
  {
    id: "backend",
    layer: "Backend",
    blurb: "APIs, authentication and the data rules that keep a system correct.",
    skills: [
      { name: "Node.js · Express", usedIn: [], note: "REST API development" },
      { name: "REST API design", usedIn: ["pamoja"], note: "Small, explicit, testable endpoints" },
      { name: "Authentication & authorization", usedIn: ["greentrack"], note: "Role-based access, Google Sign-In" },
      { name: "Transactions & idempotency", usedIn: ["pamoja"], note: "Race-condition-safe reservations" },
    ],
  },
  {
    id: "mobile",
    layer: "Mobile",
    blurb: "Cross-platform apps with real auth, storage and role-based workflows.",
    skills: [
      { name: "Flutter", usedIn: ["greentrack"], note: "Cross-platform UI" },
      { name: "Dart", usedIn: ["greentrack"], note: "Application logic and architecture" },
      { name: "Firebase integration", usedIn: ["greentrack"], note: "Auth, Firestore and Storage" },
    ],
  },
  {
    id: "databases",
    layer: "Databases",
    blurb: "Modelling data around how it is actually used.",
    skills: [
      { name: "PostgreSQL", usedIn: ["pamoja"], note: "Transactional integrity" },
      { name: "MySQL", usedIn: [], note: "Relational data modelling" },
      { name: "Firestore", usedIn: ["greentrack"], note: "Custody-chain and batch data" },
    ],
  },
  {
    id: "tools",
    layer: "Tools & deployment",
    blurb: "How the work gets reviewed, shipped and kept running.",
    skills: [
      { name: "Git & GitHub", usedIn: ["pamoja", "greentrack"], note: "Version control and collaboration" },
      { name: "VS Code", usedIn: [], note: "Primary editor" },
      { name: "Vercel", usedIn: ["beeftrace", "eartgalla", "arkyls"], note: "Deployment" },
      { name: "Cloudflare Workers", usedIn: ["webstories"], note: "Edge deployment" },
    ],
  },
];

export const architectureExamples = [
  {
    project: "greentrack",
    title: "Shared custody-chain model",
    body: "One CustodyStage / CustodyEvent model drives every role's dashboard, so adding the Retailer role extended the system instead of forking it.",
  },
  {
    project: "pamoja",
    title: "Atomic reservation",
    body: "Availability check and decrement happen in one PostgreSQL transaction, with idempotency keys so retries cannot double-reserve.",
  },
  {
    project: "beeftrace",
    title: "Supply-chain narrative",
    body: "An eight-stage animated journey built on a component system with Framer Motion, GSAP and Lenis.",
  },
];

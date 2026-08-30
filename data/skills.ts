export type Skill = {
  name: string;
  usedIn: string[]; // project slugs
  note: string;
};

export type SkillGroup = {
  layer: string;
  description: string;
  skills: Skill[];
};

export const skillGroups: SkillGroup[] = [
  {
    layer: "Interfaces",
    description: "What people actually touch.",
    skills: [
      { name: "Next.js", usedIn: ["beeftrace"], note: "App Router product & marketing sites" },
      { name: "React", usedIn: ["beeftrace"], note: "Component architecture" },
      { name: "TypeScript", usedIn: ["beeftrace"], note: "Typed application code" },
      { name: "Tailwind CSS", usedIn: ["beeftrace"], note: "Design-system-driven styling" },
      { name: "Flutter / Dart", usedIn: ["greentrack"], note: "Cross-platform mobile UI" },
    ],
  },
  {
    layer: "Motion",
    description: "Animation with a job to do.",
    skills: [
      { name: "Framer Motion", usedIn: ["beeftrace"], note: "Scroll reveals, transitions" },
      { name: "GSAP", usedIn: ["beeftrace"], note: "Timeline and scroll choreography" },
      { name: "Lenis", usedIn: ["beeftrace"], note: "Smooth-scroll pacing" },
    ],
  },
  {
    layer: "Backend & data",
    description: "What keeps the interface honest.",
    skills: [
      { name: "Firebase Auth", usedIn: ["greentrack"], note: "Role-based access, Google Sign-In" },
      { name: "Firestore", usedIn: ["greentrack"], note: "Custody-chain and batch data" },
      { name: "Firebase Storage", usedIn: ["greentrack"], note: "Batch and profile photo capture" },
    ],
  },
  {
    layer: "Design",
    description: "The layer before the code.",
    skills: [
      { name: "Design systems", usedIn: ["beeftrace", "greentrack"], note: "Tokenized palette, type and component rules" },
      { name: "Responsive design", usedIn: ["beeftrace", "greentrack"], note: "Mobile-first, role-aware layouts" },
      { name: "Interaction design", usedIn: ["beeftrace", "greentrack"], note: "Flows across multi-role systems" },
    ],
  },
  {
    layer: "Tooling",
    description: "How the work actually ships.",
    skills: [
      { name: "Git", usedIn: ["beeftrace", "greentrack"], note: "Version control across team projects" },
      { name: "VS Code", usedIn: ["beeftrace", "greentrack"], note: "Primary editor" },
      { name: "Vercel", usedIn: ["beeftrace"], note: "Deployment" },
    ],
  },
];

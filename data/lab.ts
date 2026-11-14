export type LabStatus = "Live" | "Planned";

export type Experiment = {
  slug: string; // live experiments are served at /lab/<slug>; planned ones have no page yet
  title: string;
  summary: string;
  tags: string[];
  status: LabStatus;
  n?: string; // display number, live experiments only
  line?: string; // optional italic tagline
  related?: { label: string; href: string }; // case study it connects to
};

export const experiments: Experiment[] = [
  { n: "001", slug: "living-root", title: "Living Root", line: "A hero section that grows.", summary: "A procedurally grown root, drifting pollen and a butterfly that only lands once the branch is still.", tags: ["Three.js", "WebGL"], status: "Live" },
  { n: "002", slug: "raking-light", title: "Raking Light", line: "See the paint, not the picture.", summary: "Drag a lamp across a real painting. Brightness becomes relief, and a flat photograph turns back into a physical surface.", tags: ["Canvas 2D", "per-pixel lighting"], status: "Live" },
  { n: "003", slug: "swipe-gallery", title: "Swipe Gallery", line: "The gallery, one thumb at a time.", summary: "An interaction study for the EartGalla collection: swipe real artworks to save or pass, with drag physics and keyboard control.", tags: ["Framer Motion", "gestures"], status: "Live" },
  { n: "004", slug: "glitch-mark", title: "Glitch Mark", line: "The brand, mid-crash.", summary: "The Koshe.exe emblem split into red, green and blue copies that tear apart with pointer speed. Tap, move or use the arrow keys.", tags: ["Canvas 2D", "channel splitting"], status: "Live" },
  { n: "005", slug: "signal-grid", title: "Signal Grid", line: "A field that notices you.", summary: "A lattice of points that ripple away from your pointer and spring back. Tap to send a pulse across the whole field.", tags: ["Canvas 2D", "spring physics"], status: "Live" },
  { n: "006", slug: "piano", title: "Piano", line: "Make some noise, politely.", summary: "A playable two-octave piano synthesised live in the browser. Touch, mouse or computer keyboard, four waveforms and seven tunes that play themselves, and a recorder for your own song.", tags: ["Web Audio API", "oscillators"], status: "Live" },
  { n: "007", slug: "beat-lab", title: "Beat Lab", line: "A band that lives in the browser.", summary: "A 16-step sequencer with six synthesised drums plus bass, pluck, pad and bell. Pick a preset or write your own loop, then record it with your voice.", tags: ["Web Audio API", "step sequencer"], status: "Live" },
  { n: "008", slug: "tidelight", title: "Tidelight", line: "A creature of glass and light.", summary: "A bioluminescent organism adrift in a deep digital ocean. It breathes, follows your pointer, and answers a click with a pulse of light.", tags: ["Three.js", "custom GLSL", "instanced particles"], status: "Live" },
  {
    n: "009", slug: "qr-trace", title: "QR Trace Demo", line: "Scan the crate, read the story.",
    summary: "Generate a QR code for a mock crop batch and open its custody history, the way a buyer would after scanning it.",
    tags: ["QR codes", "Traceability", "Mock data"], status: "Live", related: { label: "GreenTrack case study", href: "/work/greentrack" },
  },
  {
    n: "010", slug: "race-playground", title: "Race-Condition Playground", line: "Two buyers, one item left.",
    summary: "Replay two people reserving the last item, then switch a transaction and an idempotency key on and off to see what each one fixes.",
    tags: ["Concurrency", "Transactions", "Idempotency"], status: "Live", related: { label: "PAMOJA case study", href: "/work/pamoja" },
  },
  {
    n: "011", slug: "custody-chain", title: "Custody Chain Visualizer", line: "Farm to table, link by link.",
    summary: "Build a farm-to-table timeline: add, remove and reorder stages and watch the handoffs and elapsed time update from one data model.",
    tags: ["Data modelling", "Traceability", "Interactive timeline"], status: "Live", related: { label: "BeefTrace case study", href: "/work/beeftrace" },
  },
  {
    n: "012", slug: "farm-weather", title: "Nairobi Farm Weather", line: "The forecast, in farm terms.",
    summary: "Live Nairobi conditions and a five-day outlook from Open-Meteo, with loading, error and offline states and plain-language farm notes.",
    tags: ["Open-Meteo API", "Fetch states", "Offline handling"], status: "Live", related: { label: "GreenTrack case study", href: "/work/greentrack" },
  },
  { slug: "palette-extractor", title: "Earth-Tone Palette Extractor", summary: "Pull a usable earth-tone palette out of a photograph.", tags: ["Canvas", "Colour"], status: "Planned" },
  { slug: "playing-card-designer", title: "Playing Card Designer", summary: "Compose and export a custom playing card.", tags: ["SVG", "Design tool"], status: "Planned" },
  { slug: "motion-playground", title: "Motion Playground", summary: "Tune easing, spring and stagger values and copy the result.", tags: ["Framer Motion", "Animation"], status: "Planned" },
  { slug: "role-dashboard-switcher", title: "Role-Based Dashboard Switcher", summary: "One dataset, three roles, three different dashboards.", tags: ["RBAC", "Dashboards"], status: "Planned" },
  { slug: "build-notes-flutter-vs-react-native", title: "Build Notes: Flutter vs React Native", summary: "What I found building the same kind of screen in both.", tags: ["Flutter", "React Native", "Notes"], status: "Planned" },
];

export const liveExperiments = experiments.filter((e) => e.status === "Live");
export const plannedExperiments = experiments.filter((e) => e.status === "Planned");

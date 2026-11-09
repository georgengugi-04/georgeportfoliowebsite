export type Experiment = {
  n: string;
  slug: string;
  title: string;
  line: string; // one italic line
  tech: string;
  blurb: string;
};

export const experiments: Experiment[] = [
  {
    n: "001",
    slug: "living-root",
    title: "Living Root",
    line: "A hero section that grows.",
    tech: "Three.js · WebGL",
    blurb: "A procedurally grown root, drifting pollen and a butterfly that only lands once the branch is still.",
  },
  {
    n: "002",
    slug: "raking-light",
    title: "Raking Light",
    line: "See the paint, not the picture.",
    tech: "Canvas 2D · per-pixel lighting",
    blurb: "Drag a lamp across a real painting. Brightness becomes relief, and a flat photograph turns back into a physical surface.",
  },
  {
    n: "003",
    slug: "swipe-gallery",
    title: "Swipe Gallery",
    line: "The gallery, one thumb at a time.",
    tech: "Framer Motion · gestures",
    blurb: "An interaction study for the EartGalla collection: swipe real artworks to save or pass, with drag physics and keyboard control.",
  },
];

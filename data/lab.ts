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
  {
    n: "004",
    slug: "glitch-mark",
    title: "Glitch Mark",
    line: "The brand, mid-crash.",
    tech: "Canvas 2D · channel splitting",
    blurb: "The Koshe.exe emblem split into red, green and blue copies that tear apart with pointer speed. Tap, move or use the arrow keys.",
  },
  {
    n: "005",
    slug: "signal-grid",
    title: "Signal Grid",
    line: "A field that notices you.",
    tech: "Canvas 2D · spring physics",
    blurb: "A lattice of points that ripple away from your pointer and spring back. Tap to send a pulse across the whole field.",
  },
  {
    n: "006",
    slug: "piano",
    title: "Piano",
    line: "Make some noise, politely.",
    tech: "Web Audio API · oscillators",
    blurb: "A playable two-octave piano synthesised live in the browser. Touch, mouse or computer keyboard, four waveforms and seven tunes that play themselves, and a recorder for your own song.",
  },
  {
    n: "007",
    slug: "beat-lab",
    title: "Beat Lab",
    line: "A band that lives in the browser.",
    tech: "Web Audio API · step sequencer",
    blurb: "A 16-step sequencer with six synthesised drums plus bass, pluck, pad and bell. Pick a preset or write your own loop, then record it with your voice.",
  },
];

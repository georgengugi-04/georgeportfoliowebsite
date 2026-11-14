export type CreativeCategory = "Brand" | "Flyers & Posters" | "Artwork" | "Illustration" | "Playing cards";

export type CreativeWork = {
  src: string;
  title: string;
  category: CreativeCategory;
  alt: string;
  caption?: string;
  width: number;
  height: number;
};

// Only real assets from the repository. Add new pieces here and drop the file in /public/creative.
export const creativeWorks: CreativeWork[] = [
  {
    src: "/projects/eartgalla/gallery/flyer-brand.jpg",
    title: "EartGalla — brand flyer",
    category: "Brand",
    alt: "EartGalla brand flyer with the logo and the line 'Share your creation with the world'",
    caption: "Brand identity & social graphic",
    width: 1050,
    height: 600,
  },
  {
    src: "/projects/eartgalla/gallery/flyer-event.jpg",
    title: "Art & Sip — event flyer",
    category: "Flyers & Posters",
    alt: "Event flyer for an EartGalla Art and Sip evening",
    caption: "Event promotion",
    width: 952,
    height: 713,
  },
  {
    src: "/projects/eartgalla/gallery/artwork-hyena.jpg",
    title: "Hyena",
    category: "Artwork",
    alt: "Painted artwork of a hyena in muted earth tones",
    caption: "From the EartGalla collection",
    width: 1280,
    height: 963,
  },
  {
    src: "/projects/eartgalla/gallery/artwork-beach.jpg",
    title: "Beach figure",
    category: "Artwork",
    alt: "Painted portrait of a woman standing by the sea",
    caption: "From the EartGalla collection",
    width: 899,
    height: 1599,
  },
  {
    src: "/projects/eartgalla/gallery/artwork-moon.jpg",
    title: "Moonlit scene",
    category: "Artwork",
    alt: "Painting of a moonlit scene on a studio wall",
    caption: "From the EartGalla collection",
    width: 963,
    height: 1280,
  },
  {
    src: "/projects/eartgalla/gallery/artwork-portrait.jpg",
    title: "Portrait with dragon",
    category: "Artwork",
    alt: "Painted portrait of a woman with a dragon resting on her shoulder",
    caption: "From the EartGalla collection",
    width: 720,
    height: 1280,
  },
  {
    src: "/projects/eartgalla/gallery/cards/card-2.jpg",
    title: "Illustrated card — 5 of clubs",
    category: "Playing cards",
    alt: "Illustrated playing card with a guitar motif",
    caption: "Illustrated card series",
    width: 720,
    height: 1280,
  },
  {
    src: "/projects/eartgalla/gallery/cards/card-1.jpg",
    title: "Illustrated card — 7 of clubs",
    category: "Playing cards",
    alt: "Illustrated playing card, seven of clubs",
    caption: "Illustrated card series",
    width: 736,
    height: 1305,
  },
  {
    src: "/projects/eartgalla/gallery/cards/card-4.jpg",
    title: "Illustrated card — 7 of hearts",
    category: "Playing cards",
    alt: "Illustrated playing card with strawberries",
    caption: "Illustrated card series",
    width: 736,
    height: 1104,
  },
  {
    src: "/projects/eartgalla/gallery/cards/card-3.jpg",
    title: "Illustrated card — 6 of clubs",
    category: "Playing cards",
    alt: "Illustrated playing card, six of clubs",
    caption: "Illustrated card series",
    width: 736,
    height: 1009,
  },
];

export const creativeCategories: ("All" | CreativeCategory)[] = ["All", "Brand", "Flyers & Posters", "Artwork", "Illustration", "Playing cards"];

// Open slots for pieces that are NOT from EartGalla. They render as clearly empty placeholders on /design only
// (never as fake images). To fill one: add a real entry to `creativeWorks` above and delete its slot here.
export type CreativeSlot = { category: CreativeCategory; hint: string };
export const creativeSlots: CreativeSlot[] = [
  { category: "Brand", hint: "A logo or identity for another client or project" },
  { category: "Flyers & Posters", hint: "A poster or flyer outside EartGalla" },
  { category: "Artwork", hint: "A personal or commissioned piece" },
  { category: "Illustration", hint: "An illustration or character study" },
  { category: "Playing cards", hint: "More cards from a deck, or a different deck" },
];

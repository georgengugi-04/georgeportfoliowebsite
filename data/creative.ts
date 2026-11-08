export type CreativeCategory = "Artwork" | "Illustration" | "Flyers & Posters" | "Brand";

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
    category: "Illustration",
    alt: "Illustrated playing card with a guitar motif",
    caption: "Illustrated card series",
    width: 720,
    height: 1280,
  },
  {
    src: "/projects/eartgalla/gallery/cards/card-1.jpg",
    title: "Illustrated card — 7 of clubs",
    category: "Illustration",
    alt: "Illustrated playing card, seven of clubs",
    caption: "Illustrated card series",
    width: 736,
    height: 1305,
  },
  {
    src: "/projects/eartgalla/gallery/cards/card-4.jpg",
    title: "Illustrated card — 7 of hearts",
    category: "Illustration",
    alt: "Illustrated playing card with strawberries",
    caption: "Illustrated card series",
    width: 736,
    height: 1104,
  },
  {
    src: "/projects/eartgalla/gallery/cards/card-3.jpg",
    title: "Illustrated card — 6 of clubs",
    category: "Illustration",
    alt: "Illustrated playing card, six of clubs",
    caption: "Illustrated card series",
    width: 736,
    height: 1009,
  },
];

export const creativeCategories: ("All" | CreativeCategory)[] = [
  "All",
  "Artwork",
  "Illustration",
  "Flyers & Posters",
  "Brand",
];

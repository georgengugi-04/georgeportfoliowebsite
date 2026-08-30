export type ProjectStatus = "live" | "in-progress" | "prototype" | "concept";

export type CaseStudySection = {
  heading: string;
  body: string;
};

export type Project = {
  slug: string;
  title: string;
  subtitle?: string;
  year: string;
  category: string;
  role: string;
  team?: string; // if collaborative, who else / what context
  status: ProjectStatus;
  technologies: string[];
  description: string; // one-line, used on cards
  longDescription: string; // paragraph, used on case study overview
  liveUrl?: string;
  githubUrl?: string;
  logo?: string; // path under /public — shown wherever the project name is mentioned
  socials?: { label: string; url: string }[];
  heroImage: string; // path under /public, placeholder allowed
  gallery: string[];
  problem: string;
  solution: string;
  myContribution: string;
  teamContribution?: string;
  architecture: string[]; // ordered layers, top to bottom
  challenges: { problem: string; decision: string; result: string }[];
  outcomes: string[];
  flow?: string[]; // e.g. supply chain / product journey steps
};

export const projects: Project[] = [
  {
    slug: "beeftrace",
    title: "BeefTrace",
    subtitle: "Digital Livestock Traceability Platform",
    year: "2025–2026",
    category: "Product engineering · AgTech",
    role: "Frontend & UI/UX engineer",
    team: "Built with the JKUAT / JHUB Africa team, alongside GreenTrack",
    status: "in-progress",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "GSAP", "Lenis"],
    description:
      "A birth-to-plate livestock traceability system — QR verification, GPS transport tracking and role-based dashboards for the beef supply chain.",
    longDescription:
      "BeefTrace gives every animal a digital identity that follows it from the farm to the consumer's plate. Instead of paper records that break down somewhere between the farm gate and the retail shelf, the system carries an animal's health, ownership and transport history forward as a single verifiable record — surfaced through QR codes anyone in the chain can scan.",
    liveUrl: "https://beef-gamma.vercel.app/",
    githubUrl: "https://github.com/geomaina04-byte/beef",
    logo: "/brand/beeftrace-logo.png",
    heroImage: "/projects/beeftrace/hero.jpg",
    gallery: [
      "/projects/beeftrace/detail.jpg",
      "/projects/beeftrace/journey.jpg",
    ],
    problem:
      "Livestock records in much of the supply chain are still paper-based or fragmented across whoever last handled the animal. That makes an animal's origin hard to verify, slows down health and safety checks, and gives everyone downstream — traders, processors, retailers, consumers — very little real visibility into what they're buying.",
    solution:
      "BeefTrace models each animal as a digital record that accumulates events as it moves: registration on the farm, health checks, transport, processing, distribution and retail. A QR code tied to that record lets anyone in the chain — or a consumer at the point of sale — pull up its verified history.",
    myContribution:
      "I built the marketing and product-facing Next.js site: the information architecture, the animated supply-chain narrative (farm → trader → transport → slaughterhouse → processing → distribution → retail → consumer), the component system, and the motion layer using Framer Motion, GSAP and Lenis for smooth scroll. I also own the visual design system — the dark charcoal / gold / emerald palette and the Archivo/Inter/IBM Plex Mono type system used across the site.",
    teamContribution:
      "The underlying traceability platform — data model, backend services, mobile capture, and GreenTrack integration — is built and evolved with the wider JKUAT/JHUB Africa team; this site is the product-facing layer on top of that work.",
    architecture: [
      "Next.js (App Router) front end",
      "Component-driven UI system (Framer Motion + GSAP for scroll/timeline choreography)",
      "Integration surface to the shared traceability data model",
      "Deployment on Vercel",
    ],
    challenges: [
      {
        problem: "Communicating a multi-stage supply chain (8 stages) without it turning into a wall of text.",
        decision: "Built an animated horizontal timeline that reveals one stage at a time on scroll, using Lenis for smooth-scroll pacing and GSAP for the stage transitions.",
        result: "A supply-chain story that reads in under a minute but still names every real stage in the chain.",
      },
      {
        problem: "Making an AgTech product feel premium rather than like a generic dashboard template.",
        decision: "Committed to a dark, editorial palette (charcoal, gold, maroon, emerald) instead of the default light SaaS look, and kept animation purposeful rather than decorative.",
        result: "A site that reads as a serious infrastructure product rather than a student prototype.",
      },
    ],
    outcomes: [
      "A working, deployed marketing and product site",
      "A clear, animated explanation of the full traceability journey",
      "A reusable design system now shared across the BeefTrace product surface",
    ],
    flow: ["Farm", "Trader", "Transport", "Slaughterhouse", "Processing", "Distribution", "Retail", "Consumer"],
  },
  {
    slug: "greentrack",
    title: "GreenTrack",
    subtitle: "From Seed to Table",
    year: "2025–2026",
    category: "Mobile engineering · AgTech",
    role: "Flutter developer — architecture, UI and Firebase integration",
    team: "Built with the GreenTrack team",
    status: "in-progress",
    technologies: ["Flutter", "Dart", "Firebase Auth", "Firestore", "Firebase Storage"],
    description:
      "A farm-to-table Flutter app that lets growers track plots, log harvests and carry produce history from garden to table across three roles.",
    longDescription:
      "GreenTrack is a mobile system for small-scale growers who have no simple way to keep digital records of what they're growing, when it was harvested and where it went. It models a full custody chain — Farmer, Aggregator, Transporter, Distributor, and now Retailer — with role-based dashboards, a shared supply-chain data model, and QR-based status tracking at each handoff.",
    liveUrl: "https://greentrackweb.georgengugi612.workers.dev/",
    logo: "/brand/greentrack-logo.png",
    heroImage: "/projects/greentrack/hero.jpg",
    gallery: [
      "/projects/greentrack/journal.jpg",
      "/projects/greentrack/crops.jpg",
      "/projects/greentrack/footer.jpg",
    ],
    problem:
      "Small-scale growers and the people downstream of them — aggregators, transporters, distributors, retailers — have no shared, simple way to record and pass along what happened to a crop: which plot it came from, when it was harvested, how it moved, and whether it's actually what it claims to be by the time it reaches a shelf.",
    solution:
      "A role-based Flutter app built around a shared custody-chain model (CustodyStage / CustodyEvent), so each role sees the dashboard and actions relevant to them, but is all working off the same underlying record for a batch of produce.",
    myContribution:
      "I led the environment setup, app architecture, and UI implementation against a formal design system (forest green / emerald / golden-yellow palette, Plus Jakarta Sans / Poppins type, 22–28px card radii, no flat cards). I built the six-step crop lifecycle flow, role-based routing, Firebase Auth (including Google Sign-In), and Firestore/Storage integration for photo capture on batches. Most recently I added the full Retailer role — dashboard, receiving/verification workflow, store-of-record capture, and 'Verified at Retailer' QR status — onto the existing Farmer → Aggregator → Transporter → Distributor chain, plus the Firestore rules that support it.",
    teamContribution:
      "Design direction and product requirements are set with the GreenTrack team; the retailer-facing photo asset system was scoped out as a follow-up pending real photography.",
    architecture: [
      "Flutter (Dart) mobile client — Farmer / Aggregator / Transporter / Distributor / Retailer roles",
      "Shared CustodyStage / CustodyEvent data model",
      "Firebase Auth (incl. Google Sign-In) for role-based access",
      "Firestore for batch, custody-event and profile data",
      "Firebase Storage for batch and profile photos",
    ],
    challenges: [
      {
        problem: "Five different roles needed genuinely different dashboards without forking the codebase five ways.",
        decision: "Modeled the supply chain once (CustodyStage enum, CustodyEvent log) and built a shared SupplyChainDashboardScreen that renders role-appropriate actions off the same data.",
        result: "Adding the Retailer role meant extending the existing model rather than rebuilding — dashboard, receive/verify flow and QR status shipped without touching the other four roles' code.",
      },
      {
        problem: "Enforcing one consistent design system across a growing number of screens built over multiple sessions.",
        decision: "Wrote the design system down as a standing rule (palette, type, radii, iconography) and required every new screen to reuse existing components rather than introduce one-off styling.",
        result: "A UI that reads as one product rather than a set of screens stitched together over time.",
      },
    ],
    outcomes: [
      "A working five-role custody chain from farm to retailer",
      "Firebase Auth, Firestore and Storage fully wired into the crop lifecycle",
      "A documented, enforced design system reused across every new screen",
    ],
    flow: ["Plant", "Grow", "Track", "Harvest", "Understand", "Trade", "Consume"],
  },
  {
    slug: "arkyls",
    title: "Arkyls",
    year: "2025",
    category: "Web project",
    role: "Developer",
    status: "prototype",
    technologies: ["—"],
    description: "A web project — case study in progress.",
    longDescription:
      "Details for this case study are being written up. Check back soon, or view the live project in the meantime.",
    liveUrl: "https://arkyls.wuaze.com",
    heroImage: "/projects/arkyls/hero.jpg",
    gallery: [],
    problem: "Case study content pending.",
    solution: "Case study content pending.",
    myContribution: "Case study content pending.",
    architecture: [],
    challenges: [],
    outcomes: [],
  },
  {
    slug: "eartgalla",
    title: "EartGalla",
    subtitle: "Where Soul Meets Canvas — African art gallery & marketplace",
    year: "2026",
    category: "Web development · E-commerce",
    role: "Developer",
    status: "prototype",
    technologies: ["PHP", "HTML/CSS", "JavaScript"],
    description:
      "An African art gallery and marketplace built end-to-end — my own art, listed and sold through a site I built myself, under my personal brand, Koshe.exe.",
    longDescription:
      "EartGalla is a gallery-style marketplace for African contemporary art — 'share your creation with the world.' It's also where engineering and the other half of what I make meet: the art in the gallery is mine, sold through a storefront I built myself. A curated home page, gallery and artist browsing, and a cart/checkout flow that ends in an enquiry rather than a blind purchase — appropriate for higher-value original art sales where a human still needs to confirm the transaction.",
    liveUrl: "https://www.galla.loveslife.biz",
    socials: [
      { label: "Instagram", url: "https://instagram.com/k.o.s.h.e" },
      { label: "TikTok", url: "https://tiktok.com/@k.o.s.h.e" },
    ],
    heroImage: "/projects/eartgalla/hero.jpg",
    gallery: [
      "/projects/eartgalla/cart.jpg",
      "/projects/eartgalla/gallery/flyer-brand.jpg",
      "/projects/eartgalla/gallery/flyer-event.jpg",
      "/projects/eartgalla/gallery/artwork-moon.jpg",
      "/projects/eartgalla/gallery/artwork-portrait.jpg",
      "/projects/eartgalla/gallery/artwork-beach.jpg",
      "/projects/eartgalla/gallery/artwork-hyena.jpg",
      "/projects/eartgalla/gallery/cards/card-1.jpg",
      "/projects/eartgalla/gallery/cards/card-2.jpg",
      "/projects/eartgalla/gallery/cards/card-3.jpg",
      "/projects/eartgalla/gallery/cards/card-4.jpg",
    ],
    problem:
      "Independent African artists often don't have a storefront built around presenting their work well — gallery-quality presentation, artist context, and a purchase flow that matches how original art actually sells (enquiry and authentication, not instant checkout). As the artist behind the work, I needed exactly that for my own paintings and illustrated pieces.",
    solution:
      "A dark, editorial gallery site — Home, Gallery, Artists, Collections, About, Contact — with a cart that totals a selection in KES and routes to an 'Enquire to Purchase' step, noting that every purchase includes a certificate of authenticity. Alongside the site, EartGalla also runs small in-person events — 'Art & Sip' evenings — promoted through the same brand system.",
    myContribution:
      "Built the front end and the PHP-backed cart flow (`cart.php`) — page structure, the shopping cart with quantity/remove/clear-cart controls, the order summary (subtotal, shipping, authentication line item, total), and the gold-on-black gallery visual system. Also the artist behind the work on the site, and behind the brand and event design (flyers, social presence) shown here.",
    architecture: [
      "HTML/CSS front end",
      "PHP for cart state and the checkout/enquiry flow",
      "Deployed at galla.loveslife.biz",
    ],
    challenges: [
      {
        problem: "Original art doesn't sell like a normal e-commerce SKU — price, shipping and authenticity all need explaining before someone commits.",
        decision: "Made the cart end in 'Enquire to Purchase' rather than a payment form, and surfaced authentication as a visible line item in the order summary rather than fine print.",
        result: "A checkout flow that matches how art actually changes hands, instead of forcing a generic add-to-cart pattern onto it.",
      },
    ],
    outcomes: [
      "A working, live gallery site with cart and checkout-enquiry flow",
      "A cohesive dark/gold visual identity distinct from the AgTech projects",
      "A real catalogue of original work — paintings and an illustrated card series — actually listed for sale",
    ],
  },
  {
    slug: "bagboy",
    title: "BagBoy",
    subtitle: "E-commerce shopping experience",
    year: "Concept",
    category: "Product concept · E-commerce",
    role: "Designer / developer",
    status: "concept",
    technologies: ["—"],
    description: "An e-commerce concept focused on product discovery, cart flow and an AI-assisted shopping idea.",
    longDescription:
      "A concept exploring what a more guided shopping experience could look like — product discovery, a streamlined cart, and an assisted-shopping idea layered on top of standard e-commerce architecture.",
    heroImage: "/projects/bagboy/hero.jpg",
    gallery: [],
    problem: "Generic storefronts leave shoppers to do all the filtering themselves.",
    solution: "A shopping flow concept built around guided discovery.",
    myContribution: "Concept and UX exploration — not yet built.",
    architecture: [],
    challenges: [],
    outcomes: ["Concept and UX direction defined; implementation not yet started."],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

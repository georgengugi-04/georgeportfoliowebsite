export type ProjectStatus = "live" | "in-progress" | "prototype" | "concept" | "assessment";
export type Discipline = "engineering" | "mobile" | "creative";

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
  technologies: string[]; // empty = not yet confirmed
  description: string; // one-line, used on cards
  longDescription: string; // paragraph, used on case study overview
  liveUrl?: string;
  githubUrl?: string;
  logo?: string; // path under /public — shown wherever the project name is mentioned
  socials?: { label: string; url: string }[];
  disciplines: Discipline[];
  featured?: boolean;
  heroImage?: string; // real screenshot only — omit rather than use a placeholder
  heroImageAlt?: string;
  gallery: string[];
  screens?: { src: string; label: string }[]; // phone screenshots, rendered in device frames
  shots?: { src: string; label: string }[]; // browser screenshots of the live site, 16:9-ish
  videos?: { id: string; title: string }[]; // YouTube video ids (click-to-load embeds)
  screensAspect?: string; // aspect ratio of phone screenshots if not the default
  demoVideo?: { src: string; poster: string; label: string };
  screensPending?: string; // honest note shown when screenshots are still to come
  additionalLiveUrls?: { label: string; url: string }[];
  verification?: string; // what has / has not been independently verified
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
    role: "Software developer — frontend engineering and UI/UX design",
    team: "Built with the JKUAT / JHUB Africa team, alongside GreenTrack",
    status: "live",
    disciplines: ["engineering", "creative"],
    featured: true,
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "GSAP", "Lenis"],
    description:
      "A birth-to-plate livestock traceability system — QR verification, GPS transport tracking and role-based dashboards for the beef supply chain.",
    longDescription:
      "BeefTrace gives every animal a digital identity that follows it from the farm to the consumer's plate. Instead of paper records that break down somewhere between the farm gate and the retail shelf, the system carries an animal's health, ownership and transport history forward as a single verifiable record — surfaced through QR codes anyone in the chain can scan.",
    liveUrl: "https://beef-gamma.vercel.app/",
    githubUrl: "https://github.com/geomaina04-byte/beef",
    logo: "/brand/beeftrace-logo.png",
    heroImage: "/projects/beeftrace/hero.jpg",
    heroImageAlt: "BeefTrace website homepage",
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
    category: "Mobile development · AgTech",
    role: "Flutter developer — architecture, UI and Firebase integration",
    team: "Built with the GreenTrack team",
    status: "in-progress",
    disciplines: ["mobile", "engineering"],
    featured: true,
    technologies: ["Flutter", "Dart", "Firebase Auth", "Google Sign-In", "Firestore", "Firebase Storage"],
    description:
      "A farm-to-table Flutter app that lets growers log crops and harvests, then carries a QR-verified history of each batch through the supply chain to the table.",
    longDescription:
      "GreenTrack is a mobile system for small-scale growers who have no simple way to keep digital records of what they're growing, when it was harvested and where it went. It models a full custody chain — Farmer, Aggregator, Transporter, Distributor, and now Retailer — with role-based dashboards, a shared supply-chain data model, and QR-based status tracking at each handoff.",
    liveUrl: "https://greentrackweb.vercel.app/",
    additionalLiveUrls: [{ label: "Mirror deployment", url: "https://greentrackweb.georgengugi612.workers.dev/" }],
    githubUrl: "https://github.com/georgengugi-04/Greentrack-flutter",
    logo: "/brand/greentrack-logo.png",
    heroImage: "/projects/greentrack/hero.jpg",
    heroImageAlt: "GreenTrack web experience",
    videos: [
      { id: "DcW-R4t1x1Q", title: "GreenTrack — video 1" },
      { id: "I-AMJv9LnFg", title: "GreenTrack — video 2" },
    ],
    screens: [
      { src: "/projects/greentrack/app/roles.jpg", label: "Choose your role in the chain" },
      { src: "/projects/greentrack/app/farmer-home.jpg", label: "Farmer home & farm-zone weather" },
      { src: "/projects/greentrack/app/dashboard.jpg", label: "Crops dashboard" },
      { src: "/projects/greentrack/app/new-batch.jpg", label: "Log a new crop batch" },
      { src: "/projects/greentrack/app/pest-scan.jpg", label: "AI pest & disease scan" },
      { src: "/projects/greentrack/app/irrigation-advisor.jpg", label: "Irrigation advisor" },
      { src: "/projects/greentrack/app/harvest-yield.jpg", label: "Harvest yield tracking" },
      { src: "/projects/greentrack/app/listing.jpg", label: "Produce listing" },
      { src: "/projects/greentrack/app/trace-journey.jpg", label: "Farm-to-table journey" },
      { src: "/projects/greentrack/app/scan-qr.jpg", label: "Scan incoming batch QR" },
    ],
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
    category: "Web development · Digital product design",
    role: "Developer",
    status: "live",
    disciplines: ["engineering"],
    technologies: [],
    description: "A website for Arkyls, an architecture and design studio in Nairobi — project showcase, services walkthrough and a filterable portfolio.",
    longDescription:
      "Arkyls is a live website for an architecture and design studio in Nairobi. It presents the studio through a full-screen hero, a staged services walkthrough with 3D visuals, and a project portfolio filterable by category. The technology stack and a description of my specific contribution will be added once verified, rather than guessed.",
    liveUrl: "https://arkyls.vercel.app/",
    logo: "/projects/arkyls/logo.png",
    heroImage: "/projects/arkyls/home.jpg",
    heroImageAlt: "Arkyls homepage: Spaces built to endure",
    shots: [
      { src: "/projects/arkyls/services.jpg", label: "Services — staged process with a 3D visual" },
      { src: "/projects/arkyls/projects.jpg", label: "Projects — filterable by category" },
    ],
    gallery: [],
    problem: "",
    solution: "",
    myContribution: "",
    architecture: [],
    challenges: [],
    outcomes: [],
    verification: "Deployed on Vercel. Functionality, stack and contribution details are pending verification.",
  },
  {
    slug: "webstories",
    title: "WebStories",
    year: "2025–2026",
    category: "Web development · Digital experiences",
    role: "Developer",
    status: "live",
    disciplines: ["engineering"],
    technologies: [],
    description: "A live web experience deployed on Cloudflare Workers. Full write-up pending verification.",
    longDescription:
      "WebStories is deployed and publicly accessible on Cloudflare Workers. A detailed case study covering what it does, how it is built and what I contributed will be added once those details are confirmed.",
    liveUrl: "https://webstrories.georgengugi612.workers.dev/",
    gallery: [],
    problem: "",
    solution: "",
    myContribution: "",
    architecture: [],
    challenges: [],
    outcomes: [],
    verification: "Deployed on Cloudflare Workers. Functionality, stack and contribution details are pending verification.",
  },
  {
    slug: "pamoja",
    title: "PAMOJA",
    subtitle: "Reliable stock reservation service",
    year: "2026",
    category: "Backend engineering · Fintech infrastructure",
    role: "Author — API design, implementation and testing",
    status: "assessment",
    disciplines: ["engineering"],
    featured: true,
    technologies: ["Node.js", "TypeScript", "Express", "PostgreSQL", "Docker", "Vitest", "Supertest"],
    description:
      "A stock reservation service built to stay correct under concurrent requests: transactional reservations, idempotency and race-condition prevention.",
    longDescription:
      "PAMOJA is my implementation for a backend engineering technical assessment (Stage 5). It is an engineering exercise in correctness: many clients may try to reserve the same limited stock at the same moment, and the service must never oversell. It is not a production deployment and is presented here as assessment work.",
    githubUrl: "https://github.com/georgengugi-04/pamoja-stock-reservation",
    gallery: [],
    problem:
      "When several requests try to reserve the same stock at once, naive read-then-write logic oversells inventory. Retried requests (a client timing out and trying again) can also create duplicate reservations.",
    solution:
      "Reservations run inside PostgreSQL transactions so availability checks and decrements happen atomically. Idempotency keys make retries safe, and the API surface is small and explicit so its behaviour under contention can be tested.",
    myContribution:
      "I built the service end to end: a stock reservation API using PostgreSQL transactions and an atomic conditional UPDATE; idempotency keys backed by a database unique constraint; reservation release and expiry with row locking so stock is restored exactly once even when release and expiry race; 64 automated tests (Vitest, Supertest) run against a real PostgreSQL database, including concurrent-request and race-condition tests; and a technical note documenting the design, trade-offs and limitations. The database runs locally through Docker Compose.",
    architecture: [
      "Express REST API (TypeScript) — reserve and release stock",
      "Idempotency keys backed by a database unique constraint",
      "PostgreSQL — transactions, atomic conditional UPDATE, row locking for release and expiry",
      "Vitest and Supertest suite — 64 tests against a real PostgreSQL database, including race conditions",
    ],
    challenges: [
      {
        problem: "Concurrent requests for the last units of stock.",
        decision: "Make the availability check and the decrement a single transactional unit so two requests cannot both succeed against the same stock.",
        result: "Overselling is prevented by the database transaction rather than by hopeful application code.",
      },
      {
        problem: "Clients retrying a reservation after a timeout.",
        decision: "Back idempotency keys with a database unique constraint and return the original result on repeat requests.",
        result: "A retry cannot create a second reservation.",
      },
    ],
    outcomes: [
      "A tested reservation service: 64 automated tests including concurrent-request and race-condition cases",
      "Public source on GitHub",
    ],
    verification: "Technical assessment work (Stage 5), details taken from the author's CV. Not an employment role and not a production deployment.",
  },
  {
    slug: "eartgalla",
    title: "EartGalla",
    subtitle: "Where Soul Meets Canvas — African art gallery & marketplace",
    year: "2026",
    category: "Web development · E-commerce",
    role: "Developer",
    status: "live",
    disciplines: ["creative", "engineering"],
    featured: true,
    technologies: ["Next.js", "TypeScript", "PHP", "HTML/CSS", "JavaScript"],
    description:
      "An African art gallery and marketplace — gallery presentation, an enquiry-based purchase flow and brand graphics, designed and built under the Koshe.exe identity.",
    longDescription:
      "EartGalla is a gallery-style marketplace for African contemporary art — 'share your creation with the world.' It is also where engineering and visual design meet: I built the storefront and designed its brand and event graphics. A curated home page, gallery and artist browsing, and a cart/checkout flow that ends in an enquiry rather than a blind purchase — appropriate for higher-value original art sales where a human still needs to confirm the transaction.",
    liveUrl: "https://eartgalla.vercel.app/",
    additionalLiveUrls: [{ label: "Original PHP cart flow", url: "https://www.galla.loveslife.biz" }],
    socials: [
      { label: "Instagram", url: "https://instagram.com/k.o.s.h.e" },
      { label: "TikTok", url: "https://tiktok.com/@k.o.s.h.e" },
    ],
    heroImage: "/projects/eartgalla/hero.jpg",
    heroImageAlt: "EartGalla gallery homepage",
    shots: [
      { src: "/projects/eartgalla/site/journeys.jpg", label: "Journeys — travel stories across Kenya" },
      { src: "/projects/eartgalla/site/gallery.jpg", label: "The Gallery — artworks with artist credits" },
      { src: "/projects/eartgalla/site/art-lab.jpg", label: "Art Lab — a scattered collage of works" },
      { src: "/projects/eartgalla/site/curate-your-wall.jpg", label: "Art Lab — Curate Your Wall" },
      { src: "/projects/eartgalla/site/gazette.jpg", label: "Gazette — editorial article layout" },
    ],
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
      "Independent African artists often don't have a storefront built around presenting their work well — gallery-quality presentation, artist context, and a purchase flow that matches how original art actually sells (enquiry and authentication, not instant checkout). EartGalla was built to give artwork exactly that.",
    solution:
      "A dark, editorial gallery site — Home, Gallery, Artists, Collections, About, Contact — with a cart that totals a selection in KES and routes to an 'Enquire to Purchase' step, noting that every purchase includes a certificate of authenticity. Alongside the site, EartGalla also runs small in-person events — 'Art & Sip' evenings — promoted through the same brand system.",
    myContribution:
      "Built the front end and the PHP-backed cart flow (`cart.php`) — page structure, the shopping cart with quantity/remove/clear-cart controls, the order summary (subtotal, shipping, authentication line item, total), and the gold-on-black gallery visual system. Also responsible for the brand and event design (flyers, social presence) shown here.",
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
      "A live gallery site with cart and enquiry-to-purchase flow",
      "A cohesive dark/gold visual identity distinct from the AgTech projects",
      "A real catalogue of original paintings and an illustrated card series presented for sale",
    ],
  },
  {
    slug: "eartgalla-mobile",
    title: "EartGalla Mobile",
    subtitle: "Community stories, languages and oral histories",
    year: "2026",
    category: "Mobile development · Culture & storytelling",
    role: "Developer & designer",
    status: "in-progress",
    disciplines: ["mobile", "creative"],
    technologies: [],
    description: "A mobile app for community stories, languages and oral histories from Kenya, with a reader built for long-form text. In active development.",
    longDescription:
      "EartGalla Mobile is a mobile app I am actively building. It is organised around Discover, Watch, Communities, Saved and Profile, with community pages that list languages, regions, written stories and room for oral histories and short films. A reader view includes adjustable text size and a sources section. The content shown in the screenshots is sample research drafts, marked in the app as not yet reviewed by communities or editors.",
    liveUrl: undefined,
    gallery: [],
    screensAspect: "9/20",
    screens: [
      { src: "/projects/eartgalla-mobile/discover.jpg", label: "Discover — stories that carry us" },
      { src: "/projects/eartgalla-mobile/communities.jpg", label: "Communities — search by name or language" },
      { src: "/projects/eartgalla-mobile/community-profile.jpg", label: "A community page: languages, region, stories" },
      { src: "/projects/eartgalla-mobile/article.jpg", label: "Reader view for long-form articles" },
      { src: "/projects/eartgalla-mobile/sources.jpg", label: "Sources and further reading" },
    ],
    demoVideo: {
      src: "/projects/eartgalla-mobile/demo.mp4",
      poster: "/projects/eartgalla-mobile/demo-poster.jpg",
      label: "Screen recording — browsing communities and reading an article",
    },
    problem: "Community stories, languages and histories need a place where they can be browsed by community and read comfortably on a phone.",
    solution: "A mobile app that groups content by community, offers a reader with adjustable text size, shows sources, and labels draft material as not yet reviewed.",
    myContribution: "Design and development of the mobile application.",
    architecture: [],
    challenges: [],
    outcomes: ["Application build in progress"],
    verification: "In development. Not released. The content in the screenshots is sample draft material, marked in the app as not yet reviewed. Technology stack to be confirmed.",
  },
  {
    slug: "bagboy",
    title: "BagBoy",
    subtitle: "E-commerce shopping experience",
    year: "Concept",
    category: "Product concept · E-commerce",
    role: "Designer / developer",
    status: "concept",
    disciplines: ["creative"],
    technologies: [],
    description: "An e-commerce concept focused on product discovery, cart flow and an AI-assisted shopping idea.",
    longDescription:
      "A concept exploring what a more guided shopping experience could look like — product discovery, a streamlined cart, and an assisted-shopping idea layered on top of standard e-commerce architecture.",
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

export const featuredOrder = ["greentrack", "beeftrace", "pamoja", "eartgalla", "eartgalla-mobile", "arkyls", "webstories"];
export const orderedProjects = featuredOrder
  .map((slug) => projects.find((p) => p.slug === slug)!)
  .concat(projects.filter((p) => !featuredOrder.includes(p.slug)));

export const statusLabel: Record<ProjectStatus, string> = {
  live: "Live",
  "in-progress": "In development",
  prototype: "Prototype",
  concept: "Concept",
  assessment: "Technical assessment",
};

# George Ngugi — Portfolio

Software engineer / UI-UX portfolio. Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion.

## Run it

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm start
```

`npm run build` passes clean (0 TypeScript / lint / build errors) as of this scaffold.

## What's here

- **Design system**: near-black ground (`#0A0B0A`), off-white (`#F6F5F1`), one signature accent — electric lime (`#B4FF39`), used only for links/active states/CTAs. Space Grotesk (display) / Inter (body) / JetBrains Mono (labels, metadata). All tokens live in `tailwind.config.ts`.
- **Data-driven projects**: every project (`BeefTrace`, `GreenTrack`, `Arkyls`, `E-Art`, `BagBoy`) is one object in `data/projects.ts`. Add a project by adding an object — the case-study template (`app/work/[slug]/page.tsx`) renders whatever sections that project actually has data for, and honestly labels thin entries ("case study in progress") instead of padding them out.
- **Pages built**: `/`, `/about`, `/work`, `/work/[slug]` (5 case studies), `/skills` (interactive, hover-to-see-usage), `/experience` (timeline), `/contact` (working client-side form UI — wire up the `onSubmit` in `app/contact/page.tsx` to an actual email/API endpoint), custom 404.
- **Motion**: Framer Motion for scroll reveals (`components/ui/Reveal.tsx`), nav active-state morph, mobile menu, hover states. Kept restrained — text doesn't idle-animate, nothing loops forever. `prefers-reduced-motion` is respected globally via `globals.css`.
- **Accessibility**: skip-to-content link, visible focus rings (`:focus-visible`), semantic headings, keyboard-operable nav and mobile menu, labelled form fields.
- **SEO**: per-page metadata (title template, description, Open Graph/Twitter) via each route's `metadata` export or a thin `layout.tsx` wrapper for client-component pages.

## Assets

Real product screenshots are now in `public/projects/{beeftrace,greentrack,eartgalla}/` and a profile photo in `public/profile/george.jpg` — all wired into `data/projects.ts` and rendered via `next/image` on each case-study page and the About page. `Arkyls` and `BagBoy` still use generated placeholder frames (clearly labelled "screenshot pending" / "concept — not yet built") since no real screenshots exist for those yet — swap the file at the same path once you have them, no code change needed.

`EartGalla` (the African art gallery/marketplace, PHP-backed cart flow) has been promoted from a fabricated "concept" entry to a real project with real screenshots, since you shared it's actually built — see its updated entry in `data/projects.ts`.

GitHub links (footer, contact page) now point to `github.com/georgengugi-04`. BeefTrace's case study links to its actual repo, `github.com/geomaina04-byte/beef`.

I didn't pull in stock photography from the web for decorative backgrounds — search-result images aren't licensed for reuse in a deliverable, and the sandbox this was built in can't fetch arbitrary image URLs anyway. The hero's visual system is CSS (a subtle grid), which also keeps it from fighting your real product screenshots for attention. If you want editorial photography (e.g. for a future `/lab` page), Unsplash's API with proper attribution is the cleanest route.

## Branding & social — latest update

- **Nav logo**: swapped the text wordmark for your `Koshe.exe` logo (`public/brand/koshe-logo.png`), black background keyed to transparent so it sits naturally on the dark nav.
- **Profile photo in hero**: a small circular avatar + name/location chip now sits at the top of the homepage hero, and a larger portrait is on `/about`.
- **Project logos "where the name is mentioned"**: BeefTrace's and GreenTrack's real logos (`public/brand/beeftrace-logo.png`, `greentrack-logo.png`) now render next to the project name on the homepage featured cards, the `/work` index, and each case-study `<h1>`. Add a `logo` path to any project in `data/projects.ts` to get the same treatment elsewhere.
- **EartGalla**: promoted to a full case study built around your real assets — the actual site screenshots, both flyer/brand graphics, and a gallery of your artwork (the moon piece, the Daenerys portrait, the beach painting, the hyena piece, and a sample of the illustrated card series from `cards.zip`). Live URL updated to `galla.loveslife.biz`, and Instagram/TikTok (`@k.o.s.h.e`) are linked from the case-study page via the new `socials` field on `Project`.
- **Contact/footer links**: GitHub → `github.com/georgengugi-04`, Medium → `medium.com/@georgengugi612`, LinkedIn → the link you provided (note: it's LinkedIn's own "self-view public profile" share link, not a plain `/in/username` URL — swap it for your normal public profile URL if you'd rather use that).

## Fonts note

Fonts are loaded via a CSS `@import` in `app/globals.css` (with system-font fallbacks) rather than `next/font/google`, because this scaffold was built in a network-sandboxed environment that can't reach `fonts.googleapis.com` at build time. Once you're building somewhere with normal internet access, swap to `next/font/google` for self-hosted, zero-layout-shift fonts — the exact code to paste back into `app/layout.tsx` is commented right there in the file.

## Not yet built (same patterns apply — this is where to pick up)

- `/lab`, `/resume`, `/uses` pages
- Real screenshots/photography in `public/projects/**` (currently placeholder blocks in each case study's hero + gallery slots — the `gallery` array is already on every `Project` type, just add real image paths and swap the placeholder `<div>` in `app/work/[slug]/page.tsx` for `next/image`)
- Full case-study depth (architecture diagrams, challenge breakdowns, outcomes) for Arkyls, E-Art and BagBoy — currently short/honest placeholders because the source material wasn't available; fill in `data/projects.ts` once it is
- Real dates for `data/experience.ts` (currently says "Ongoing"/"In progress" rather than guessing)
- Contact form → real email delivery (Formspree/Resend/API route)
- Custom cursor system (desktop-only, `VIEW PROJECT →` / `OPEN →` states) — not implemented; add as a client component in `components/ui/Cursor.tsx` and mount it in `app/layout.tsx`, gated behind a pointer-fine media query and `prefers-reduced-motion`
- Page-to-case-study `layoutId` shared-element transition (Framer Motion `layoutId` on the project card image → hero image) for the "card expands into page" effect
- Sitemap/robots.txt (`app/sitemap.ts`, `app/robots.ts` — trivial to add once the site has a real domain)

## Structure

```
app/            routes (App Router)
components/
  navigation/   Nav
  footer/       Footer
  sections/     homepage sections (Hero, Intro, FeaturedWork, etc.)
  ui/           Reveal (scroll-in wrapper)
data/           projects.ts, skills.ts, experience.ts — all content lives here
```

# George Ngugi — Portfolio (Koshe.exe)

Creative-engineering portfolio: software engineering, mobile development and creative design.
Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Three.js (Lab only).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Routes
`/` home · `/work` + `/work/[slug]` case studies · `/engineering` · `/design` (Creative Studio, filters + lightbox) · `/about` (includes experience timeline) · `/contact` · `/lab`
`/skills` and `/experience` permanently redirect to `/engineering` and `/about`. Also: `sitemap.xml`, `robots.txt`, generated Open Graph image, custom 404.

## Content lives in `data/`
- `projects.ts` — every project: status, role, real contribution, screenshots. Statuses are honest (`live`, `in-progress`, `assessment`, `concept`). Leave a field empty rather than guess.
- `creative.ts` — Creative Studio pieces (drop files in `public/` and add an entry).
- `experience.ts`, `skills.ts`, `site.ts` — timeline, capability map, identity and links.

### EartGalla Mobile screenshots and video
Put images in `public/projects/eartgalla-mobile/`, then in `data/projects.ts` add
`screens: [{ src: "/projects/eartgalla-mobile/home.jpg", label: "Home" }]` and delete `screensPending`.

## Contact form — setup required
The form validates client- and server-side, but **only sends mail when configured**. Otherwise it tells the visitor the message was NOT sent.
Set in Vercel → Project → Environment Variables (see `.env.example`):
`RESEND_API_KEY`, `CONTACT_TO_EMAIL` (and optionally `CONTACT_FROM_EMAIL`, a verified Resend sender).
Also set `NEXT_PUBLIC_CONTACT_EMAIL` and `NEXT_PUBLIC_LINKEDIN_URL` to show those links; they are hidden until set.

## Notes
- Fonts load from Google Fonts via CSS `@import`; switch to `next/font/google` for self-hosting if desired.
- No secrets are committed; `.env*` is git-ignored.

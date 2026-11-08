// Single source of truth for site-wide identity and links.
// Anything not publicly verified is read from environment variables instead of being hard-coded.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://georgeportfoliowebsite.vercel.app";

export const site = {
  name: "George Ngugi",
  alias: "Koshe.exe",
  location: "Nairobi, Kenya",
  title: "George Ngugi — Software Engineer, Mobile Developer & Creative Designer",
  description:
    "George Ngugi (Koshe.exe) is a Nairobi-based software engineer, Flutter mobile developer and creative designer building digital products and visual experiences.",
  tagline: "Engineering digital experiences. Designing ideas into reality.",
  // Optional — set in .env.local / Vercel project settings. See README.
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || "",
  github: "https://github.com/georgengugi-04",
  medium: "https://medium.com/@georgengugi612",
  instagram: "https://instagram.com/k.o.s.h.e",
  tiktok: "https://tiktok.com/@k.o.s.h.e",
};

export const nav = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/engineering", label: "Engineering" },
  { href: "/design", label: "Design" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

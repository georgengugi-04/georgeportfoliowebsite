import type { Metadata, Viewport } from "next";
import { site, SITE_URL } from "@/data/site";
import "./globals.css";
import Nav from "@/components/navigation/Nav";
import Footer from "@/components/footer/Footer";

// NOTE: fonts are loaded via CSS in globals.css (see @import) rather than
// next/font/google, so the build works in offline/sandboxed environments.
// On a normal deploy with internet access, swap this back to next/font/google
// for Space Grotesk / Inter / JetBrains Mono to get self-hosted, zero-layout-shift fonts:
//
//   import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
//   const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", weight: ["500","700"] });
//   ...then add `${display.variable}` etc. to the <html> className below.

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: site.title, template: "%s — George Ngugi" },
  description: site.description,
  alternates: { canonical: "/" },
  applicationName: "George Ngugi Portfolio",
  authors: [{ name: site.name, url: SITE_URL }],
  keywords: ["George Ngugi", "Koshe.exe", "software engineer", "Flutter developer", "Next.js", "UI/UX designer", "graphic designer", "Nairobi", "Kenya"],
  openGraph: { title: site.title, description: site.description, type: "website", url: SITE_URL, siteName: "George Ngugi", locale: "en_KE" },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0B0A" },
    { media: "(prefers-color-scheme: light)", color: "#F6F5F1" },
  ],
};

// Runs before first paint so there is no flash of the wrong theme.
const themeScript = `try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.dataset.theme=t}catch(e){}`;

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  alternateName: site.alias,
  url: SITE_URL,
  jobTitle: "Software Engineer, Mobile Developer and Creative Designer",
  address: { "@type": "PostalAddress", addressLocality: "Nairobi", addressCountry: "KE" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "KCA University" },
  sameAs: [site.github, site.medium, site.instagram, site.linkedin].filter(Boolean),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-ink text-paper font-body">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-signal focus:text-ink focus:px-4 focus:py-2 focus:rounded"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

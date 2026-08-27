import type { Metadata } from "next";
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
  metadataBase: new URL("https://georgengugi.dev"),
  title: {
    default: "George Ngugi — Software Engineer & Product Builder",
    template: "%s — George Ngugi",
  },
  description:
    "Software engineer, full-stack developer and UI/UX designer focused on building useful products across web, mobile and data-driven systems.",
  openGraph: {
    title: "George Ngugi — Software Engineer & Product Builder",
    description:
      "Software engineer, full-stack developer and UI/UX designer focused on building useful products across web, mobile and data-driven systems.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "George Ngugi — Software Engineer & Product Builder",
    description:
      "Software engineer, full-stack developer and UI/UX designer focused on building useful products across web, mobile and data-driven systems.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-ink text-paper font-body">
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

import type { Metadata, Viewport } from "next";
import { site, SITE_URL } from "@/data/site";
// Self-hosted fonts (latin subset): no third-party request, no render-blocking stylesheet.
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-700.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-500.css";
import "./globals.css";
import Nav from "@/components/navigation/Nav";
import Footer from "@/components/footer/Footer";
import MotionProvider from "@/components/ui/MotionProvider";
import ChatBotLoader from "@/components/chat/ChatBotLoader";
import Intro from "@/components/intro/Intro";
import PageTransition from "@/components/intro/PageTransition";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: site.title, template: "%s — George Ngugi" },
  description: site.description,
  alternates: { canonical: "/" },
  applicationName: "George Ngugi Portfolio",
  authors: [{ name: site.name, url: SITE_URL }],
  keywords: ["George Ngugi", "Koshe.exe", "software engineer", "Flutter developer", "React Native developer", "Next.js", "UI/UX designer", "graphic designer", "Nairobi", "Kenya"],
  openGraph: { title: site.title, description: site.description, type: "website", url: SITE_URL, siteName: "George Ngugi", locale: "en_KE" },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0B0A" },
    { media: "(prefers-color-scheme: light)", color: "#F6F5F1" },
  ],
};

// Decides before first paint whether the intro plays: home page only, once per tab session,
// never under reduced motion. Add ?intro to the home URL to replay it.
const introScript = `try{var d=document.documentElement,q=location.search.indexOf("intro")>-1;if(location.pathname==="/"&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&(q||!sessionStorage.getItem("introSeen")))d.setAttribute("data-intro","1")}catch(e){}`;

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
        <script dangerouslySetInnerHTML={{ __html: themeScript + introScript }} />
      </head>
      <body className="bg-ink text-paper font-body">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-signal focus:text-ink focus:px-4 focus:py-2 focus:rounded"
        >
          Skip to content
        </a>
        <Intro />
        <PageTransition />
        <MotionProvider>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
          <ChatBotLoader />
        </MotionProvider>
      </body>
    </html>
  );
}

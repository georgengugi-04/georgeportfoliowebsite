import Link from "next/link";
import { Github, Linkedin, Mail, BookOpen, Instagram } from "lucide-react";
import { site, nav } from "@/data/site";
import CvLink from "@/components/ui/CvLink";
import ThemeToggle from "@/components/navigation/ThemeToggle";

export default function Footer() {
  const social = [
    { href: site.github, label: "GitHub", Icon: Github },
    site.linkedin ? { href: site.linkedin, label: "LinkedIn", Icon: Linkedin } : null,
    { href: site.instagram, label: "Instagram (Koshe.exe)", Icon: Instagram },
    { href: site.medium, label: "Medium", Icon: BookOpen },
    site.email ? { href: `mailto:${site.email}`, label: "Email", Icon: Mail } : null,
  ].filter(Boolean) as { href: string; label: string; Icon: typeof Github }[];

  return (
    <footer className="border-t border-line">
      <div className="container-page py-16">
        <p className="max-w-xl font-display text-2xl text-balance md:text-3xl">{site.tagline}</p>
        <div className="mt-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-mist">
              {site.name} <span className="text-line">·</span> <span className="text-signal">{site.alias}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 font-mono text-xs text-mist">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden /> {site.location} · Available for selected opportunities
            </div>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm text-mist" aria-label="Footer">
            {nav.slice(1).map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-paper">{l.label}</Link>
            ))}
            <Link href="/lab" className="transition-colors hover:text-paper">Lab</Link>
            <CvLink variant="text" label="CV" className="!text-mist hover:!text-paper" />
          </nav>
          <ul className="flex items-center gap-4">
            {social.map(({ href, label, Icon }) => (
              <li key={label}>
                <a href={href} target={href.startsWith("mailto") ? undefined : "_blank"} rel="noreferrer" aria-label={label} className="text-mist transition-colors hover:text-signal">
                  <Icon className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 font-mono text-xs text-mist">
          <span>© {new Date().getFullYear()} {site.name}. All rights reserved.</span>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}

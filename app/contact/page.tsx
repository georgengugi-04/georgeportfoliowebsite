import { Github, Linkedin, Mail, BookOpen, Instagram } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import CvLink from "@/components/ui/CvLink";
import ContactForm from "@/components/contact/ContactForm";
import { site, SITE_URL } from "@/data/site";

export default function ContactPage() {
  const links = [
    site.email ? { href: `mailto:${site.email}`, label: site.email, Icon: Mail } : null,
    { href: site.github, label: "GitHub — georgengugi-04", Icon: Github },
    site.linkedin ? { href: site.linkedin, label: "LinkedIn", Icon: Linkedin } : null,
    { href: SITE_URL, label: "Developer portfolio", Icon: BookOpen },
    { href: site.instagram, label: "Instagram — Koshe.exe (k.o.s.h.e)", Icon: Instagram },
    { href: site.medium, label: "Medium", Icon: BookOpen },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof Mail }[];

  return (
    <div className="pb-24 pt-36 md:pt-44">
      <div className="container-page grid gap-16 lg:grid-cols-2">
        <div>
          <Reveal>
            <span className="eyebrow">Contact</span>
            <h1 className="mt-4 font-display text-display-xl text-balance">Have an idea worth building?</h1>
            <p className="mt-6 max-w-md text-lg text-mist text-balance">
              For roles, collaborations, founders&apos; ideas and design commissions. I read everything.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="mt-12 flex flex-col gap-4">
              {links.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a href={href} target={href.startsWith("mailto") ? undefined : "_blank"} rel="noreferrer" className="inline-flex items-center gap-3 text-sm transition-colors hover:text-signal">
                    <Icon className="h-4 w-4" /> {label}
                  </a>
                </li>
              ))}
            </ul>
            <CvLink variant="ghost" className="mt-8" />
          </Reveal>
        </div>
        <Reveal delay={0.12}>
          <ContactForm fallbackEmail={site.email || undefined} />
        </Reveal>
      </div>
    </div>
  );
}

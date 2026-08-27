import Link from "next/link";
import { Github, Linkedin, Mail, BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-line mt-32">
      <div className="container-page py-16">
        <p className="font-display text-2xl md:text-3xl max-w-xl text-balance">
          Built with curiosity, code and too many browser tabs.
        </p>

        <div className="mt-12 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-mist">
              George Ngugi — Software Engineer
              <span className="text-line"> · </span>
              <span className="text-signal">Koshe.exe</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs font-mono text-mist">
              <span className="w-1.5 h-1.5 rounded-full bg-signal" />
              Available for selected opportunities
            </div>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-mono text-mist" aria-label="Footer">
            <Link href="/work" className="hover:text-paper transition-colors">Work</Link>
            <Link href="/about" className="hover:text-paper transition-colors">About</Link>
            <Link href="/skills" className="hover:text-paper transition-colors">Skills</Link>
            <Link href="/experience" className="hover:text-paper transition-colors">Experience</Link>
            <Link href="/contact" className="hover:text-paper transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-4">
            <a href="mailto:hello@georgengugi.dev" aria-label="Email" className="text-mist hover:text-signal transition-colors">
              <Mail className="w-4 h-4" />
            </a>
            <a href="https://github.com/georgengugi-04" aria-label="GitHub" className="text-mist hover:text-signal transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/public-profile/settings/?trk=d_flagship3_profile_self_view_public_profile&lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base%3BtMhBe%2FD0SEK%2FSaRThvyufA%3D%3D"
              aria-label="LinkedIn"
              className="text-mist hover:text-signal transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="https://medium.com/@georgengugi612" aria-label="Medium" className="text-mist hover:text-signal transition-colors">
              <BookOpen className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-line text-xs font-mono text-mist">
          © {new Date().getFullYear()} George Ngugi. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

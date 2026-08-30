"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Github, Linkedin, Mail, BookOpen } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const projectTypes = ["Web platform", "Mobile app", "UI/UX design", "Something else"];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [projectType, setProjectType] = useState(projectTypes[0]);

  return (
    <div className="pt-40 pb-24">
      <div className="container-page grid lg:grid-cols-2 gap-16">
        <div>
          <Reveal>
            <span className="eyebrow">Contact</span>
            <h1 className="mt-4 font-display text-display-lg text-balance">
              Have a problem worth building?
            </h1>
            <p className="mt-4 font-display text-2xl text-mist">Let&apos;s talk.</p>
          </Reveal>

          <Reveal delay={0.1} className="mt-12 flex flex-col gap-4">
            <a href="mailto:hello@georgengugi.dev" className="flex items-center gap-3 text-sm hover:text-signal transition-colors">
              <Mail className="w-4 h-4" /> hello@georgengugi.dev
            </a>
            <a href="https://github.com/georgengugi-04" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm hover:text-signal transition-colors">
              <Github className="w-4 h-4" /> GitHub
            </a>
            <a
              href="https://www.linkedin.com/public-profile/settings/?trk=d_flagship3_profile_self_view_public_profile&lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base%3BtMhBe%2FD0SEK%2FSaRThvyufA%3D%3D"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-sm hover:text-signal transition-colors"
            >
              <Linkedin className="w-4 h-4" /> LinkedIn
            </a>
            <a href="https://medium.com/@georgengugi612" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm hover:text-signal transition-colors">
              <BookOpen className="w-4 h-4" /> Medium
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-signal p-8"
            >
              <div className="font-display text-2xl text-signal">Message sent.</div>
              <p className="mt-3 text-sm text-mist">
                Thanks for reaching out — I&apos;ll get back to you soon.
              </p>
            </motion.div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="flex flex-col gap-6"
            >
              <div>
                <label htmlFor="name" className="eyebrow">Name</label>
                <input
                  id="name"
                  required
                  className="mt-2 w-full bg-transparent border-b border-line py-3 outline-none focus-visible:border-signal transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="eyebrow">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  className="mt-2 w-full bg-transparent border-b border-line py-3 outline-none focus-visible:border-signal transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <span className="eyebrow">Project type</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {projectTypes.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setProjectType(t)}
                      className={`rounded-full border px-4 py-2 text-sm font-mono transition-colors ${
                        projectType === t
                          ? "border-signal text-signal"
                          : "border-line text-mist hover:text-paper"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="message" className="eyebrow">Message</label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  className="mt-2 w-full bg-transparent border-b border-line py-3 outline-none resize-none focus-visible:border-signal transition-colors"
                  placeholder="What are you building?"
                />
              </div>
              <button
                type="submit"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-signal text-ink px-6 py-3.5 font-mono text-sm font-medium hover:bg-paper transition-colors self-start"
              >
                Start a conversation <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </div>
  );
}

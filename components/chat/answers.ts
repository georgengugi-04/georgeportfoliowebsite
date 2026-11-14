import { orderedProjects, projects, statusLabel, type Project } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { site, linkedinIsPlaceholder } from "@/data/site";

export type ChatLink = { label: string; href: string; external?: boolean };
export type BotReply = { text: string; links?: ChatLink[] };

// A scripted assistant: every answer is built from the site's own data files, so it can only say
// what the portfolio already says. No model, no network calls, nothing invented.

export const suggestions = ["What do you build?", "Show me projects", "Tech stack", "What's in progress?", "Download CV", "How do I contact you?"];

const esc = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Match at the start of a word, so "art" hits "artwork" but not "start".
const has = (q: string, words: string[]) => words.some((w) => new RegExp(`\\b${esc(w)}`, "u").test(q));

const projectLinks = (p: Project): ChatLink[] => {
  const l: ChatLink[] = [{ label: `${p.title} case study`, href: `/work/${p.slug}` }];
  if (p.liveUrl) l.push({ label: "Live site", href: p.liveUrl, external: true });
  if (p.githubUrl) l.push({ label: "Source code", href: p.githubUrl, external: true });
  return l;
};

const describe = (p: Project): BotReply => ({
  text: `${p.title} (${statusLabel[p.status]}): ${p.description} Role: ${p.role}. ${
    p.technologies.length ? `Built with ${p.technologies.join(", ")}.` : "The tech stack is still being confirmed on the site."
  }`,
  links: projectLinks(p),
});

function findProject(q: string): Project | undefined {
  const candidates = projects
    .map((p) => ({ p, names: [p.title.toLowerCase(), p.slug.replace(/-/g, " ")] }))
    .sort((a, b) => b.names[0].length - a.names[0].length); // "eartgalla mobile" before "eartgalla"
  return candidates.find(({ names }) => names.some((n) => q.includes(n)))?.p;
}

export function answer(input: string): BotReply {
  const q = input.toLowerCase().replace(/[^\p{L}\p{N}\s.+#-]/gu, " ").replace(/\s+/g, " ").trim();
  if (!q) return { text: "Type a question, or tap one of the suggestions." };

  const project = findProject(q);
  if (project) return describe(project);

  if (has(q, ["are you ai", "are you a bot", "are you real", "chatgpt", "who are you", "what are you", "robot", "human"]))
    return { text: "I'm a small scripted assistant living on George's portfolio, not an AI model and not a person. I only know what's on this site, so for anything else please use the contact page." , links: [{ label: "Contact George", href: "/contact" }] };

  if (has(q, ["hello", "hi ", "hey", "hola", "sasa", "good morning", "good evening"]) || q === "hi")
    return { text: `Hi, I'm the Koshe.exe bot. Ask me about George's projects, skills, CV or how to reach him.` };

  if (has(q, ["cv", "resume", "résumé", "curriculum"]))
    return { text: "Here's George's CV as a 2-page PDF.", links: [{ label: "Download CV (PDF)", href: site.cv }] };

  if (has(q, ["contact", "hire", "reach", "email", "mail", "message", "work with", "collaborat", "available", "freelance", "linkedin"])) {
    const links: ChatLink[] = [{ label: "Contact form", href: "/contact" }];
    if (site.email) links.push({ label: site.email, href: `mailto:${site.email}`, external: true });
    if (site.linkedin && !linkedinIsPlaceholder) links.push({ label: "LinkedIn", href: site.linkedin, external: true });
    links.push({ label: "GitHub", href: site.github, external: true });
    return { text: "The quickest way is the contact page. GitHub and other profiles are below too.", links };
  }

  if (has(q, ["progress", "building", "currently", "right now", "working on", "latest", "new"])) {
    const wip = orderedProjects.filter((p) => p.status === "in-progress");
    return {
      text: wip.length ? `Currently in progress: ${wip.map((p) => p.title).join(" and ")}.` : "Nothing is marked in progress right now.",
      links: wip.map((p) => ({ label: p.title, href: `/work/${p.slug}` })),
    };
  }

  if (has(q, ["project", "work", "portfolio", "built", "made", "showcase", "case stud"])) {
    return {
      text: `Featured work: ${orderedProjects.map((p) => `${p.title} (${statusLabel[p.status]})`).join(", ")}.`,
      links: [{ label: "See all work", href: "/work" }],
    };
  }

  if (has(q, ["skill", "stack", "tech", "tool", "language", "framework", "react", "flutter", "next", "node", "typescript", "firebase", "mobile dev", "know"])) {
    return {
      text: skillGroups.map((g) => `${g.layer}: ${g.skills.map((s) => s.name).join(", ")}`).join(". ") + ".",
      links: [{ label: "Engineering page", href: "/engineering" }],
    };
  }

  if (has(q, ["design", "art", "creative", "illustrat", "poster", "flyer", "graphic", "painting"]))
    return { text: "George also works as a creative designer: posters, illustrations and artwork are in the Design section.", links: [{ label: "Creative Studio", href: "/design" }] };

  if (has(q, ["lab", "experiment", "three", "webgl", "3d", "playground"]))
    return { text: "The Lab has small experiments where engineering and art trade ideas.", links: [{ label: "Open the Lab", href: "/lab" }] };

  if (has(q, ["github", "code", "source", "repo", "git"]))
    return { text: "Source code lives on GitHub.", links: [{ label: "GitHub profile", href: site.github, external: true }] };

  if (has(q, ["about", "george", "koshe", "who", "background", "study", "student", "university", "kca", "education", "where", "based", "nairobi", "kenya", "experience"]))
    return { text: `${site.description} The About page has the full timeline.`, links: [{ label: "About George", href: "/about" }] };

  if (has(q, ["what do you build", "what do you do", "build", "do you do", "services", "offer", "help"]))
    return {
      text: "George is a software engineer, mobile developer and creative designer: web products in Next.js, mobile apps in Flutter and React Native, and visual design. Ask for projects or the tech stack.",
      links: [{ label: "See the work", href: "/work" }],
    };

  if (has(q, ["thank", "thanks", "asante", "great", "cool", "nice", "awesome"])) return { text: "You're welcome! Ask me anything else about the work." };
  if (has(q, ["bye", "goodbye", "later", "cya"])) return { text: "Bye! The contact page is open whenever you're ready." , links: [{ label: "Contact George", href: "/contact" }] };

  return {
    text: "I don't have an answer to that. I only know what's on this site: projects, tech stack, CV and contact. For anything else, please reach out directly.",
    links: [{ label: "Contact George", href: "/contact" }],
  };
}

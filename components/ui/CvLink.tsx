import { Download } from "lucide-react";
import clsx from "clsx";
import { site } from "@/data/site";

// A plain <a download> so it works without JavaScript and is announced as a file download.
export default function CvLink({ variant = "ghost", className, label = "Download CV" }: { variant?: "primary" | "ghost" | "text" | "pop"; className?: string; label?: string }) {
  return (
    <a
      href={site.cv}
      download="George-Ngugi-CV.pdf"
      className={clsx(variant === "primary" && "btn-primary", variant === "ghost" && "btn-ghost", variant === "pop" && "btn-pop", variant === "text" && "inline-flex items-center gap-2 font-mono text-sm text-mist transition-colors hover:text-signal", className)}
    >
      <Download className="cv-icon h-4 w-4" aria-hidden />
      {label}
      <span className="sr-only"> (PDF, 2 pages)</span>
    </a>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";

const NAMES: Record<string, string> = { "": "Home", work: "Work", about: "About", lab: "Lab", contact: "Contact" };

function labelFor(path: string) {
  const parts = path.split("/").filter(Boolean);
  if (parts.length > 1) return parts[parts.length - 1].replace(/-/g, " ");
  return NAMES[parts[0] ?? ""] ?? (parts[0] ?? "").replace(/-/g, " ");
}

/** Short curtain wipe when moving between pages. The first load is handled by <Intro />. */
export default function PageTransition() {
  const pathname = usePathname();
  const prev = useRef(pathname);
  const [run, setRun] = useState<{ id: number; label: string } | null>(null);

  useLayoutEffect(() => {
    if (prev.current === pathname) return;
    prev.current = pathname;
    if (document.documentElement.getAttribute("data-intro") === "1") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = Date.now();
    setRun({ id, label: labelFor(pathname) });
    const t = setTimeout(() => setRun((r) => (r && r.id === id ? null : r)), 1000);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!run) return null;
  return (
    <div key={run.id} className="page-tx" aria-hidden="true">
      <span className="page-tx-label">{run.label}<i /></span>
    </div>
  );
}

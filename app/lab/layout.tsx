import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "Small experiments where engineering and art trade ideas: a WebGL root, a raking-light painting study and a swipe gallery.",
  alternates: { canonical: "/lab" },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return children;
}

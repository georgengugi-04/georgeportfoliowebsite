import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "Small experiments where engineering and art trade ideas: WebGL and Canvas pieces, a piano and beat maker, and engineering demos for QR traceability, race conditions, custody chains and farm weather.",
  alternates: { canonical: "/lab" },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return children;
}

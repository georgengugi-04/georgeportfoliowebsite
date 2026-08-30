import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "A small WebGL experiment: a procedurally grown root, drifting pollen, and a butterfly that lands on its own terms.",
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return children;
}

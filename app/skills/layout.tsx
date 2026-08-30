import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skills",
  description: "An interactive map of the layers George works across — from interface to infrastructure.",
};

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

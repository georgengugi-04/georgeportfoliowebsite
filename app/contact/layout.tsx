import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a conversation about a web, mobile or UI/UX project.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}

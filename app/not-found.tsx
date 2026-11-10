import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
  alternates: {},
};

export default function NotFound() {
  return (
    <div className="container-page pb-32 pt-48">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 font-display text-display-xl text-balance">Nothing built here yet.</h1>
      <p className="mt-4 text-mist">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/" className="btn-primary">Back home</Link>
        <Link href="/work" className="btn-ghost">See the work</Link>
      </div>
    </div>
  );
}

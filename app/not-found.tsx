import Link from "next/link";

export default function NotFound() {
  return (
    <div className="pt-48 pb-32 container-page text-center">
      <p className="eyebrow justify-center flex">404</p>
      <h1 className="mt-4 font-display text-display-lg">Nothing built here yet.</h1>
      <p className="mt-4 text-mist">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link
        href="/"
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-signal text-ink px-6 py-3 font-mono text-sm font-medium hover:bg-paper transition-colors"
      >
        Back home
      </Link>
    </div>
  );
}

import Reveal from "@/components/ui/Reveal";

const layers = [
  { name: "UI", note: "Component systems, motion, design tokens" },
  { name: "Application logic", note: "Role-based flows, custody-chain state" },
  { name: "API / integration", note: "Connecting product surfaces to shared data" },
  { name: "Authentication", note: "Firebase Auth, Google Sign-In, role gating" },
  { name: "Database", note: "Firestore data modelling" },
  { name: "Storage", note: "Firebase Storage for media capture" },
  { name: "Deployment", note: "Vercel, Cloudflare Workers" },
];

export default function EngineeringCredibility() {
  return (
    <section className="border-t border-line py-24 md:py-32">
      <div className="container-page grid md:grid-cols-[1fr_1.4fr] gap-12 md:gap-20">
        <Reveal>
          <span className="eyebrow">03 — How it&apos;s built</span>
          <h2 className="mt-4 font-display text-display-md text-balance">
            More than the interface.
          </h2>
          <p className="mt-6 text-mist max-w-md text-balance">
            Every screen sits on top of a stack. Understanding that stack —
            not just styling the top of it — is what separates a mockup from
            a product.
          </p>
        </Reveal>

        <div className="flex flex-col">
          {layers.map((l, i) => (
            <Reveal key={l.name} delay={i * 0.05}>
              <div className="flex items-center gap-6 py-5 border-t border-line last:border-b">
                <span className="font-mono text-xs text-signal w-6">{`0${i + 1}`}</span>
                <div className="flex-1">
                  <div className="font-display text-lg">{l.name}</div>
                  <div className="text-sm text-mist mt-0.5">{l.note}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

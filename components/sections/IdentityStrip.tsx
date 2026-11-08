const words = ["DESIGN", "ENGINEERING", "MOBILE", "CREATIVITY", "INNOVATION", "PRODUCT THINKING"];
const track = [...words, ...words, ...words, ...words];

export default function IdentityStrip() {
  return (
    <section aria-label="Design, Engineering, Mobile, Creativity, Innovation, Product thinking" className="marquee-row overflow-hidden border-y border-line py-6">
      <div className="marquee-track flex w-max items-center" aria-hidden>
        {track.map((w, i) => (
          <span key={i} className="flex items-center">
            <span className={`px-6 font-display text-4xl tracking-tight md:text-6xl ${i % 2 ? "outline-text" : "text-paper"}`}>{w}</span>
            <span className="text-signal">✦</span>
          </span>
        ))}
      </div>
    </section>
  );
}

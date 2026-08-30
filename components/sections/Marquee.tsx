import Image from "next/image";

const photos = [
  { src: "/projects/beeftrace/hero.jpg", label: "BeefTrace" },
  { src: "/projects/greentrack/hero.jpg", label: "GreenTrack" },
  { src: "/projects/eartgalla/hero.jpg", label: "EartGalla" },
  { src: "/projects/eartgalla/gallery/artwork-moon.jpg", label: "EartGalla — original artwork" },
  { src: "/projects/beeftrace/journey.jpg", label: "BeefTrace" },
  { src: "/projects/greentrack/crops.jpg", label: "GreenTrack" },
  { src: "/projects/eartgalla/gallery/artwork-portrait.jpg", label: "EartGalla — original artwork" },
  { src: "/projects/eartgalla/cart.jpg", label: "EartGalla" },
  { src: "/projects/greentrack/journal.jpg", label: "GreenTrack" },
  { src: "/projects/eartgalla/gallery/artwork-beach.jpg", label: "EartGalla — original artwork" },
  { src: "/projects/beeftrace/detail.jpg", label: "BeefTrace" },
  { src: "/projects/eartgalla/gallery/cards/card-2.jpg", label: "EartGalla — illustrated card series" },
];

// Duplicated once so the CSS translate(-50%) loop is seamless
const track = [...photos, ...photos];

export default function Marquee() {
  return (
    <section
      aria-label="A scrolling selection of screenshots and artwork from George's work"
      className="marquee-row border-t border-line py-8 overflow-hidden"
    >
      <div className="flex w-max marquee-track">
        {track.map((p, i) => (
          <div
            key={`${p.src}-${i}`}
            className="relative w-[220px] h-[150px] md:w-[280px] md:h-[190px] mx-3 shrink-0 rounded-xl overflow-hidden border border-line bg-graphite"
          >
            <Image
              src={p.src}
              alt={p.label}
              fill
              sizes="280px"
              className="object-cover object-top"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

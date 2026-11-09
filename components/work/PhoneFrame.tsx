import Image from "next/image";
import clsx from "clsx";

export default function PhoneFrame({
  src,
  label,
  className,
  priority,
  sizes = "(max-width: 768px) 60vw, 240px",
  appName = "GreenTrack",
  aspect,
}: {
  src: string;
  label: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  appName?: string;
  aspect?: string; // CSS aspect-ratio, e.g. "9/20"; defaults to 13/25
}) {
  return (
    <figure className={clsx("w-full", className)}>
      <div style={aspect ? { aspectRatio: aspect } : undefined} className={clsx("relative overflow-hidden rounded-[1.75rem] border border-line bg-graphite p-[5px] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]", !aspect && "aspect-[13/25]")}>
        <div className="relative h-full w-full overflow-hidden rounded-[1.4rem]">
          <Image src={src} alt={`${appName} app screen: ${label}`} fill sizes={sizes} priority={priority} className="object-cover object-top" />
        </div>
      </div>
      <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-wide text-mist">{label}</figcaption>
    </figure>
  );
}

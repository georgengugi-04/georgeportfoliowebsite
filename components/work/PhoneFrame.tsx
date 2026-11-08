import Image from "next/image";
import clsx from "clsx";

export default function PhoneFrame({
  src,
  label,
  className,
  priority,
  sizes = "(max-width: 768px) 60vw, 240px",
}: {
  src: string;
  label: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <figure className={clsx("w-full", className)}>
      <div className="relative aspect-[13/25] overflow-hidden rounded-[1.75rem] border border-line bg-graphite p-[5px] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]">
        <div className="relative h-full w-full overflow-hidden rounded-[1.4rem]">
          <Image src={src} alt={`GreenTrack app screen: ${label}`} fill sizes={sizes} priority={priority} className="object-cover object-top" />
        </div>
      </div>
      <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-wide text-mist">{label}</figcaption>
    </figure>
  );
}

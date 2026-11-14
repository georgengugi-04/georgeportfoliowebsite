import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { projects, featuredOrder } from "@/data/projects";
import Reveal from "@/components/ui/Reveal";
import ProjectTile from "@/components/work/ProjectTile";

const layout: Record<string, { span: string; aspect?: string; phones?: boolean }> = {
  beeftrace: { span: "lg:col-span-7", aspect: "aspect-[16/10]" },
  arkyls: { span: "lg:col-span-5", aspect: "aspect-[4/3]" },
  eartgalla: { span: "lg:col-span-6", aspect: "aspect-[16/10]" },
  greentrack: { span: "lg:col-span-6", aspect: "aspect-[16/10]", phones: true },
  pamoja: { span: "lg:col-span-5", aspect: "aspect-[4/3]" },
  "eartgalla-mobile": { span: "lg:col-span-7", aspect: "aspect-[16/10]", phones: true },
};

export default function FeaturedWork() {
  const list = featuredOrder.map((s) => projects.find((p) => p.slug === s)).filter((p): p is NonNullable<typeof p> => !!p && p.featured !== false);
  return (
    <section className="py-24 md:py-32" id="work">
      <div className="container-page">
        <Reveal className="mb-14 flex items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Featured work</span>
            <h2 className="mt-4 max-w-2xl font-display text-display-lg text-balance">Real products, honestly labelled.</h2>
          </div>
          <Link href="/work" className="hidden items-center gap-1.5 font-mono text-sm text-mist transition-colors hover:text-signal md:inline-flex">
            All work <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <div className="grid gap-x-8 gap-y-20 lg:grid-cols-12">
          {list.map((p, i) => {
            const l = layout[p.slug] ?? { span: "lg:col-span-6", aspect: "aspect-[16/10]" };
            return <ProjectTile key={p.slug} project={p} index={i} className={l.span} aspect={l.aspect} showPhones={l.phones} priority={i === 0} />;
          })}
        </div>

        <div className="mt-14">
          <Link href="/work" className="btn-ghost">
            See every project <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

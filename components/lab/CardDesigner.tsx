"use client";

import { useId, useMemo, useRef, useState } from "react";

type Suit = "spades" | "hearts" | "diamonds" | "clubs";
const SUITS: { id: Suit; label: string; red: boolean }[] = [
  { id: "spades", label: "Spades", red: false }, { id: "hearts", label: "Hearts", red: true },
  { id: "diamonds", label: "Diamonds", red: true }, { id: "clubs", label: "Clubs", red: false },
];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const PALETTES: Record<string, { bg: string; ink: string; red: string; frame: string }> = {
  "Clay & sand": { bg: "#EFE3CF", ink: "#2E2A25", red: "#B0432A", frame: "#8C6A3F" },
  "Savanna": { bg: "#F2E8C9", ink: "#3A3420", red: "#B8641B", frame: "#6B7A3A" },
  "Forest": { bg: "#E8EBDD", ink: "#1F3A2B", red: "#8E3B2F", frame: "#4C6B4A" },
  "Night & lime": { bg: "#0A0B0A", ink: "#F6F5F1", red: "#B4FF39", frame: "#B4FF39" },
};
const PATTERNS = ["None", "Dots", "Diagonals", "Grid"] as const;

// Suit shapes drawn on a 100×100 grid so the SVG needs no fonts and exports cleanly.
function SuitShape({ suit, x, y, size, fill, flip }: { suit: Suit; x: number; y: number; size: number; fill: string; flip?: boolean }) {
  const t = `translate(${x - size / 2} ${y - size / 2}) scale(${size / 100})${flip ? " rotate(180 50 50)" : ""}`;
  return (
    <g transform={t} fill={fill}>
      {suit === "hearts" && <path d="M50 90C18 64 6 46 6 30 6 16 17 6 30 6 39 6 46 11 50 19 54 11 61 6 70 6 83 6 94 16 94 30 94 46 82 64 50 90Z" />}
      {suit === "diamonds" && <path d="M50 4 88 50 50 96 12 50Z" />}
      {suit === "spades" && <path d="M50 4C50 4 8 38 8 62 8 76 19 84 31 84 39 84 45 80 48 74 47 84 43 92 35 96H65C57 92 53 84 52 74 55 80 61 84 69 84 81 84 92 76 92 62 92 38 50 4 50 4Z" />}
      {suit === "clubs" && (<><circle cx="50" cy="28" r="21" /><circle cx="27" cy="62" r="21" /><circle cx="73" cy="62" r="21" /><path d="M50 50 40 96H60Z" /></>)}
    </g>
  );
}

const W = 300, H = 420;
const PIPS: Record<string, [number, number][]> = {
  "2": [[.5, 0], [.5, 1]], "3": [[.5, 0], [.5, .5], [.5, 1]], "4": [[0, 0], [1, 0], [0, 1], [1, 1]], "5": [[0, 0], [1, 0], [.5, .5], [0, 1], [1, 1]],
  "6": [[0, 0], [1, 0], [0, .5], [1, .5], [0, 1], [1, 1]], "7": [[0, 0], [1, 0], [0, .5], [1, .5], [.5, .25], [0, 1], [1, 1]],
  "8": [[0, 0], [1, 0], [0, .5], [1, .5], [.5, .25], [.5, .75], [0, 1], [1, 1]],
  "9": [[0, 0], [1, 0], [0, .33], [1, .33], [.5, .5], [0, .67], [1, .67], [0, 1], [1, 1]],
  "10": [[0, 0], [1, 0], [0, .33], [1, .33], [.5, .17], [.5, .83], [0, .67], [1, .67], [0, 1], [1, 1]],
};

export default function CardDesigner() {
  const [rank, setRank] = useState("Q");
  const [suit, setSuit] = useState<Suit>("hearts");
  const [pal, setPal] = useState("Clay & sand");
  const [pattern, setPattern] = useState<(typeof PATTERNS)[number]>("Dots");
  const [radius, setRadius] = useState(22);
  const [border, setBorder] = useState(true);
  const [caption, setCaption] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  const pid = useId().replace(/:/g, "");

  const P = PALETTES[pal], isRed = SUITS.find((s) => s.id === suit)!.red, colour = isRed ? P.red : P.ink;
  const label = `${rank} of ${suit}`;

  const centre = useMemo(() => {
    const x0 = 92, x1 = 208, y0 = 96, y1 = 324;
    if (rank === "A") return <SuitShape suit={suit} x={W / 2} y={H / 2} size={150} fill={colour} />;
    if (["J", "Q", "K"].includes(rank)) return (
      <g>
        <rect x="70" y="92" width="160" height="236" rx="10" fill="none" stroke={P.frame} strokeWidth="2.5" />
        <text x={W / 2} y={H / 2 + 38} textAnchor="middle" fontSize="120" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fill={colour}>{rank}</text>
        <SuitShape suit={suit} x={W / 2} y={128} size={34} fill={colour} />
        <SuitShape suit={suit} x={W / 2} y={292} size={34} fill={colour} flip />
      </g>
    );
    return (
      <g>{PIPS[rank].map(([px, py], i) => (
        <SuitShape key={i} suit={suit} x={x0 + px * (x1 - x0)} y={y0 + py * (y1 - y0)} size={rank === "10" || rank === "9" ? 38 : 44} fill={colour} flip={py > 0.5} />
      ))}</g>
    );
  }, [rank, suit, colour, P.frame]);

  const download = (kind: "svg" | "png") => {
    const el = svgRef.current; if (!el) return;
    const xml = new XMLSerializer().serializeToString(el);
    const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const save = (url: string, name: string, revoke = true) => { const a = document.createElement("a"); a.href = url; a.download = name; a.click(); if (revoke) setTimeout(() => URL.revokeObjectURL(url), 1000); };
    const base = `koshe-card-${rank}-${suit}`;
    if (kind === "svg") { save(URL.createObjectURL(blob), `${base}.svg`); return; }
    const u = URL.createObjectURL(blob), im = new Image();
    im.onload = () => {
      const c = document.createElement("canvas"); c.width = W * 3; c.height = H * 3;
      c.getContext("2d")!.drawImage(im, 0, 0, c.width, c.height);
      URL.revokeObjectURL(u);
      c.toBlob((b) => b && save(URL.createObjectURL(b), `${base}.png`), "image/png");
    };
    im.src = u;
  };

  const chip = (on: boolean) => `rounded-full border px-4 py-2 text-sm transition-colors ${on ? "border-signal bg-signal text-ink" : "border-line text-mist hover:border-signal hover:text-signal"}`;

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,320px)_1fr]">
      <div className="mx-auto w-full max-w-[320px]">
        <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Playing card: ${label}${caption ? `, captioned ${caption}` : ""}`} className="w-full drop-shadow-xl">
          <defs>
            <pattern id={`${pid}d`} width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="1.4" fill={P.frame} opacity=".25" /></pattern>
            <pattern id={`${pid}x`} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0H12" stroke={P.frame} strokeWidth="1" opacity=".22" /></pattern>
            <pattern id={`${pid}g`} width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" fill="none" stroke={P.frame} strokeWidth=".8" opacity=".25" /></pattern>
          </defs>
          <rect width={W} height={H} rx={radius} fill={P.bg} />
          {pattern !== "None" && <rect width={W} height={H} rx={radius} fill={`url(#${pid}${pattern === "Dots" ? "d" : pattern === "Diagonals" ? "x" : "g"})`} />}
          {border && <rect x="9" y="9" width={W - 18} height={H - 18} rx={Math.max(0, radius - 8)} fill="none" stroke={P.frame} strokeWidth="2" />}
          {[false, true].map((flip) => (
            <g key={String(flip)} transform={flip ? `rotate(180 ${W / 2} ${H / 2})` : undefined}>
              <text x="34" y="62" textAnchor="middle" fontSize={rank === "10" ? 36 : 44} fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fill={colour}>{rank}</text>
              <SuitShape suit={suit} x={34} y={84} size={22} fill={colour} />
            </g>
          ))}
          {centre}
          {caption && <text x={W / 2} y={H - 22} textAnchor="middle" fontSize="12" letterSpacing="3" fontFamily="Georgia, 'Times New Roman', serif" fill={P.frame}>{caption.toUpperCase()}</text>}
        </svg>
      </div>

      <div className="space-y-6">
        <div>
          <p id="rk" className="font-mono text-xs uppercase tracking-wide text-mist">Rank</p>
          <div role="radiogroup" aria-labelledby="rk" className="mt-3 flex flex-wrap gap-2">
            {RANKS.map((r) => <button key={r} role="radio" aria-checked={rank === r} onClick={() => setRank(r)} className={chip(rank === r) + " min-w-[44px]"}>{r}</button>)}
          </div>
        </div>
        <div>
          <p id="st" className="font-mono text-xs uppercase tracking-wide text-mist">Suit</p>
          <div role="radiogroup" aria-labelledby="st" className="mt-3 flex flex-wrap gap-2">
            {SUITS.map((s) => <button key={s.id} role="radio" aria-checked={suit === s.id} onClick={() => setSuit(s.id)} className={chip(suit === s.id)}>{s.label}</button>)}
          </div>
        </div>
        <div>
          <p id="pl" className="font-mono text-xs uppercase tracking-wide text-mist">Palette</p>
          <div role="radiogroup" aria-labelledby="pl" className="mt-3 flex flex-wrap gap-2">
            {Object.keys(PALETTES).map((p) => <button key={p} role="radio" aria-checked={pal === p} onClick={() => setPal(p)} className={chip(pal === p)}>{p}</button>)}
          </div>
        </div>
        <div>
          <p id="pt" className="font-mono text-xs uppercase tracking-wide text-mist">Background pattern</p>
          <div role="radiogroup" aria-labelledby="pt" className="mt-3 flex flex-wrap gap-2">
            {PATTERNS.map((p) => <button key={p} role="radio" aria-checked={pattern === p} onClick={() => setPattern(p)} className={chip(pattern === p)}>{p}</button>)}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="rad" className="flex justify-between font-mono text-xs uppercase tracking-wide text-mist"><span>Corner radius</span><span>{radius}</span></label>
            <input id="rad" type="range" min={0} max={40} value={radius} onChange={(e) => setRadius(+e.target.value)} className="mt-3 w-full accent-[#B4FF39]" />
          </div>
          <div>
            <label htmlFor="cap" className="block font-mono text-xs uppercase tracking-wide text-mist">Caption (optional)</label>
            <input id="cap" value={caption} maxLength={24} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. NAIROBI" className="mt-2 w-full rounded-sm border border-line bg-transparent px-3 py-2 text-sm text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal" />
          </div>
        </div>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={border} onChange={(e) => setBorder(e.target.checked)} className="h-4 w-4 accent-[#B4FF39]" /> Inner border</label>
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={() => download("png")} className="rounded-full border border-signal bg-signal px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-ink">Download PNG</button>
          <button onClick={() => download("svg")} className="rounded-full border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-mist hover:border-signal hover:text-signal">Download SVG</button>
        </div>
      </div>
    </div>
  );
}

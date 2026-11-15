import * as THREE from "three";
import { makeNoise, makeRng } from "./noise";

const mk = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};
const tex = (c: HTMLCanvasElement, srgb: boolean, rep?: [number, number]) => {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (rep) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rep[0], rep[1]);
  }
  t.anisotropy = 4;
  return t;
};
const sstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Furrowed bark: vertical fissures, plates, lichen patches. Tileable. */
export function makeBark(size: number, seed: number) {
  const noise = makeNoise(seed);
  const cc = mk(size, size);
  const bc = mk(size, size);
  const cg = cc.getContext("2d")!;
  const bg = bc.getContext("2d")!;
  const cd = cg.createImageData(size, size);
  const bd = bg.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const warp = (noise.fbm(u * 6, v * 3, 6, 3, 3) - 0.5) * 0.14;
      const ridge = noise.fbm((u + warp) * 12, v * 3, 12, 3, 4);
      const f = Math.abs(ridge - 0.5) * 2;
      const plate = sstep(0.02, 0.4, f);
      const fine = noise.fbm(u * 48, v * 24, 48, 24, 3);
      const h = plate * 0.72 + fine * 0.28;
      const lich = noise.fbm(u * 5 + 3, v * 5, 5, 5, 3);
      let r = mix(44, 128, h);
      let g = mix(34, 108, h);
      let b = mix(28, 90, h);
      const lk = sstep(0.6, 0.72, lich) * 0.4 * plate;
      r = mix(r, 118, lk);
      g = mix(g, 128, lk);
      b = mix(b, 98, lk);
      const k = (y * size + x) * 4;
      cd.data[k] = r;
      cd.data[k + 1] = g;
      cd.data[k + 2] = b;
      cd.data[k + 3] = 255;
      const gray = h * 255;
      bd.data[k] = bd.data[k + 1] = bd.data[k + 2] = gray;
      bd.data[k + 3] = 255;
    }
  }
  cg.putImageData(cd, 0, 0);
  bg.putImageData(bd, 0, 0);
  return { map: tex(cc, true, [1, 1]), bump: tex(bc, false, [1, 1]) };
}

/** Forest-floor soil with grain, organic specks and pebbles. Tileable. */
export function makeSoil(size: number, seed: number) {
  const noise = makeNoise(seed);
  const rnd = makeRng(seed + 7);
  const cc = mk(size, size);
  const bc = mk(size, size);
  const cg = cc.getContext("2d")!;
  const bg = bc.getContext("2d")!;
  const cd = cg.createImageData(size, size);
  const bd = bg.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const h = noise.fbm(u * 10, v * 10, 10, 10, 4);
      const grain = noise.fbm(u * 64, v * 64, 64, 64, 2);
      const k = (y * size + x) * 4;
      let m = 0.82 + 0.34 * grain;
      if (grain < 0.22) m *= 0.7;
      cd.data[k] = mix(54, 118, h) * m;
      cd.data[k + 1] = mix(40, 92, h) * m;
      cd.data[k + 2] = mix(28, 64, h) * m;
      cd.data[k + 3] = 255;
      const gray = (h * 0.6 + grain * 0.4) * 255;
      bd.data[k] = bd.data[k + 1] = bd.data[k + 2] = gray;
      bd.data[k + 3] = 255;
    }
  }
  cg.putImageData(cd, 0, 0);
  bg.putImageData(bd, 0, 0);
  for (let i = 0; i < size * 0.45; i++) {
    const x = rnd() * size;
    const y = rnd() * size;
    const r = 0.8 + rnd() * 2.2;
    const l = 90 + rnd() * 70;
    cg.fillStyle = `rgba(${l},${l * 0.92},${l * 0.8},0.55)`;
    cg.beginPath();
    cg.arc(x, y, r, 0, Math.PI * 2);
    cg.fill();
    bg.fillStyle = "rgba(235,235,235,0.7)";
    bg.beginPath();
    bg.arc(x, y, r, 0, Math.PI * 2);
    bg.fill();
  }
  return { map: tex(cc, true, [1, 1]), bump: tex(bc, false, [1, 1]) };
}

/** Soil strata for the root cross-section. Tropical red-clay profile (illustrative). */
export function makeStrata(w: number, h: number, seed: number) {
  const noise = makeNoise(seed);
  const rnd = makeRng(seed + 3);
  const c = mk(w, h);
  const g = c.getContext("2d")!;
  const d = g.createImageData(w, h);
  const layers: [number, [number, number, number]][] = [
    [0.1, [34, 26, 19]],
    [0.34, [82, 57, 38]],
    [0.68, [132, 72, 46]],
    [1.01, [158, 116, 84]],
  ];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const v = y / h;
      const wob = (noise.fbm(u * 4, v * 3, 4, 3, 3) - 0.5) * 0.08;
      const dv = v + wob;
      let li = 0;
      while (li < layers.length - 1 && dv > layers[li][0]) li++;
      const base = layers[li][1];
      const n = 0.88 + 0.24 * noise.fbm(u * 40, v * 30, 40, 30, 3);
      const k = (y * w + x) * 4;
      d.data[k] = base[0] * n;
      d.data[k + 1] = base[1] * n;
      d.data[k + 2] = base[2] * n;
      d.data[k + 3] = 255;
    }
  }
  g.putImageData(d, 0, 0);
  for (let i = 0; i < 120; i++) {
    const l = 80 + rnd() * 90;
    g.fillStyle = `rgba(${l},${l * 0.9},${l * 0.78},0.6)`;
    g.beginPath();
    g.arc(rnd() * w, rnd() * h, 0.7 + rnd() * 1.8, 0, Math.PI * 2);
    g.fill();
  }
  const t = tex(c, true);
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

/** Soft cushion-moss grain. */
export function makeMoss(size: number, seed: number) {
  const noise = makeNoise(seed);
  const rnd = makeRng(seed + 11);
  const cc = mk(size, size);
  const bc = mk(size, size);
  const cg = cc.getContext("2d")!;
  const bg = bc.getContext("2d")!;
  const cd = cg.createImageData(size, size);
  const bd = bg.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const a = noise.fbm(u * 24, v * 24, 24, 24, 3);
      const k = (y * size + x) * 4;
      cd.data[k] = mix(44, 98, a);
      cd.data[k + 1] = mix(70, 132, a);
      cd.data[k + 2] = mix(30, 58, a);
      cd.data[k + 3] = 255;
      bd.data[k] = bd.data[k + 1] = bd.data[k + 2] = a * 255;
      bd.data[k + 3] = 255;
    }
  }
  cg.putImageData(cd, 0, 0);
  bg.putImageData(bd, 0, 0);
  for (let i = 0; i < size * 1.2; i++) {
    cg.fillStyle = rnd() < 0.5 ? "rgba(150,190,90,0.35)" : "rgba(25,40,18,0.35)";
    cg.beginPath();
    cg.arc(rnd() * size, rnd() * size, 0.8 + rnd() * 2, 0, Math.PI * 2);
    cg.fill();
  }
  return { map: tex(cc, true, [2, 2]), bump: tex(bc, false, [2, 2]) };
}

/** A single leaf: lanceolate outline, midrib, side veins; alpha outside. Tinted per instance. */
export function makeLeaf(dry = false) {
  const w = 128;
  const h = 256;
  const c = mk(w, h);
  const g = c.getContext("2d")!;
  const outline = () => {
    g.beginPath();
    g.moveTo(64, 252);
    g.bezierCurveTo(6, 205, 4, 90, 64, 3);
    g.bezierCurveTo(124, 90, 122, 205, 64, 252);
    g.closePath();
  };
  outline();
  const grad = g.createLinearGradient(0, 252, 0, 0);
  grad.addColorStop(0, dry ? "#6a4a22" : "#3d6a2c");
  grad.addColorStop(0.55, dry ? "#8a6130" : "#4f8636");
  grad.addColorStop(1, dry ? "#a47a3c" : "#6a9e42");
  g.fillStyle = grad;
  g.fill();
  g.save();
  outline();
  g.clip();
  g.strokeStyle = "rgba(190,225,140,0.55)";
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(64, 252);
  g.lineTo(64, 8);
  g.stroke();
  g.lineWidth = 1.4;
  g.strokeStyle = "rgba(180,215,130,0.38)";
  for (let i = 0; i < 9; i++) {
    const y = 235 - i * 24;
    g.beginPath();
    g.moveTo(64, y);
    g.quadraticCurveTo(90, y - 18, 122, y - 44);
    g.moveTo(64, y);
    g.quadraticCurveTo(38, y - 18, 6, y - 44);
    g.stroke();
  }
  g.fillStyle = "rgba(10,30,8,0.16)";
  g.fillRect(0, 0, 20, h);
  g.fillRect(w - 20, 0, 20, h);
  g.restore();
  const t = tex(c, true);
  t.anisotropy = 4;
  return t;
}

export function makeFlower() {
  const c = mk(64, 64);
  const g = c.getContext("2d")!;
  g.translate(32, 32);
  for (let i = 0; i < 6; i++) {
    g.save();
    g.rotate((i / 6) * Math.PI * 2);
    const gr = g.createLinearGradient(0, 0, 0, -26);
    gr.addColorStop(0, "#ffffff");
    gr.addColorStop(1, "#e9e6dc");
    g.fillStyle = gr;
    g.beginPath();
    g.ellipse(0, -15, 7, 14, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  g.fillStyle = "#e8b838";
  g.beginPath();
  g.arc(0, 0, 6, 0, Math.PI * 2);
  g.fill();
  return tex(c, true);
}

export function makeRadial(stops: [number, string][], size = 64) {
  const c = mk(size, size);
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr;
  g.fillRect(0, 0, size, size);
  return tex(c, true);
}

/** Vertical shaft of light: soft edges, faded ends, faint streaking. */
export function makeShaft(seed: number) {
  const noise = makeNoise(seed);
  const w = 64;
  const h = 256;
  const c = mk(w, h);
  const g = c.getContext("2d")!;
  const d = g.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = (x - w / 2) / (w * 0.26);
      const edge = Math.exp(-nx * nx);
      const ends = Math.pow(Math.sin((Math.PI * (y + 0.5)) / h), 1.2);
      const streak = 0.65 + 0.7 * noise.fbm(x * 0.35, y * 0.02, 22, 5, 2);
      const a = Math.min(1, edge * ends * streak) * 255;
      const k = (y * w + x) * 4;
      d.data[k] = d.data[k + 1] = d.data[k + 2] = 255;
      d.data[k + 3] = a;
    }
  }
  g.putImageData(d, 0, 0);
  return tex(c, true);
}

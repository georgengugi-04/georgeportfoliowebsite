import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Noise } from "./noise";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const sstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export type RNode = { p: THREE.Vector3; r: number; g: number };

type TubeOpt = {
  radial: number;
  seg: number;
  noise: Noise;
  noiseAmp?: number;
  /** extra radius multiplier by param t (0..1 along the tube) and angle a */
  flare?: (t: number, a: number) => number;
  /** keep a fixed world-aligned frame (for the near-vertical trunk) */
  upFrame?: boolean;
  tileWorld?: number;
  seed?: number;
};

/** A tube with per-node radius and growth parameter. Adds aG / aC for the growth shader. */
export function buildTube(nodes: RNode[], o: TubeOpt): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(
    nodes.map((n) => n.p),
    false,
    "centripetal"
  );
  const M = (nodes.length - 1) * o.seg;
  const radial = o.radial;
  const pos: number[] = [];
  const uv: number[] = [];
  const aG: number[] = [];
  const aC: number[] = [];
  const idx: number[] = [];

  let frames: { tangents: THREE.Vector3[]; normals: THREE.Vector3[]; binormals: THREE.Vector3[] };
  if (o.upFrame) {
    const tangents: THREE.Vector3[] = [];
    const normals: THREE.Vector3[] = [];
    const binormals: THREE.Vector3[] = [];
    for (let i = 0; i <= M; i++) {
      const T = curve.getTangent(i / M).normalize();
      const X = V(1, 0, 0);
      const Nn = X.clone().sub(T.clone().multiplyScalar(T.dot(X))).normalize();
      const B = T.clone().cross(Nn).normalize();
      tangents.push(T);
      normals.push(Nn);
      binormals.push(B);
    }
    frames = { tangents, normals, binormals };
  } else {
    frames = curve.computeFrenetFrames(M, false);
  }

  let meanR = 0;
  nodes.forEach((n) => (meanR += n.r));
  meanR /= nodes.length;
  const tile = o.tileWorld ?? 2.4;
  const uRep = Math.max(1, Math.round((2 * Math.PI * meanR) / tile));
  const vScale = (2 * Math.PI * meanR) / uRep;
  const amp = o.noiseAmp ?? 0.1;
  const seedOff = (o.seed ?? 0) * 3.17;

  let len = 0;
  let prev: THREE.Vector3 | null = null;
  for (let i = 0; i <= M; i++) {
    const t = i / M;
    const P = curve.getPoint(t);
    if (prev) len += P.distanceTo(prev);
    prev = P;
    const f = t * (nodes.length - 1);
    const k = Math.min(nodes.length - 2, Math.floor(f));
    const fr = f - k;
    const r = lerp(nodes[k].r, nodes[k + 1].r, fr);
    const g = lerp(nodes[k].g, nodes[k + 1].g, fr);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const nz = o.noise.n2(ca * 1.6 + 20 + seedOff, sa * 1.6 + t * (M * 0.12) + seedOff, 64, 64);
      let rr = r * (1 + amp * (nz - 0.5) * 2);
      if (o.flare) rr *= o.flare(t, a);
      pos.push(P.x + (N.x * ca + B.x * sa) * rr, P.y + (N.y * ca + B.y * sa) * rr, P.z + (N.z * ca + B.z * sa) * rr);
      uv.push((j / radial) * uRep, len / vScale);
      aG.push(g);
      aC.push(P.x, P.y, P.z);
    }
  }
  for (let i = 0; i < M; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j;
      const b = a + radial + 1;
      idx.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute("aG", new THREE.Float32BufferAttribute(aG, 1));
  geo.setAttribute("aC", new THREE.Float32BufferAttribute(aC, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  // weld the seam normals so there is no visible line down the tube
  const nrm = geo.getAttribute("normal") as THREE.BufferAttribute;
  for (let i = 0; i <= M; i++) {
    const a = i * (radial + 1);
    const b = a + radial;
    const nx = nrm.getX(a) + nrm.getX(b);
    const ny = nrm.getY(a) + nrm.getY(b);
    const nz2 = nrm.getZ(a) + nrm.getZ(b);
    const l = Math.hypot(nx, ny, nz2) || 1;
    nrm.setXYZ(a, nx / l, ny / l, nz2 / l);
    nrm.setXYZ(b, nx / l, ny / l, nz2 / l);
  }
  return geo;
}

export type LeafSpec = { m: THREE.Matrix4; g: number; low: boolean };
export type PerchSite = { pos: THREE.Vector3; up: THREE.Vector3; kind: string };
export type RootPath = { pts: THREE.Vector3[]; radii: number[] };

export type TreeBuild = {
  geometry: THREE.BufferGeometry;
  leaves: LeafSpec[];
  roots: RootPath[];
  mossSpots: { pos: THREE.Vector3; s: number }[];
  treeTop: number;
};

type Rnd = () => number;

export const baseHeight = (noise: Noise, x: number, z: number) => (noise.fbm(x * 0.09 + 10, z * 0.09 + 4, 256, 256, 3) - 0.5) * 0.9;

function rotY(v: THREE.Vector3, a: number) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return V(v.x * c + v.z * s, v.y, -v.x * s + v.z * c);
}

export function buildTree(rnd: Rnd, noise: Noise, quality: "high" | "low"): TreeBuild {
  const rr = (lo: number, hi: number) => lo + (hi - lo) * rnd();
  const tubes: THREE.BufferGeometry[] = [];
  const leaves: LeafSpec[] = [];
  const roots: RootPath[] = [];
  const mossSpots: { pos: THREE.Vector3; s: number }[] = [];
  const radialMain = quality === "high" ? 28 : 18;

  // ---------------- trunk ----------------
  const lobes = 7;
  const phase = rr(0, Math.PI);
  const trunkY = [-0.7, 0.4, 1.6, 3.0, 4.4, 5.8, 7.0, 7.9];
  const trunkR = [2.0, 1.75, 1.3, 1.08, 0.92, 0.76, 0.6, 0.45];
  const trunkNodes: RNode[] = trunkY.map((y, i) => ({
    p: V(0.45 * Math.sin(y * 0.42 + 0.7) + 0.2 * Math.sin(y * 1.1), y, 0.34 * Math.cos(y * 0.36 + 0.3)),
    r: trunkR[i],
    g: 0.15 + 0.35 * (i / (trunkY.length - 1)),
  }));
  trunkNodes[0].g = 0.1;
  const trunk = buildTube(trunkNodes, {
    radial: radialMain,
    seg: 9,
    noise,
    noiseAmp: 0.1,
    upFrame: true,
    tileWorld: 2.6,
    seed: 1,
    flare: (t, a) => {
      const y = lerp(trunkY[0], trunkY[trunkY.length - 1], t);
      const s = 1 - sstep(0.2, 3.6, y);
      const lobe = Math.pow(Math.abs(Math.cos(lobes * 0.5 * a + phase)), 2.4);
      return 1 + s * 0.52 * lobe + s * 0.06;
    },
  });
  tubes.push(trunk);
  const trunkCurve = new THREE.CatmullRomCurve3(
    trunkNodes.map((n) => n.p),
    false,
    "centripetal"
  );
  const trunkSamples = trunkCurve.getPoints(96);
  const trunkAt = (y: number) => {
    for (let i = 1; i < trunkSamples.length; i++) {
      if (trunkSamples[i].y >= y) {
        const a = trunkSamples[i - 1];
        const b = trunkSamples[i];
        return a.clone().lerp(b, (y - a.y) / Math.max(1e-6, b.y - a.y));
      }
    }
    return trunkSamples[trunkSamples.length - 1].clone();
  };

  // ---------------- surface roots ----------------
  const crawl = (
    origin: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    r0: number,
    steps: number,
    g0: number,
    g1: number,
    depth: number
  ) => {
    const nodes: RNode[] = [];
    const pts: THREE.Vector3[] = [];
    const radii: number[] = [];
    const cur = origin.clone();
    const d = dir.clone();
    for (let k = 0; k <= steps; k++) {
      const f = k / steps;
      const r = Math.max(0.012, r0 * (1 - 0.88 * f));
      const gx = baseHeight(noise, cur.x, cur.z);
      const p = V(cur.x, gx + r * 0.42, cur.z);
      nodes.push({ p, r, g: lerp(g0, g1, f) });
      pts.push(p.clone());
      radii.push(r);
      d.applyAxisAngle(V(0, 1, 0), (rnd() - 0.5) * 0.7).normalize();
      cur.addScaledVector(d, len / steps);
    }
    if (nodes.length < 2) return;
    tubes.push(buildTube(nodes, { radial: depth === 0 ? 12 : 8, seg: 4, noise, noiseAmp: 0.14, tileWorld: 1.6, seed: 5 + roots.length }));
    roots.push({ pts, radii });
    const kids = depth === 1 ? 2 : depth === 2 ? 2 : 0;
    for (let c = 0; c < kids; c++) {
      const kk = Math.floor(rr(1, steps - 0.5));
      const side = rnd() < 0.5 ? -1 : 1;
      const cd = rotY(d, side * rr(0.5, 1.1));
      cd.y = 0;
      cd.normalize();
      crawl(nodes[kk].p, cd, len * rr(0.4, 0.62), nodes[kk].r * 0.62, Math.max(3, steps - 1), nodes[kk].g, Math.min(0.4, nodes[kk].g + 0.08), depth + 1);
    }
  };

  const primaryCount = lobes;
  for (let k = 0; k < primaryCount; k++) {
    const a = (2 * (k * Math.PI - phase)) / lobes + rr(-0.08, 0.08);
    const dir = V(Math.cos(a), 0, -Math.sin(a));
    const side = rotY(dir, Math.PI / 2);
    const ds = [0.7, 1.7, 3.0, 4.5, 6.0, 7.3, 8.4];
    const hs = [1.5, 0.7, 0.3, 0.16, 0.09, -0.02, -0.14];
    const rs = [0.85, 0.62, 0.46, 0.34, 0.23, 0.13, 0.05];
    const wander = rr(-1, 1) * 1.4;
    const wob = rr(0, 6);
    const nodes: RNode[] = ds.map((d, i) => {
      const lat = wander * (i / ds.length) ** 1.5 + (noise.n2(wob + i * 0.8, k * 3.1) - 0.5) * 1.3 * (i / ds.length);
      const x = dir.x * d + side.x * lat;
      const z = dir.z * d + side.z * lat;
      const y = i < 2 ? hs[i] : baseHeight(noise, x, z) + rs[i] * 0.42 + (i > 4 ? hs[i] * 0.4 : 0) * 0;
      return { p: V(x, y, z), r: rs[i], g: 0.0 + 0.19 * (i / (ds.length - 1)) };
    });
    tubes.push(buildTube(nodes, { radial: 14, seg: 6, noise, noiseAmp: 0.16, tileWorld: 2.0, seed: 9 + k }));
    roots.push({ pts: nodes.map((n) => n.p.clone()), radii: nodes.map((n) => n.r) });
    // secondary and tertiary roots crawl off the primary
    const nSec = Math.round(rr(3, 5));
    for (let s = 0; s < nSec; s++) {
      const i = 2 + Math.floor((s / nSec) * (ds.length - 3));
      const n0 = nodes[Math.min(ds.length - 2, i)];
      const sd = rotY(dir, (s % 2 ? 1 : -1) * rr(0.45, 1.15));
      crawl(n0.p.clone(), sd, rr(1.8, 3.4), n0.r * 0.55, 6, n0.g + 0.02, Math.min(0.3, n0.g + 0.1), 1);
    }
    // moss along the upper surface of the primary root
    for (let m = 0; m < 14; m++) {
      const i = Math.min(ds.length - 2, Math.floor(rnd() * (ds.length - 1)));
      const f = rnd();
      const p = nodes[i].p.clone().lerp(nodes[i + 1].p, f);
      const r = lerp(nodes[i].r, nodes[i + 1].r, f);
      mossSpots.push({ pos: V(p.x + (rnd() - 0.5) * r, p.y + r * 0.78, p.z + (rnd() - 0.5) * r), s: r * rr(0.35, 0.7) });
    }
  }
  // moss on the trunk's lower buttresses
  for (let m = 0; m < 36; m++) {
    const y = rr(0.5, 2.4);
    const c = trunkAt(y);
    const a = rr(0, Math.PI * 2);
    const rad = lerp(1.55, 1.15, (y - 0.5) / 1.9);
    mossSpots.push({ pos: V(c.x + Math.cos(a) * rad * 1.05, y, c.z + Math.sin(a) * rad * 1.05), s: rr(0.07, 0.16) });
  }

  // ---------------- branches ----------------
  const leafBudget = quality === "high" ? 6600 : 2900;
  type Attach = { p: THREE.Vector3; d: THREE.Vector3; depth: number; g: number };
  const attaches: Attach[] = [];
  const dgs: [number, number][] = [
    [0.44, 0.6],
    [0.54, 0.68],
    [0.63, 0.76],
    [0.7, 0.82],
  ];
  const growBranch = (origin: THREE.Vector3, dir: THREE.Vector3, len: number, r0: number, depth: number) => {
    const steps = depth === 0 ? 6 : 5;
    const pts: THREE.Vector3[] = [origin.clone()];
    const cur = origin.clone();
    const d = dir.clone().normalize();
    const g0 = dgs[depth][0] + rr(-0.02, 0.03);
    const g1 = dgs[depth][1] + rr(-0.02, 0.03);
    const nodes: RNode[] = [{ p: origin.clone(), r: r0, g: g0 }];
    for (let k = 1; k <= steps; k++) {
      d.x += (rnd() - 0.5) * 0.5;
      d.z += (rnd() - 0.5) * 0.5;
      d.y += (depth === 0 ? 0.1 : 0.04) - (depth >= 2 ? 0.07 : 0.0) + (rnd() - 0.5) * 0.25;
      d.normalize();
      cur.addScaledVector(d, len / steps);
      pts.push(cur.clone());
      const f = k / steps;
      nodes.push({ p: cur.clone(), r: Math.max(0.011, r0 * (1 - 0.8 * f)), g: lerp(g0, g1, f) });
    }
    tubes.push(buildTube(nodes, { radial: depth === 0 ? 12 : depth === 1 ? 8 : 5, seg: depth >= 2 ? 3 : 4, noise, noiseAmp: depth === 0 ? 0.12 : 0.08, tileWorld: 2.2, seed: 40 + tubes.length }));
    if (depth >= 1) {
      const n = depth === 1 ? 6 : depth === 2 ? 14 : 11;
      for (let i = 0; i < n; i++) {
        const f = rr(depth === 1 ? 0.55 : 0.2, 1);
        const idx = Math.min(steps - 1, Math.floor(f * steps));
        const p = pts[idx].clone().lerp(pts[idx + 1], f * steps - idx);
        attaches.push({ p, d: d.clone(), depth, g: lerp(g0, g1, f) });
      }
    }
    if (depth < 3) {
      const kids = depth === 0 ? 4 : depth === 1 ? 3 : 2;
      for (let c = 0; c < kids; c++) {
        const f = rr(0.3, 0.92);
        const idx = Math.min(steps - 1, Math.floor(f * steps));
        const p = pts[idx].clone().lerp(pts[idx + 1], f * steps - idx);
        const base = pts[idx + 1].clone().sub(pts[idx]).normalize();
        const side = rotY(base, rr(0, Math.PI * 2));
        const kd = base.clone().lerp(side, rr(0.55, 1.1)).normalize();
        kd.y += rr(0.05, 0.4);
        const rAt = lerp(nodes[idx].r, nodes[idx + 1].r, f * steps - idx);
        growBranch(p, kd, len * rr(0.52, 0.74), rAt * 0.62, depth + 1);
      }
    }
  };
  const limbs = 7;
  const golden = 2.399963;
  const az0 = rr(0, Math.PI * 2);
  for (let i = 0; i < limbs; i++) {
    const y = 3.9 + (i / (limbs - 1)) * 3.5 + rr(-0.25, 0.25);
    const c = trunkAt(Math.min(7.6, y));
    const a = az0 + i * golden + rr(-0.35, 0.35);
    const elev = rr(0.22, 0.75);
    const dir = V(Math.cos(a), elev * (1.2 - 0.3 * ((y - 3.9) / 3.5)), Math.sin(a)).normalize();
    const inR = lerp(0.9, 0.6, (y - 3.9) / 3.5);
    growBranch(c.clone().addScaledVector(V(Math.cos(a), 0, Math.sin(a)), inR * 0.5), dir, rr(4.2, 6.4) * (1.05 - 0.25 * ((y - 3.9) / 3.5)), rr(0.34, 0.46) * (1.1 - 0.4 * ((y - 3.9) / 3.5)), 0);
  }
  // leading shoots at the very top
  growBranch(trunkAt(7.8), V(rr(-0.2, 0.2), 1, rr(-0.2, 0.2)), 2.6, 0.3, 1);

  // leaves along the thinner wood
  const picks = attaches.filter((a) => a.depth >= 1);
  for (let i = picks.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [picks[i], picks[j]] = [picks[j], picks[i]];
  }
  const perAttach = Math.max(1, Math.ceil(leafBudget / Math.max(1, picks.length)));
  const up = V(0, 1, 0);
  outer: for (const at of picks) {
    for (let k = 0; k < perAttach; k++) {
      const Y = at.d.clone().multiplyScalar(0.5);
      Y.x += rr(-1, 1);
      Y.z += rr(-1, 1);
      Y.y += rr(-0.2, 1);
      Y.y -= 0.25; // leaves hang a little
      Y.normalize();
      const Z = up.clone().sub(Y.clone().multiplyScalar(Y.dot(up)));
      if (Z.lengthSq() < 1e-4) Z.set(1, 0, 0);
      Z.normalize().applyAxisAngle(Y, rr(-0.8, 0.8));
      const X = Y.clone().cross(Z).normalize();
      const m = new THREE.Matrix4().makeBasis(X, Y, Z);
      const s = rr(0.55, 1.15) * (at.depth === 1 ? 1.1 : 1);
      m.scale(V(s, s, s));
      m.setPosition(at.p.x + rr(-0.06, 0.06), at.p.y + rr(-0.05, 0.05), at.p.z + rr(-0.06, 0.06));
      leaves.push({ m, g: 0.8 + rnd() * 0.22, low: at.p.y < 6.2 });
      if (leaves.length >= leafBudget) break outer;
    }
  }

  return { geometry: mergeGeometries(tubes, false)!, leaves, roots, mossSpots, treeTop: 11 };
}

/** Roots seen in the cross-section: shallow, wide, finely branched (illustrative). */
export function buildUnderRoots(rnd: Rnd, noise: Noise): THREE.BufferGeometry {
  const rr = (lo: number, hi: number) => lo + (hi - lo) * rnd();
  const tubes: THREE.BufferGeometry[] = [];
  const grow = (origin: THREE.Vector3, dir: THREE.Vector3, len: number, r0: number, steps: number, depth: number) => {
    const nodes: RNode[] = [];
    const cur = origin.clone();
    const d = dir.clone().normalize();
    for (let k = 0; k <= steps; k++) {
      const f = k / steps;
      nodes.push({ p: cur.clone(), r: Math.max(0.01, r0 * (1 - 0.9 * f)), g: 0 });
      d.x += (rnd() - 0.5) * 0.7;
      d.z += (rnd() - 0.5) * 0.7;
      d.y += (rnd() - 0.5) * 0.35 - 0.05;
      d.y = Math.max(-0.9, Math.min(0.15, d.y));
      d.normalize();
      cur.addScaledVector(d, len / steps);
      cur.y = Math.max(-3.7, Math.min(-0.04, cur.y));
    }
    tubes.push(buildTube(nodes, { radial: depth > 1 ? 4 : 6, seg: 3, noise, noiseAmp: 0.1, tileWorld: 1.2, seed: 80 + tubes.length }));
    const kids = depth === 0 ? 4 : depth === 1 ? 3 : 0;
    for (let c = 0; c < kids; c++) {
      const kk = Math.floor(rr(1, steps));
      const side = rotY(d, rr(-1.3, 1.3));
      side.y = rr(-0.6, 0.05);
      grow(nodes[kk].p, side, len * rr(0.35, 0.6), nodes[kk].r * 0.65, Math.max(3, steps - 1), depth + 1);
    }
  };
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2 + rr(-0.2, 0.2);
    const dir = V(Math.cos(a), rr(-0.55, -0.1), Math.sin(a));
    grow(V(Math.cos(a) * 0.5, -0.1, Math.sin(a) * 0.5), dir, rr(5.2, 7.5), rr(0.26, 0.38), 7, 0);
  }
  // a few deeper anchoring roots
  for (let k = 0; k < 3; k++) {
    const a = rr(0, Math.PI * 2);
    grow(V(Math.cos(a) * 0.3, -0.2, Math.sin(a) * 0.3), V(Math.cos(a) * 0.35, -1, Math.sin(a) * 0.35), 4.2, 0.2, 6, 1);
  }
  return mergeGeometries(tubes, false)!;
}

/** Cupped leaf card with its base at the origin and its tip along +Y. */
export function leafGeometry(w = 0.44, h = 0.8, cup = 0.35) {
  const g = new THREE.PlaneGeometry(w, h, 2, 4);
  g.translate(0, h / 2, 0);
  const p = g.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    p.setZ(i, cup * x * x * 2 - y * y * 0.07);
  }
  g.computeVertexNormals();
  return g;
}

export function bladeGeometry() {
  const rows = 4;
  const pos: number[] = [];
  const col: number[] = [];
  const sway: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= rows; i++) {
    const y = i / rows;
    const w = 0.04 * (1 - y * 0.9);
    const z = y * y * 0.16;
    const shade = 0.45 + 0.55 * y;
    if (i < rows) {
      pos.push(-w, y, z, w, y, z);
      col.push(shade, shade, shade, shade, shade, shade);
      sway.push(y, y);
    } else {
      pos.push(0, 1.0, z);
      col.push(1, 1, 1);
      sway.push(1);
    }
  }
  for (let i = 0; i < rows - 1; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const t = (rows - 1) * 2;
  idx.push(t, t + 1, t + 2);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute("aSway", new THREE.Float32BufferAttribute(sway, 1));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** One arched fern frond made of paired leaflets. Leaflets sample the leaf texture. */
export function frondGeometry() {
  const pos: number[] = [];
  const uv: number[] = [];
  const col: number[] = [];
  const sway: number[] = [];
  const idx: number[] = [];
  const n = 15;
  const L = 1.5;
  const H = 0.75;
  const rach = (t: number) => V(L * t, H * Math.sin(t * 1.5) - 0.25 * t * t * t * 0 - 0.18 * t * t, 0);
  const push = (p: THREE.Vector3, u: number, v: number, s: number, shade: number) => {
    pos.push(p.x, p.y, p.z);
    uv.push(u, v);
    sway.push(s);
    col.push(shade * 0.85, shade, shade * 0.75);
  };
  let vi = 0;
  // rachis as a thin ribbon sampling the solid middle of the leaf texture
  for (let i = 0; i < n; i++) {
    const t0 = i / n;
    const t1 = (i + 1) / n;
    const a = rach(t0);
    const b = rach(t1);
    const w = 0.012 * (1 - t0 * 0.7);
    push(V(a.x, a.y, -w), 0.5, 0.5, t0, 0.55);
    push(V(a.x, a.y, w), 0.5, 0.5, t0, 0.55);
    push(V(b.x, b.y, -w), 0.5, 0.5, t1, 0.55);
    push(V(b.x, b.y, w), 0.5, 0.5, t1, 0.55);
    idx.push(vi, vi + 1, vi + 2, vi + 1, vi + 3, vi + 2);
    vi += 4;
  }
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const base = rach(t);
    const ahead = rach(Math.min(1, t + 0.04)).sub(base).normalize();
    const size = 0.34 * Math.sin(Math.PI * Math.pow(t, 0.7)) + 0.05;
    for (const side of [-1, 1]) {
      const out = V(ahead.x * 0.45, 0.15 - t * 0.2, side * 1).normalize();
      const w = 0.075 + 0.02 * (1 - t);
      const tip = base.clone().addScaledVector(out, size);
      const nrm = V(0, 1, 0).cross(out).normalize().multiplyScalar(w * 0.5 * side);
      const shade = 0.85 + 0.2 * t;
      push(base.clone().add(nrm), 0.05, 0.02, t, shade);
      push(base.clone().sub(nrm), 0.95, 0.02, t, shade);
      push(tip.clone().add(nrm.clone().multiplyScalar(0.6)).add(V(0, -0.05 * size, 0)), 0.15, 0.98, Math.min(1, t + 0.1), shade);
      push(tip.clone().sub(nrm.clone().multiplyScalar(0.6)).add(V(0, -0.05 * size, 0)), 0.85, 0.98, Math.min(1, t + 0.1), shade);
      idx.push(vi, vi + 1, vi + 2, vi + 1, vi + 3, vi + 2);
      vi += 4;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute("aSway", new THREE.Float32BufferAttribute(sway, 1));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function stoneGeometry(noise: Noise) {
  const g = new THREE.IcosahedronGeometry(1, 3);
  const p = g.getAttribute("position") as THREE.BufferAttribute;
  const col: number[] = [];
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    const n = noise.fbm(v.x * 2.3 + 5, v.z * 2.3 + v.y * 1.7, 256, 256, 3);
    const s = 0.8 + 0.4 * n;
    v.multiplyScalar(s);
    p.setXYZ(i, v.x, v.y * 0.7, v.z);
  }
  g.computeVertexNormals();
  const nrm = g.getAttribute("normal") as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const ny = nrm.getY(i);
    const moss = sstep(0.35, 0.8, ny) * (0.5 + 0.5 * noise.n2(p.getX(i) * 4, p.getZ(i) * 4));
    const l = 0.5 + 0.3 * noise.n2(p.getX(i) * 6 + 9, p.getY(i) * 6);
    col.push(lerp(l * 0.85, 0.24, moss), lerp(l * 0.82, 0.34, moss), lerp(l * 0.76, 0.16, moss));
  }
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  return g;
}

export function cushionGeometry(noise: Noise) {
  const g = new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  const p = g.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const n = 0.82 + 0.36 * noise.n2(x * 3.2 + 2, z * 3.2 + y * 2);
    p.setXYZ(i, x * n, y * n, z * n);
  }
  g.computeVertexNormals();
  return g;
}

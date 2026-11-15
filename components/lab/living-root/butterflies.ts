import * as THREE from "three";
import type { PerchSite } from "./geometry";

import { SPECIES_INFO, type SpeciesId } from "./species";
export { SPECIES_INFO };
export type { SpeciesId };

const W = 512;
const H = 400;

function forePath(g: CanvasRenderingContext2D) {
  g.beginPath();
  g.moveTo(22, 206);
  g.bezierCurveTo(40, 110, 150, 22, 330, 16);
  g.bezierCurveTo(440, 12, 478, 66, 446, 122);
  g.bezierCurveTo(412, 176, 300, 204, 22, 212);
  g.closePath();
}
function hindPath(g: CanvasRenderingContext2D, tail: boolean) {
  g.beginPath();
  g.moveTo(22, 210);
  g.bezierCurveTo(150, 208, 330, 206, 402, 252);
  g.bezierCurveTo(446, 292, 420, 358, 356, 370);
  if (tail) {
    g.quadraticCurveTo(378, 380, 392, 400);
    g.quadraticCurveTo(346, 394, 318, 382);
  } else {
    g.bezierCurveTo(330, 384, 300, 388, 280, 386);
  }
  g.bezierCurveTo(200, 384, 100, 326, 22, 214);
  g.closePath();
}

function veins(g: CanvasRenderingContext2D, color: string, width: number, alpha = 1) {
  g.strokeStyle = color;
  g.globalAlpha = alpha;
  g.lineWidth = width;
  g.lineCap = "round";
  for (let i = 0; i < 9; i++) {
    const a = -1.15 + i * 0.2;
    g.beginPath();
    g.moveTo(26, 208);
    g.quadraticCurveTo(26 + Math.cos(a) * 150, 208 + Math.sin(a) * 90, 26 + Math.cos(a) * 440, 208 + Math.sin(a) * 270 + 10);
    g.stroke();
  }
  g.globalAlpha = 1;
}

function band(g: CanvasRenderingContext2D, path: () => void, color: string, width: number) {
  g.save();
  path();
  g.clip();
  g.strokeStyle = color;
  g.lineWidth = width * 2;
  g.lineJoin = "round";
  path();
  g.stroke();
  g.restore();
}

function dotsAlongEdge(g: CanvasRenderingContext2D, pts: [number, number][], color: string, r: number) {
  g.fillStyle = color;
  pts.forEach(([x, y], i) => {
    g.beginPath();
    g.arc(x, y, r * (i % 2 ? 0.75 : 1), 0, Math.PI * 2);
    g.fill();
  });
}

function eyespot(g: CanvasRenderingContext2D, x: number, y: number, r: number, ring = "#e8d7a8") {
  g.fillStyle = "#2a1a0e";
  g.beginPath();
  g.arc(x, y, r * 1.35, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = ring;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#1c120a";
  g.beginPath();
  g.arc(x, y, r * 0.55, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "rgba(255,255,255,0.8)";
  g.beginPath();
  g.arc(x - r * 0.2, y - r * 0.2, r * 0.17, 0, Math.PI * 2);
  g.fill();
}

const FORE_EDGE: [number, number][] = [
  [330, 36], [372, 40], [410, 54], [434, 80], [440, 112], [418, 142], [380, 160],
];
const HIND_EDGE: [number, number][] = [
  [390, 268], [410, 298], [402, 334], [372, 358], [332, 368], [290, 372],
];

export function paintWings(species: SpeciesId, side: "top" | "under"): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const tail = species === "swallowtail";
  const wings: (() => void)[] = [() => forePath(g), () => hindPath(g, tail)];

  wings.forEach((path, wi) => {
    g.save();
    path();
    g.clip();
    // base colour
    let grad: CanvasGradient;
    if (species === "morpho") {
      if (side === "top") {
        grad = g.createRadialGradient(80, 210, 10, 260, 210, 330);
        grad.addColorStop(0, "#0b2a86");
        grad.addColorStop(0.35, "#2a82f2");
        grad.addColorStop(0.75, "#5cc3ff");
        grad.addColorStop(1, "#2a6fe0");
      } else {
        grad = g.createLinearGradient(20, 0, 460, 0);
        grad.addColorStop(0, "#5c3d24");
        grad.addColorStop(1, "#9a7448");
      }
    } else if (species === "monarch") {
      grad = g.createLinearGradient(20, 0, 460, 0);
      if (side === "top") {
        grad.addColorStop(0, "#d9560c");
        grad.addColorStop(1, "#f28a1f");
      } else {
        grad.addColorStop(0, "#efa33c");
        grad.addColorStop(1, wi ? "#e6c77a" : "#f4b04a");
      }
    } else {
      grad = g.createLinearGradient(20, 0, 460, 0);
      if (side === "top") {
        grad.addColorStop(0, "#e9cf4e");
        grad.addColorStop(1, "#f6e98a");
      } else {
        grad.addColorStop(0, "#efdc7a");
        grad.addColorStop(1, "#f7efb0");
      }
    }
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);

    // species detail inside the clip
    if (species === "morpho") {
      if (side === "top") {
        veins(g, "rgba(8,20,70,0.5)", 2.2);
        g.fillStyle = "rgba(255,255,255,0.12)";
        for (let i = 0; i < 26; i++) {
          g.beginPath();
          g.ellipse(120 + i * 12, 150 + (i % 5) * 24 + wi * 90, 14, 4, -0.3, 0, Math.PI * 2);
          g.fill();
        }
        band(g, path, "#160f0c", 20);
      } else {
        g.strokeStyle = "rgba(60,38,22,0.55)";
        g.lineWidth = 5;
        for (let i = 0; i < 4; i++) {
          g.beginPath();
          g.arc(10, 210, 130 + i * 70, -1.2, 1.2);
          g.stroke();
        }
        veins(g, "rgba(50,30,16,0.35)", 2);
        if (wi === 0) {
          eyespot(g, 300, 96, 14);
          eyespot(g, 372, 70, 11);
        } else {
          eyespot(g, 190, 292, 17);
          eyespot(g, 262, 324, 20);
          eyespot(g, 332, 332, 14);
        }
        band(g, path, "#3a2616", 10);
      }
    } else if (species === "monarch") {
      veins(g, "#140c06", side === "top" ? 4 : 3);
      band(g, path, "#120b07", side === "top" ? 24 : 16);
      if (wi === 0) {
        g.fillStyle = "#110a06";
        g.beginPath();
        g.ellipse(390, 80, 70, 70, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = side === "top" ? "#f3a23a" : "#f6e9c0";
        [[368, 70, 8], [394, 88, 7], [412, 62, 6], [380, 106, 6]].forEach(([x, y, r]) => {
          g.beginPath();
          g.arc(x, y, r, 0, Math.PI * 2);
          g.fill();
        });
      }
    } else {
      // swallowtail
      g.fillStyle = "#14100a";
      if (wi === 0) {
        for (let i = 0; i < 5; i++) {
          g.beginPath();
          g.moveTo(60 + i * 56, 26 + i * 4);
          g.lineTo(90 + i * 56, 24 + i * 4);
          g.lineTo(36 + i * 22, 210);
          g.lineTo(24 + i * 14, 210);
          g.closePath();
          g.globalAlpha = side === "top" ? 0.95 : 0.55;
          g.fill();
        }
        g.globalAlpha = 1;
      }
      band(g, path, "#14100a", side === "top" ? 28 : 18);
      g.fillStyle = side === "top" ? "#f3df62" : "#f6eba0";
      (wi === 0 ? FORE_EDGE : HIND_EDGE).forEach(([x, y]) => {
        g.beginPath();
        g.ellipse(x - 14 * (wi ? 0.4 : 0.6), y + (wi ? -8 : 6), 9, 5, 0.4, 0, Math.PI * 2);
        g.fill();
      });
      if (wi === 1) {
        g.fillStyle = side === "top" ? "#4a86d8" : "#8aa6d0";
        for (let i = 0; i < 6; i++) {
          g.beginPath();
          g.ellipse(170 + i * 32, 330 - Math.abs(i - 2.5) * 6, 12, 8, 0.2, 0, Math.PI * 2);
          g.fill();
        }
        g.fillStyle = "#e0701c";
        g.beginPath();
        g.arc(352, 352, 14, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#14100a";
        g.beginPath();
        g.arc(352, 352, 6, 0, Math.PI * 2);
        g.fill();
      }
    }

    if (species !== "monarch" && species !== "morpho") {
      veins(g, "rgba(30,24,10,0.35)", 2.2);
    }
    // white margin spots
    if (species === "morpho" && side === "top") dotsAlongEdge(g, wi ? HIND_EDGE : FORE_EDGE, "rgba(240,244,255,0.85)", 4.5);
    if (species === "monarch") dotsAlongEdge(g, wi ? HIND_EDGE : FORE_EDGE, "rgba(248,244,230,0.95)", 5.5);
    g.restore();
  });
  return c;
}

export type SpeciesParams = {
  span: number;
  hz: number;
  amp: number;
  speed: number;
  hMin: number;
  hMax: number;
  glide: number;
  landPref: number;
  restOpen: number; // wing raise while perched (deg)
};

const PARAMS: Record<SpeciesId, SpeciesParams> = {
  morpho: { span: 0.95, hz: 4.2, amp: 46, speed: 1.0, hMin: 1.0, hMax: 4.2, glide: 0.5, landPref: 0.3, restOpen: 76 },
  monarch: { span: 0.78, hz: 5.4, amp: 40, speed: 1.25, hMin: 1.5, hMax: 6.0, glide: 0.35, landPref: 0.3, restOpen: 70 },
  swallowtail: { span: 0.88, hz: 4.8, amp: 38, speed: 1.1, hMin: 2.0, hMax: 7.0, glide: 0.7, landPref: 0.32, restOpen: 24 },
};

export type FlightCtx = {
  dt: number;
  t: number;
  activity: number;
  sites: PerchSite[];
  ray: THREE.Ray | null;
  groundY: (x: number, z: number) => number;
  rnd: () => number;
};

type Mode = "wander" | "hover" | "approach" | "landed" | "takeoff";

const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const tmpM = new THREE.Matrix4();
const UP = new THREE.Vector3(0, 1, 0);

export class Butterfly {
  readonly id: SpeciesId;
  readonly group = new THREE.Group();
  readonly proxy: THREE.Mesh;
  readonly p: SpeciesParams;
  pos = new THREE.Vector3();
  vel = new THREE.Vector3(0.5, 0, 0.2);
  mode: Mode = "wander";
  private timer = 1;
  private goal = new THREE.Vector3();
  private site: PerchSite | null = null;
  private phase = 0;
  private yaw = 0;
  private roll = 0;
  private landBlend = 0;
  private glideT = 0;
  private wingL = new THREE.Group();
  private wingR = new THREE.Group();
  private mats: THREE.Material[] = [];
  private textures: THREE.Texture[] = [];
  private geos: THREE.BufferGeometry[] = [];
  private seed: number;

  constructor(id: SpeciesId, rnd: () => number, quality: "high" | "low") {
    this.id = id;
    this.p = PARAMS[id];
    this.seed = rnd() * 100;
    const inner = new THREE.Group();
    inner.rotation.y = Math.PI;
    this.group.add(inner);

    const geo = new THREE.PlaneGeometry(1.28, 1, 14, 10);
    geo.translate(0.64 - 0.05 * 1.28 + 0.0, 0.0125, 0);
    geo.rotateX(-Math.PI / 2);
    const gp = geo.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < gp.count; i++) {
      const x = gp.getX(i);
      gp.setY(i, gp.getY(i) + 0.1 * x * x);
    }
    geo.computeVertexNormals();
    this.geos.push(geo);

    const topTex = new THREE.CanvasTexture(paintWings(id, "top"));
    const underTex = new THREE.CanvasTexture(paintWings(id, "under"));
    for (const t of [topTex, underTex]) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      this.textures.push(t);
    }
    const top =
      id === "morpho"
        ? new THREE.MeshPhysicalMaterial({ map: topTex, alphaTest: 0.4, side: THREE.FrontSide, roughness: 0.45, iridescence: 0.7, iridescenceIOR: 1.8, iridescenceThicknessRange: [200, 500] })
        : new THREE.MeshStandardMaterial({ map: topTex, alphaTest: 0.4, side: THREE.FrontSide, roughness: 0.6 });
    const under = new THREE.MeshStandardMaterial({ map: underTex, alphaTest: 0.4, side: THREE.BackSide, roughness: 0.7 });
    this.mats.push(top, under);

    const s = this.p.span / 2.4;
    for (const [wing, mirror] of [
      [this.wingR, 1],
      [this.wingL, -1],
    ] as [THREE.Group, number][]) {
      const a = new THREE.Mesh(geo, top);
      const b = new THREE.Mesh(geo, under);
      a.castShadow = b.castShadow = quality === "high";
      wing.add(a, b);
      wing.scale.set(s * mirror, s, s);
      inner.add(wing);
    }

    // body: thorax, abdomen, head, antennae (forward is -Z inside the inner group)
    const bodyMat = new THREE.MeshStandardMaterial({ color: id === "morpho" ? 0x2a1a10 : 0x17120d, roughness: 0.8 });
    this.mats.push(bodyMat);
    const sph = new THREE.SphereGeometry(1, 10, 8);
    this.geos.push(sph);
    const mk = (sx: number, sy: number, sz: number, z: number) => {
      const m = new THREE.Mesh(sph, bodyMat);
      m.scale.set(sx, sy, sz).multiplyScalar(s);
      m.position.set(0, 0, z * s);
      inner.add(m);
    };
    mk(0.075, 0.07, 0.15, 0);
    mk(0.05, 0.05, 0.32, 0.4);
    mk(0.06, 0.06, 0.06, -0.19);
    const ant = new THREE.CylinderGeometry(0.006, 0.006, 0.42, 4);
    ant.translate(0, 0.21, 0);
    this.geos.push(ant);
    for (const sd of [-1, 1]) {
      const m = new THREE.Mesh(ant, bodyMat);
      m.scale.setScalar(s);
      m.position.set(sd * 0.03 * s, 0.01 * s, -0.22 * s);
      m.rotation.set(-1.25, 0, -sd * 0.45, "YXZ");
      inner.add(m);
    }

    this.proxy = new THREE.Mesh(new THREE.SphereGeometry(0.62, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
    this.proxy.userData.butterfly = this;
    this.geos.push(this.proxy.geometry);
    this.mats.push(this.proxy.material as THREE.Material);
    this.group.add(this.proxy);
  }

  placeAt(p: THREE.Vector3) {
    this.pos.copy(p);
    this.group.position.copy(p);
    this.goal.copy(p).add(tmpA.set(1, 0.3, 0.5));
  }

  /** Static pose for reduced-motion: perched on the given site, wings raised. */
  perchStatic(site: PerchSite, yaw: number) {
    this.site = site;
    this.mode = "landed";
    this.pos.copy(site.pos).addScaledVector(site.up, 0.03);
    this.group.position.copy(this.pos);
    this.yaw = yaw;
    this.group.rotation.set(-0.2, yaw, 0, "YXZ");
    this.landBlend = 1;
    this.setWings(this.p.restOpen);
  }

  get landed() {
    return this.mode === "landed";
  }

  private setWings(deg: number) {
    const a = (deg * Math.PI) / 180;
    this.wingR.rotation.z = a;
    this.wingL.rotation.z = -a;
  }

  private pickGoal(c: FlightCtx) {
    const r = c.rnd;
    const p = this.p;
    for (let k = 0; k < 6; k++) {
      const ang = r() * Math.PI * 2;
      const rad = 2.6 + r() * 7;
      this.goal.set(Math.cos(ang) * rad, p.hMin + r() * (p.hMax - p.hMin), Math.sin(ang) * rad);
      if (Math.hypot(this.goal.x, this.goal.z) > 2.2) break;
    }
  }

  private nearestSite(c: FlightCtx): PerchSite | null {
    if (!c.sites.length) return null;
    let best: PerchSite | null = null;
    let bd = 1e9;
    for (let i = 0; i < 7; i++) {
      const s = c.sites[Math.floor(c.rnd() * c.sites.length)];
      const d = s.pos.distanceTo(this.pos);
      if (d < bd && d > 1.2) {
        bd = d;
        best = s;
      }
    }
    return best;
  }

  private decide(c: FlightCtx) {
    const r = c.rnd();
    if (r < this.p.landPref * c.activity + 0.06) {
      const s = this.nearestSite(c);
      if (s) {
        this.site = s;
        this.mode = "approach";
        this.timer = 12;
        return;
      }
    }
    if (r < 0.45) {
      const s = this.nearestSite(c);
      if (s) {
        this.goal.copy(s.pos).addScaledVector(s.up, 0.45);
        this.mode = "hover";
        this.timer = 4;
        return;
      }
    }
    this.mode = "wander";
    this.pickGoal(c);
    this.timer = 2.5 + c.rnd() * 3;
  }

  takeoff(c: FlightCtx) {
    this.mode = "takeoff";
    this.timer = 0.9;
    this.vel.set((c.rnd() - 0.5) * 1.2, 1.5, (c.rnd() - 0.5) * 1.2);
    this.site = null;
    this.goal.copy(this.pos).add(tmpA.set((c.rnd() - 0.5) * 4, 1.8 + c.rnd() * 1.5, (c.rnd() - 0.5) * 4));
  }

  update(c: FlightCtx) {
    const dt = c.dt;
    const p = this.p;
    this.timer -= dt;

    // pointer proximity (closest approach of the pointer ray)
    const away = tmpB.set(0, 0, 0);
    if (c.ray) {
      tmpA.copy(this.pos).sub(c.ray.origin);
      const tt = Math.max(0, tmpA.dot(c.ray.direction));
      const cp = c.ray.origin.clone().addScaledVector(c.ray.direction, tt);
      const off = this.pos.clone().sub(cp);
      const d = off.length();
      const reach = 0.75 + Math.min(1.2, tt * 0.04);
      if (d < reach) {
        if (this.mode === "landed" && d < reach * 0.8) this.takeoff(c);
        else if (this.mode !== "landed") away.copy(off.normalize()).multiplyScalar((reach - d) * 3);
      }
    }

    let speed = p.speed * (0.55 + 0.45 * c.activity);
    let flapHz = p.hz;
    let target = this.goal;

    switch (this.mode) {
      case "wander":
        if (this.pos.distanceTo(this.goal) < 0.9 || this.timer <= 0) this.decide(c);
        if (this.glideT > 0) {
          this.glideT -= dt;
        } else if (c.rnd() < dt * p.glide * 0.35) this.glideT = 0.7 + c.rnd() * 0.9;
        break;
      case "hover":
        speed *= Math.min(1, this.pos.distanceTo(this.goal) * 0.9) * 0.6;
        flapHz *= 1.15;
        if (this.pos.distanceTo(this.goal) < 0.3) {
          this.timer = Math.min(this.timer, 0.01);
        }
        if (this.timer <= 0) {
          this.mode = "wander";
          this.pickGoal(c);
          this.timer = 3;
        }
        break;
      case "approach": {
        const s = this.site!;
        target = tmpA.copy(s.pos).addScaledVector(s.up, 0.05);
        const d = this.pos.distanceTo(target);
        speed = Math.min(speed, 0.14 + d * 1.1);
        flapHz *= 0.85;
        if (d < 0.07 || this.timer <= 0) {
          this.mode = "landed";
          this.timer = (3 + c.rnd() * 6) / Math.max(0.35, c.activity);
          this.vel.set(0, 0, 0);
          this.yaw = c.rnd() * Math.PI * 2;
        }
        break;
      }
      case "takeoff":
        flapHz *= 1.35;
        speed *= 1.1;
        if (this.timer <= 0) {
          this.mode = "wander";
          this.pickGoal(c);
          this.timer = 3;
        }
        break;
      case "landed":
        if (this.timer <= 0) this.takeoff(c);
        break;
    }

    // blend between flight pose and perched pose
    const wantLand = this.mode === "landed" ? 1 : 0;
    this.landBlend += (wantLand - this.landBlend) * Math.min(1, dt * 3.2);

    if (this.mode !== "landed") {
      // steering
      const to = tmpA.copy(target).sub(this.pos);
      const dist = to.length();
      to.normalize();
      const desired = to.multiplyScalar(this.mode === "approach" ? speed : speed * (this.glideT > 0 ? 1.05 : 1));
      // slow curling flutter so paths are never straight lines
      const tt = c.t * 1.3 + this.seed;
      desired.x += Math.sin(tt * 1.7) * 0.45 * (this.mode === "approach" ? 0.2 : 1);
      desired.y += Math.sin(tt * 2.3 + 1) * 0.35 * (this.mode === "approach" ? 0.2 : 1);
      desired.z += Math.cos(tt * 1.4) * 0.45 * (this.mode === "approach" ? 0.2 : 1);
      desired.add(away);
      // keep clear of the trunk and the ground, stay inside the clearing
      const hr = Math.hypot(this.pos.x, this.pos.z);
      if (hr < 2.1 && this.pos.y < 8 && this.mode !== "approach") {
        desired.x += (this.pos.x / (hr + 1e-3)) * (2.1 - hr) * 2.2;
        desired.z += (this.pos.z / (hr + 1e-3)) * (2.1 - hr) * 2.2;
      }
      if (hr > 11) {
        desired.x -= this.pos.x * 0.15;
        desired.z -= this.pos.z * 0.15;
      }
      const gy = c.groundY(this.pos.x, this.pos.z);
      if (this.pos.y < gy + 0.35 && this.mode !== "approach") desired.y += (gy + 0.35 - this.pos.y) * 3;
      if (this.pos.y > 9) desired.y -= (this.pos.y - 9) * 0.8;
      const k = 1 - Math.exp(-dt * (this.mode === "hover" ? 2.5 : 1.6));
      this.vel.lerp(desired, k);
      void dist;
      this.pos.addScaledVector(this.vel, dt);
    } else {
      this.vel.set(0, 0, 0);
      const s = this.site!;
      this.pos.lerp(tmpA.copy(s.pos).addScaledVector(s.up, 0.03), Math.min(1, dt * 6));
    }

    // wings
    let theta: number;
    if (this.glideT > 0 && this.mode === "wander") {
      theta = 28 + Math.sin(c.t * 0.9 + this.seed) * 4;
    } else {
      this.phase += dt * flapHz * Math.PI * 2 * (0.9 + 0.2 * Math.sin(c.t * 0.7 + this.seed));
      theta = 36 + p.amp * Math.sin(this.phase);
    }
    const rest = p.restOpen + (this.id === "swallowtail" ? Math.sin(c.t * 6 + this.seed) * 12 : Math.sin(c.t * 0.55 + this.seed) * 6 * (this.id === "morpho" ? 3 : 1));
    this.setWings(theta + (rest - theta) * this.landBlend);

    // orientation: yaw from velocity, bank into turns, pitch with climb
    const horiz = Math.hypot(this.vel.x, this.vel.z);
    if (this.mode !== "landed" && horiz > 0.12) {
      const ty = Math.atan2(this.vel.x, this.vel.z);
      let d = ty - this.yaw;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      this.yaw += d * Math.min(1, dt * 3.5);
      this.roll += (THREE.MathUtils.clamp(-d * 0.9, -0.55, 0.55) - this.roll) * Math.min(1, dt * 4);
    } else {
      this.roll += (0 - this.roll) * Math.min(1, dt * 5);
    }
    const pitch = this.mode === "landed" ? 0.22 : THREE.MathUtils.clamp(Math.atan2(this.vel.y, Math.max(0.3, horiz)) * 0.6, -0.5, 0.5) + 0.12;
    this.group.rotation.set(-pitch, this.yaw, this.roll, "YXZ");
    const bob = this.mode === "landed" ? 0 : Math.sin(this.phase - 0.6) * 0.045 * this.p.span;
    this.group.position.set(this.pos.x, this.pos.y + bob, this.pos.z);
    void tmpM;
    void UP;
  }

  dispose() {
    this.textures.forEach((t) => t.dispose());
    this.mats.forEach((m) => m.dispose());
    this.geos.forEach((g) => g.dispose());
  }
}

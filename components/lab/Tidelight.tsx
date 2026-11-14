"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";

type Three = typeof import("three");

// ───────── GLSL ─────────
const COMMON = /* glsl */ `
uniform float uTime, uEnergy, uPulseAge, uPulseStr, uIntro;
float pulseGlow(float y){
  float front = 0.8 - uPulseAge * 2.2;
  float fade = max(0.0, 1.0 - uPulseAge / 2.8);
  return exp(-pow((y - front) * 4.0, 2.0)) * uPulseStr * fade;
}`;

const BELL_VS = COMMON + /* glsl */ `
varying vec3 vN; varying vec3 vV; varying vec3 vLocal;
void main(){
  vec3 p = position;
  float b = 1.0 + 0.06 * sin(uTime * 1.1) + 0.05 * uEnergy;
  p.xz *= b * (1.0 + 0.04 * sin(uTime * 1.1 - p.y * 2.5));
  p.y *= 1.0 / sqrt(b);
  p += normal * 0.012 * sin(uTime * 1.7 + position.y * 9.0 + atan(position.x, position.z) * 3.0);
  vLocal = position;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const BELL_FS = COMMON + /* glsl */ `
varying vec3 vN; varying vec3 vV; varying vec3 vLocal;
void main(){
  float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
  float ang = atan(vLocal.x, vLocal.z);
  float canals = pow(0.5 + 0.5 * sin(ang * 12.0 + sin(vLocal.y * 5.0 + uTime * 0.3) * 0.6), 14.0) * (0.35 + 0.65 * smoothstep(0.7, -0.1, vLocal.y));
  float pg = pulseGlow(vLocal.y);
  vec3 col = mix(vec3(0.01, 0.06, 0.20), vec3(0.10, 0.85, 1.0), fres);
  col += vec3(0.45, 0.20, 1.0) * smoothstep(0.1, -0.15, vLocal.y) * 0.5;
  col += canals * vec3(0.30, 0.80, 1.0) * (0.6 + uEnergy * 1.4);
  col += pg * vec3(0.7, 0.9, 1.0);
  float a = (0.10 + fres * 0.55 + canals * 0.5 + pg * 0.6 + uEnergy * 0.12) * uIntro;
  gl_FragColor = vec4(col, a);
}`;

const FIL_VS = COMMON + /* glsl */ `
attribute float aU; attribute float aPh;
varying float vU; varying float vPh; varying float vY;
void main(){
  vec3 p = position;
  float b = 1.0 + 0.06 * sin(uTime * 1.1) + 0.05 * uEnergy;
  p.xz *= b * (1.0 + 0.04 * sin(uTime * 1.1 - p.y * 2.5));
  p.y *= 1.0 / sqrt(b);
  vU = aU; vPh = aPh; vY = position.y;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const FIL_FS = COMMON + /* glsl */ `
varying float vU; varying float vPh; varying float vY;
void main(){
  float flow = 0.5 + 0.5 * sin(uTime * 1.6 - vU * 9.0 + vPh);
  float pg = pulseGlow(vY);
  vec3 col = mix(vec3(0.2, 0.9, 1.0), vec3(0.65, 0.35, 1.0), vU);
  float a = (0.10 + flow * 0.45 + pg * 0.9 + uEnergy * 0.4) * uIntro;
  gl_FragColor = vec4(col, a);
}`;

const TEN_VS = COMMON + /* glsl */ `
attribute float aT; attribute float aPhase; attribute float aAng; attribute float aKind;
uniform vec2 uPointer; uniform vec2 uVel; uniform vec3 uGroup;
varying float vT; varying float vPhase; varying float vKind; varying float vGlow;
void main(){
  vec3 p = position;
  float t = uTime;
  float breath = 1.0 + 0.06 * sin(t * 1.1) + 0.05 * uEnergy;
  p.xz *= mix(1.0, breath, 1.0 - aT);
  float amp = mix(0.14, 0.22, aKind);
  float sway = sin(t * 0.9 + aPhase - aT * 3.5) * amp + sin(t * 0.5 + aPhase * 2.3 - aT * 2.0) * amp * 0.7;
  vec3 off = vec3(cos(aAng), 0.0, sin(aAng)) * sway * pow(aT, 1.2) * (1.0 + uEnergy * 1.4);
  vec2 radial = normalize(p.xz + 0.0001);
  off.xz += radial * uEnergy * (0.55 + 0.4 * aKind) * aT * aT;
  off.xz += vec2(cos(aAng), sin(aAng)) * pow(aT, 1.5) * 0.28 * sin(aT * 5.0 + aPhase + uTime * 0.2);
  off.xy -= uVel * aT * aT * 0.8;
  vec2 wp = p.xy + off.xy + uGroup.xy;
  vec2 d = wp - uPointer; float dist = length(d) + 0.001;
  off.xy += (d / dist) * exp(-dist * dist * 1.6) * 0.5 * aT;
  float pg = pulseGlow(position.y);
  off.xz *= 1.0 + pg * 0.3;
  p += off;
  vT = aT; vPhase = aPhase; vKind = aKind; vGlow = pg;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const TEN_FS = COMMON + /* glsl */ `
varying float vT; varying float vPhase; varying float vKind; varying float vGlow;
void main(){
  vec3 col = mix(vec3(0.15, 0.85, 1.0), vec3(0.62, 0.30, 1.0), clamp(vT * 1.2, 0.0, 1.0));
  float bead = pow(0.5 + 0.5 * sin(vT * 40.0 - uTime * 1.5 + vPhase), 6.0);
  col += bead * vec3(0.5, 0.8, 1.0) * 0.6;
  col += vGlow * vec3(0.8, 0.95, 1.0);
  float root = smoothstep(0.0, 0.14, vT);
  float a = ((1.0 - vT * 0.55) * 0.36 + bead * 0.45 * root + vGlow * 0.7 * root + uEnergy * 0.25 * (1.0 - vT)) * mix(0.35 + 0.65 * root, 0.8, vKind) * uIntro;
  gl_FragColor = vec4(col, a);
}`;

const PART_VS = COMMON + /* glsl */ `
attribute vec3 aOffset; attribute float aSeed;
uniform vec2 uPointer; uniform float uSize;
varying float vSeed; varying float vShock; varying vec2 vUv;
void main(){
  vec3 p = aOffset;
  float t = uTime;
  p.y = mod(p.y + t * (0.04 + aSeed * 0.05) + 4.0, 8.0) - 4.0;
  p.x += sin(t * 0.2 + aSeed * 6.283) * 0.3;
  p.z += cos(t * 0.17 + aSeed * 9.0) * 0.3;
  vec2 d = p.xy - uPointer; float dist = length(d) + 0.001;
  p.xy += (d / dist) * exp(-dist * dist * 0.8) * 0.7;
  vec3 c = vec3(0.0, -0.6, 0.0);
  vec3 r = p - c; float rl = length(r) + 0.001;
  float shock = exp(-pow((rl - uPulseAge * 3.0) * 2.5, 2.0)) * uPulseStr * max(0.0, 1.0 - uPulseAge / 2.8);
  p += (r / rl) * shock * 0.6;
  vSeed = aSeed; vShock = shock; vUv = position.xy;
  vec4 mv = viewMatrix * modelMatrix * vec4(p, 1.0);
  float size = uSize * (0.5 + aSeed) * (1.0 + shock * 3.0 + uEnergy * 0.5);
  mv.xy += position.xy * size;
  gl_Position = projectionMatrix * mv;
}`;
const PART_FS = COMMON + /* glsl */ `
varying float vSeed; varying float vShock; varying vec2 vUv;
void main(){
  float d = length(vUv) * 2.0;
  float a = smoothstep(1.0, 0.0, d); a *= a;
  vec3 col = mix(vec3(0.15, 0.85, 1.0), vec3(0.6, 0.35, 1.0), step(0.55, vSeed));
  col = mix(col, vec3(1.0), step(0.93, vSeed) * 0.8);
  gl_FragColor = vec4(col, a * (0.25 + vShock * 0.9 + uEnergy * 0.25) * uIntro);
}`;

const BG_VS = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }`;
const BG_FS = /* glsl */ `
uniform float uTime, uEnergy, uPulseAge, uPulseStr, uIntro; uniform float uRays;
varying vec2 vUv;
void main(){
  vec2 q = vUv - vec2(0.5 + sin(uTime * 0.05) * 0.05, 1.3);
  float ang = atan(q.x, -q.y);
  float rays = pow(0.5 + 0.5 * sin(ang * 22.0 + sin(ang * 7.0 + uTime * 0.15) * 2.0), 3.0);
  float fall = smoothstep(1.5, 0.0, length(q));
  vec3 col = vec3(0.0, 0.012, 0.035) + vec3(0.0, 0.035, 0.09) * (1.0 - vUv.y);
  col += vec3(0.05, 0.22, 0.42) * rays * fall * 0.32 * uRays;
  col += vec3(0.1, 0.4, 0.7) * exp(-length(vUv - vec2(0.5, 0.58)) * 3.2) * (0.10 + uEnergy * 0.2 + uPulseStr * max(0.0, 1.0 - uPulseAge) * 0.1);
  col *= smoothstep(1.25, 0.25, length(vUv - 0.5) * 1.7);
  gl_FragColor = vec4(col * uIntro, 1.0);
}`;

const GLOW_VS = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const GLOW_FS = COMMON + /* glsl */ `
varying vec2 vUv;
void main(){
  float d = length(vUv - 0.5) * 2.0;
  float a = pow(smoothstep(1.0, 0.0, d), 2.2);
  float breathe = 0.85 + 0.15 * sin(uTime * 1.1);
  vec3 col = mix(vec3(0.1, 0.5, 1.0), vec3(0.55, 0.3, 1.0), vUv.y * 0.0 + (1.0 - vUv.y) * 0.7);
  gl_FragColor = vec4(col, a * (0.16 + uEnergy * 0.25 + uPulseStr * max(0.0, 1.0 - uPulseAge / 1.5) * 0.2) * breathe * uIntro);
}`;

// ───────── component ─────────
type Phase = "loading" | "ready" | "nogl";

export default function Tidelight() {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const input = useRef({ down: false, key: false, interacted: false, pulse: 0, nx: 0, ny: 0, has: false });
  const [phase, setPhase] = useState<Phase>("loading");
  const [touch, setTouch] = useState(false);
  const [touched, setTouched] = useState(false);
  const [fs, setFs] = useState(false);
  const [canFs, setCanFs] = useState(false);

  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
    setCanFs(!!document.fullscreenEnabled);
    const onFs = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const low = coarse || window.innerWidth < 768;

    void import("three").then((THREE: Three) => {
      if (disposed || !canvas.current || !stage.current) return;
      const cv = canvas.current, host = stage.current;

      let renderer: InstanceType<Three["WebGLRenderer"]>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: !low, alpha: false, powerPreference: "high-performance" });
      } catch {
        setPhase("nogl"); return;
      }
      let dpr = Math.min(window.devicePixelRatio || 1, low ? 1.5 : 2);
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x01030a, 1);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
      const LOOK_Y = -0.3;
      const U = {
        uTime: { value: 0 }, uEnergy: { value: 0 }, uPulseAge: { value: 99 }, uPulseStr: { value: 0 }, uIntro: { value: 0 },
        uPointer: { value: new THREE.Vector2(9, 9) }, uVel: { value: new THREE.Vector2() }, uGroup: { value: new THREE.Vector3() },
        uSize: { value: low ? 0.09 : 0.075 }, uRays: { value: low ? 0 : 1 },
      };
      const disposables: { dispose: () => void }[] = [];
      const mat = (vs: string, fs: string, extra: Partial<import("three").ShaderMaterialParameters> = {}) => {
        const m = new THREE.ShaderMaterial({ vertexShader: vs, fragmentShader: fs, uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, ...extra });
        disposables.push(m); return m;
      };
      const geo = <T extends import("three").BufferGeometry>(g: T) => { disposables.push(g); return g; };

      let seed = 20260514;
      const rnd = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) / 4294967296; };

      // background (fullscreen, ignores the camera)
      const bg = new THREE.Mesh(geo(new THREE.PlaneGeometry(2, 2)), mat(BG_VS, BG_FS, { blending: THREE.NormalBlending, depthTest: false }));
      bg.frustumCulled = false; bg.renderOrder = -2; scene.add(bg);

      // soft light behind the organism
      const glow = new THREE.Mesh(geo(new THREE.PlaneGeometry(1, 1)), mat(GLOW_VS, GLOW_FS));
      glow.scale.set(7, 7, 1); glow.position.set(0, -0.4, -1.2); glow.renderOrder = -1; scene.add(glow);

      const body = new THREE.Group(); scene.add(body);

      // bell: lathe of a domed profile with a flared, tucked lip
      const prof: import("three").Vector2[] = [];
      for (let i = 0; i <= 36; i++) { const a = (i / 36) * Math.PI * 0.5; prof.push(new THREE.Vector2(Math.sin(a) * (1 + 0.12 * Math.sin(a * 2)), Math.cos(a) * 0.75)); }
      prof.push(new THREE.Vector2(1.04, -0.1), new THREE.Vector2(0.96, -0.2), new THREE.Vector2(0.86, -0.22));
      const bell = new THREE.Mesh(geo(new THREE.LatheGeometry(prof, low ? 48 : 72)), mat(BELL_VS, BELL_FS, { side: THREE.DoubleSide }));
      body.add(bell);

      // inner filaments
      const nF = low ? 26 : 44, fSeg = 22, fp: number[] = [], fu: number[] = [], fph: number[] = [];
      for (let k = 0; k < nF; k++) {
        const th = (k / nF) * Math.PI * 2 + rnd() * 0.1, ph = rnd() * 6.28, wob = rnd() * 0.12;
        let prev: number[] | null = null;
        for (let j = 0; j <= fSeg; j++) {
          const u = j / fSeg, r = 0.82 * Math.sin(u * 1.45) + wob * Math.sin(u * 6 + ph), y = 0.62 * Math.cos(u * 1.45) - 0.05;
          const cur = [Math.cos(th + u * 0.25) * r, y, Math.sin(th + u * 0.25) * r];
          if (prev) { fp.push(...prev, ...cur); fu.push((j - 1) / fSeg, u); fph.push(ph, ph); }
          prev = cur;
        }
      }
      const fg = geo(new THREE.BufferGeometry());
      fg.setAttribute("position", new THREE.Float32BufferAttribute(fp, 3));
      fg.setAttribute("aU", new THREE.Float32BufferAttribute(fu, 1));
      fg.setAttribute("aPh", new THREE.Float32BufferAttribute(fph, 1));
      const fil = new THREE.LineSegments(fg, mat(FIL_VS, FIL_FS)); fil.frustumCulled = false; body.add(fil);

      // tentacles: one merged tube geometry, animated entirely in the vertex shader
      const nLong = low ? 10 : 18, nShort = low ? 4 : 6, seg = low ? 32 : 48, rad = 5;
      const pos: number[] = [], aT: number[] = [], aPhase: number[] = [], aAng: number[] = [], aKind: number[] = [], idx: number[] = [];
      for (let i = 0; i < nLong + nShort; i++) {
        const short = i >= nLong, n = short ? nShort : nLong, ii = short ? i - nLong : i;
        const th = (ii / n) * Math.PI * 2 + rnd() * 0.25, r0 = short ? 0.12 + rnd() * 0.25 : 0.7 + rnd() * 0.2;
        const len = short ? 0.9 + rnd() * 0.6 : 1.8 + rnd() * 1.2, rr = short ? 0.06 : 0.026 + rnd() * 0.01, y0 = short ? -0.1 : -0.05;
        const ph = rnd() * 6.28, ang = rnd() * 6.28, base = pos.length / 3;
        for (let j = 0; j <= seg; j++) {
          const t = j / seg, rt = rr * (1 - t * 0.85);
          for (let k = 0; k < rad; k++) {
            const f = (k / rad) * Math.PI * 2;
            pos.push(Math.cos(th) * r0 + Math.cos(f) * rt, y0 - t * len, Math.sin(th) * r0 + Math.sin(f) * rt);
            aT.push(t); aPhase.push(ph); aAng.push(ang); aKind.push(short ? 1 : 0);
          }
        }
        for (let j = 0; j < seg; j++) for (let k = 0; k < rad; k++) {
          const a = base + j * rad + k, b = base + j * rad + ((k + 1) % rad), c = a + rad, d = b + rad;
          idx.push(a, c, b, b, c, d);
        }
      }
      const tg = geo(new THREE.BufferGeometry());
      tg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      tg.setAttribute("aT", new THREE.Float32BufferAttribute(aT, 1));
      tg.setAttribute("aPhase", new THREE.Float32BufferAttribute(aPhase, 1));
      tg.setAttribute("aAng", new THREE.Float32BufferAttribute(aAng, 1));
      tg.setAttribute("aKind", new THREE.Float32BufferAttribute(aKind, 1));
      tg.setIndex(idx);
      const ten = new THREE.Mesh(tg, mat(TEN_VS, TEN_FS, { side: THREE.DoubleSide })); ten.frustumCulled = false; body.add(ten);

      // instanced particles (camera-facing quads)
      const nP = low ? 320 : 900;
      const pg = new THREE.InstancedBufferGeometry();
      const quad = new THREE.PlaneGeometry(1, 1);
      pg.index = quad.index; pg.setAttribute("position", quad.getAttribute("position"));
      const off = new Float32Array(nP * 3), sd = new Float32Array(nP);
      for (let i = 0; i < nP; i++) { off[i * 3] = (rnd() - 0.5) * 12; off[i * 3 + 1] = (rnd() - 0.5) * 8; off[i * 3 + 2] = -5 + rnd() * 7; sd[i] = rnd(); }
      pg.setAttribute("aOffset", new THREE.InstancedBufferAttribute(off, 3));
      pg.setAttribute("aSeed", new THREE.InstancedBufferAttribute(sd, 1));
      pg.instanceCount = nP; disposables.push(pg, quad);
      const parts = new THREE.Mesh(pg, mat(PART_VS, PART_FS)); parts.frustumCulled = false; scene.add(parts);

      // ── input ──
      const inp = input.current;
      const halfH = () => Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      const setPointer = (e: PointerEvent) => {
        const r = cv.getBoundingClientRect();
        inp.nx = ((e.clientX - r.left) / r.width) * 2 - 1; inp.ny = -(((e.clientY - r.top) / r.height) * 2 - 1); inp.has = true;
      };
      const markTouched = () => { if (!inp.interacted) { inp.interacted = true; setTouched(true); } };
      const onDown = (e: PointerEvent) => { setPointer(e); inp.down = true; inp.pulse = 0.8; markTouched(); };
      const onMove = (e: PointerEvent) => { setPointer(e); if (e.pointerType !== "touch") markTouched(); };
      const onUp = () => { if (inp.down && energy > 0.6) inp.pulse = 1.3; inp.down = false; };
      const onLeave = () => { if (!inp.down) inp.has = false; };
      const onKeyDown = (e: KeyboardEvent) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); inp.key = true; inp.pulse = 0.8; markTouched(); } };
      const onKeyUp = (e: KeyboardEvent) => { if (e.key === " " || e.key === "Enter") { if (inp.key && energy > 0.6) inp.pulse = 1.3; inp.key = false; } };
      cv.addEventListener("pointerdown", onDown); cv.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp); window.addEventListener("pointercancel", onUp); cv.addEventListener("pointerleave", onLeave);
      cv.addEventListener("keydown", onKeyDown); cv.addEventListener("keyup", onKeyUp);
      const onLost = (e: Event) => { e.preventDefault(); setPhase("nogl"); };
      cv.addEventListener("webglcontextlost", onLost);

      // ── sizing ──
      const resize = () => {
        const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.position.set(0, LOOK_Y, Math.min(14, 9.4 * Math.max(1, 1.15 / camera.aspect)));
        camera.lookAt(0, LOOK_Y, 0); camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize); ro.observe(host);

      // ── loop ──
      let energy = 0, t = 0, last = performance.now(), raf = 0, visible = true, pulseT = -99, idleT = 0, introT = 0, ema = 0.016, slow = 0;
      const sp = new THREE.Vector2(), prev = new THREE.Vector2(), vel = new THREE.Vector2();
      const timeScale = reduced ? 0.3 : 1;
      const INTRO = reduced ? 1 : 3.2;
      const io = new IntersectionObserver(([e]) => { const v = e.isIntersecting; if (v && !visible) { last = performance.now(); } visible = v; });
      io.observe(host);

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (!visible || document.hidden) { last = now; return; }
        const rawDt = Math.min(0.05, (now - last) / 1000); last = now;
        const dt = rawDt * timeScale;
        t += dt;
        ema = ema * 0.95 + rawDt * 0.05;
        if (ema > 0.026 && dpr > 1) { if (++slow > 90) { dpr = Math.max(1, dpr * 0.75); renderer.setPixelRatio(dpr); resize(); slow = 0; ema = 0.016; } } else slow = 0;

        introT = Math.min(1, introT + rawDt / INTRO);
        const ie = 1 - Math.pow(1 - introT, 3);

        // input → state
        const holding = inp.down || inp.key;
        energy = holding ? Math.min(reduced ? 0.35 : 1, energy + rawDt * 0.45) : Math.max(0, energy - rawDt * 0.5);
        if (inp.pulse) { pulseT = t; U.uPulseStr.value = inp.pulse; inp.pulse = 0; idleT = 0; }
        idleT += rawDt;
        if (!reduced && !holding && idleT > 9 && introT >= 1) { pulseT = t; U.uPulseStr.value = 0.35; idleT = 0; }

        // pointer in world space (z = 0 plane)
        const hh = halfH();
        if (inp.has) { sp.x += (inp.nx * hh * camera.aspect - sp.x) * Math.min(1, rawDt * 7); sp.y += (LOOK_Y + inp.ny * hh - sp.y) * Math.min(1, rawDt * 7); }
        else { sp.x += (0 - sp.x) * Math.min(1, rawDt * 1.5); sp.y += (9 - sp.y) * Math.min(1, rawDt * 0.4); if (sp.y > 4) sp.y = 9; }
        const inv = rawDt > 0 ? 1 / rawDt : 0;
        vel.x += ((sp.x - prev.x) * inv * 0.05 - vel.x) * Math.min(1, rawDt * 5);
        vel.y += ((sp.y - prev.y) * inv * 0.05 - vel.y) * Math.min(1, rawDt * 5);
        vel.x = Math.max(-1, Math.min(1, vel.x)); vel.y = Math.max(-1, Math.min(1, vel.y));
        if (sp.y < 8) prev.copy(sp);

        // the organism drifts gently toward the pointer
        const tx = inp.has ? sp.x * 0.3 : 0, ty = 0.95 + Math.sin(t * 0.5) * 0.12 + (inp.has ? (sp.y - LOOK_Y) * 0.12 : 0);
        body.position.x += (tx - body.position.x) * Math.min(1, rawDt * 1.6);
        body.position.y += (ty - body.position.y) * Math.min(1, rawDt * 1.6);
        body.rotation.y = Math.sin(t * 0.25) * 0.25 + body.position.x * 0.25;
        body.rotation.z = -vel.x * 0.12;
        body.scale.setScalar(0.72 + 0.28 * ie);
        camera.position.z = Math.min(14, 9.4 * Math.max(1, 1.15 / camera.aspect)) + (1 - ie) * 2.5;
        camera.lookAt(0, LOOK_Y, 0);

        U.uTime.value = t; U.uEnergy.value = energy; U.uIntro.value = ie; U.uPulseAge.value = t - pulseT;
        U.uPointer.value.copy(sp); U.uVel.value.copy(vel); U.uGroup.value.copy(body.position);
        renderer.render(scene, camera);
        if (phaseRef.current === "loading") { phaseRef.current = "ready"; setPhase("ready"); }
      };
      const phaseRef = { current: "loading" as Phase };
      raf = requestAnimationFrame(frame);

      cleanup = () => {
        cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
        cv.removeEventListener("pointerdown", onDown); cv.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp); window.removeEventListener("pointercancel", onUp); cv.removeEventListener("pointerleave", onLeave);
        cv.removeEventListener("keydown", onKeyDown); cv.removeEventListener("keyup", onKeyUp); cv.removeEventListener("webglcontextlost", onLost);
        disposables.forEach((d) => d.dispose());
        renderer.dispose(); renderer.forceContextLoss();
      };
    }).catch(() => setPhase("nogl"));

    return () => { disposed = true; cleanup(); };
  }, []);

  const toggleFs = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void stage.current?.requestFullscreen?.();
  }, []);

  return (
    <div
      ref={stage}
      className="relative isolate overflow-hidden rounded-2xl border border-line bg-[#01030a]"
      style={{ height: fs ? "100vh" : "min(82vh, 820px)", minHeight: fs ? undefined : 520 }}
    >
      <canvas
        ref={canvas}
        role="img"
        tabIndex={0}
        aria-label="Tidelight: a glowing, translucent deep-sea organism with flowing tentacles. Move the pointer to disturb it, click or press Space for a pulse of light, and hold to charge it."
        className={clsx("absolute inset-0 h-full w-full touch-none transition-opacity duration-[2000ms] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7fe3ff]", phase === "ready" ? "opacity-100" : "opacity-0")}
      />

      {phase === "nogl" && (
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center" style={{ background: "radial-gradient(60% 50% at 50% 45%, rgba(40,120,200,.35), rgba(70,30,140,.18) 45%, #01030a 75%)" }}>
          <p className="max-w-sm text-sm text-white/70">Tidelight needs WebGL, which isn&apos;t available in this browser or has been switched off. Try a recent Chrome, Edge, Firefox or Safari with hardware acceleration enabled.</p>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 sm:p-6">
        <Link href="/lab" className="pointer-events-auto rounded-full border border-white/20 bg-black/30 px-4 py-2 font-mono text-xs uppercase tracking-wide text-white/80 backdrop-blur transition-colors hover:border-[#7fe3ff] hover:text-[#7fe3ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7fe3ff]">← Lab</Link>
        {canFs && (
          <button onClick={toggleFs} aria-pressed={fs} className="pointer-events-auto rounded-full border border-white/20 bg-black/30 px-4 py-2 font-mono text-xs uppercase tracking-wide text-white/80 backdrop-blur transition-colors hover:border-[#7fe3ff] hover:text-[#7fe3ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7fe3ff]">
            {fs ? "Exit full screen" : "Full screen"}
          </button>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 pr-20 sm:p-8" style={{ background: "linear-gradient(to top, rgba(1,3,10,.85), transparent)" }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#7fe3ff]/80">Lab — Experiment 008</p>
        <h1 className="font-display text-5xl text-white sm:text-7xl" style={{ letterSpacing: "-0.04em" }}>Tidelight</h1>
        <p className="max-w-md text-sm text-white/65 sm:text-base">A creature of glass and light, adrift in a deep digital ocean. It breathes, it notices you, and it answers when you touch the water.</p>
        <p aria-live="polite" className={clsx("font-mono text-[11px] uppercase tracking-[0.18em] text-white/55 transition-opacity duration-1000", touched ? "opacity-0" : "opacity-100")}>
          {touch ? "Drag to disturb · tap for a pulse · press and hold to charge" : "Move to disturb · click for a pulse · hold to charge"}
        </p>
      </div>
    </div>
  );
}

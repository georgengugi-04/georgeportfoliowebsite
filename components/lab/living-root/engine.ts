import * as THREE from "three";
import { makeNoise, makeRng } from "./noise";
import { makeBark, makeSoil, makeStrata, makeMoss, makeLeaf, makeFlower, makeRadial, makeShaft } from "./textures";
import { patch, makeUniforms, GROW_FULL } from "./shaderPatch";
import { buildTree, buildUnderRoots, leafGeometry, bladeGeometry, frondGeometry, stoneGeometry, cushionGeometry, baseHeight, type PerchSite } from "./geometry";
import { Butterfly, SPECIES_INFO, type SpeciesId } from "./butterflies";

export type Mood = "morning" | "afternoon" | "evening";
export type Selection = { kind: "tree" } | { kind: "butterfly"; id: SpeciesId };

export type ForestOptions = {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  reduced: boolean;
  quality: "auto" | "high" | "low";
  onSelect: (s: Selection) => void;
  onGrowth: (progress: number, done: boolean) => void;
  onCinematicEnd: () => void;
  onTier: (tier: number) => void;
};

export type Forest = {
  setWind(v: number): void;
  gust(): void;
  setMood(m: Mood, instant?: boolean): void;
  setInspect(on: boolean): void;
  startGrowth(): void;
  setGrowth(p: number): void;
  finishGrowth(): void;
  setCinematic(on: boolean): void;
  resetCamera(): void;
  zoom(f: number): void;
  follow(id: SpeciesId | null): void;
  focusBark(): void;
  focusFoliage(): void;
  resize(): void;
  dispose(): void;
  species: SpeciesId[];
};

const MOODS: Record<
  Mood,
  { az: number; el: number; sun: number; sunInt: number; sky: number; ground: number; hemi: number; fog: number; fogD: number; exp: number; shafts: number; act: number }
> = {
  morning: { az: -72, el: 20, sun: 0xffd4a0, sunInt: 3.1, sky: 0xbfd2d8, ground: 0x3b3b22, hemi: 0.62, fog: 0xc4cebe, fogD: 0.018, exp: 0.95, shafts: 0.1, act: 1.0 },
  afternoon: { az: 35, el: 54, sun: 0xfff0d6, sunInt: 3.5, sky: 0xaacbe2, ground: 0x41502a, hemi: 0.78, fog: 0xa9c1b0, fogD: 0.0105, exp: 1.0, shafts: 0.07, act: 0.85 },
  evening: { az: 78, el: 11, sun: 0xff9650, sunInt: 3.0, sky: 0x8a86b0, ground: 0x3a2c1c, hemi: 0.95, fog: 0x625a70, fogD: 0.014, exp: 1.12, shafts: 0.1, act: 0.4 },
};

const sstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export async function createForest(o: ForestOptions): Promise<Forest> {
  const { canvas, container, reduced } = o;
  const mobile = window.innerWidth < 760 || window.matchMedia("(pointer: coarse)").matches;
  const quality: "high" | "low" = o.quality === "auto" ? (mobile ? "low" : "high") : o.quality;
  const HI = quality === "high";
  const yieldUi = () => new Promise<void>((r) => setTimeout(r, 0));

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: HI, powerPreference: "high-performance" });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled = true;
  const dprCap = HI ? 2 : 1.5;
  let tier = 0;
  const setDpr = () => renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tier >= 1 ? 1 : dprCap));
  setDpr();

  const scene = new THREE.Scene();
  const fog = new THREE.FogExp2(0xa9c1b0, 0.016);
  scene.fog = fog;
  scene.background = new THREE.Color(0xa9c1b0);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 220);

  const U = makeUniforms();
  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(x: T) => {
    disposables.push(x);
    return x;
  };

  const rnd = makeRng(20260711);
  const rr = (lo: number, hi: number) => lo + (hi - lo) * rnd();
  const noise = makeNoise(4242);
  const dummy = new THREE.Object3D();
  const col = new THREE.Color();

  // ---------- environment (soft image-based ambient so PBR materials read as lit by sky + ground) ----------
  {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader:
        "varying vec3 vP; void main(){ float h = vP.y; vec3 top = vec3(0.50,0.66,0.85); vec3 mid = vec3(0.38,0.5,0.32); vec3 bot = vec3(0.12,0.1,0.06); vec3 c = h > 0.0 ? mix(mid, top, smoothstep(0.0, 0.85, h)) : mix(mid, bot, smoothstep(0.0, -0.45, h)); gl_FragColor = vec4(c, 1.0); }",
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), skyMat);
    envScene.add(sky);
    const rt = pmrem.fromScene(envScene);
    scene.environment = rt.texture;
    track(rt);
    sky.geometry.dispose();
    skyMat.dispose();
    pmrem.dispose();
  }

  // ---------- textures ----------
  const bark = makeBark(HI ? 512 : 256, 11);
  await yieldUi();
  const soil = makeSoil(HI ? 256 : 192, 23);
  const strata = makeStrata(256, 128, 5);
  const mossT = makeMoss(128, 9);
  const leafTex = makeLeaf(false);
  const dryTex = makeLeaf(true);
  const flowerTex = makeFlower();
  const shadowTex = makeRadial([[0, "rgba(0,0,0,0.75)"], [0.5, "rgba(0,0,0,0.35)"], [1, "rgba(0,0,0,0)"]]);
  const pollenTex = makeRadial([[0, "rgba(255,246,210,1)"], [0.35, "rgba(255,230,170,0.5)"], [1, "rgba(255,220,150,0)"]]);
  const shaftTex = makeShaft(3);
  [bark.map, bark.bump, soil.map, soil.bump, strata, mossT.map, mossT.bump, leafTex, dryTex, flowerTex, shadowTex, pollenTex, shaftTex].forEach((t) => track(t));
  await yieldUi();

  // ---------- lights ----------
  const hemi = new THREE.HemisphereLight(0xaacbe2, 0x41502a, 0.7);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d6, 3.5);
  sun.castShadow = true;
  const smap = HI ? 2048 : 1024;
  sun.shadow.mapSize.set(smap, smap);
  const sc = sun.shadow.camera;
  sc.left = -17;
  sc.right = 17;
  sc.top = 17;
  sc.bottom = -17;
  sc.near = 1;
  sc.far = 90;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.04;
  sun.shadow.radius = 3;
  scene.add(sun, sun.target);
  sun.target.position.set(0, 3, 0);

  // ---------- tree & roots ----------
  const tree = buildTree(rnd, noise, quality);
  const rootSamples: { x: number; z: number; r: number }[] = [];
  tree.roots.forEach((rt) => {
    for (let i = 0; i < rt.pts.length - 1; i++) {
      for (let k = 0; k < 3; k++) {
        const f = k / 3;
        const p = rt.pts[i].clone().lerp(rt.pts[i + 1], f);
        const r = rt.radii[i] + (rt.radii[i + 1] - rt.radii[i]) * f;
        if (r > 0.04) rootSamples.push({ x: p.x, z: p.z, r });
      }
    }
  });
  const mound = (x: number, z: number) => {
    let m = 0.28 * Math.exp(-Math.pow(Math.hypot(x, z) / 2.3, 2));
    for (let i = 0; i < rootSamples.length; i++) {
      const s = rootSamples[i];
      const dx = x - s.x;
      const dz = z - s.z;
      const d2 = dx * dx + dz * dz;
      if (d2 > s.r * s.r * 20) continue;
      const v = 0.42 * s.r * Math.exp(-d2 / (2.56 * s.r * s.r));
      if (v > m) m = v;
    }
    return m;
  };
  const groundY = (x: number, z: number) => baseHeight(noise, x, z) + mound(x, z);
  const rootDist = (x: number, z: number) => {
    let best = 1e9;
    for (let i = 0; i < rootSamples.length; i++) {
      const s = rootSamples[i];
      const d = Math.hypot(x - s.x, z - s.z) - s.r;
      if (d < best) best = d;
    }
    return best;
  };

  const barkMat = new THREE.MeshStandardMaterial({ map: bark.map, bumpMap: bark.bump, bumpScale: 5, roughness: 0.96, metalness: 0, envMapIntensity: 0.35 });
  patch(barkMat, U, "tree");
  const barkDepth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  patch(barkDepth, U, "tree");
  const treeMesh = new THREE.Mesh(tree.geometry, barkMat);
  treeMesh.customDepthMaterial = barkDepth;
  treeMesh.castShadow = true;
  treeMesh.receiveShadow = true;
  scene.add(treeMesh);
  track(tree.geometry);
  track(barkMat);
  track(barkDepth);

  // leaves
  const buildLeafMesh = (geo: THREE.BufferGeometry, count: number, tex: THREE.Texture, rough: number) => {
    const mat = new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: rough, envMapIntensity: 0.45 });
    patch(mat, U, "leaf");
    const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 });
    patch(depth, U, "leaf");
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    mesh.customDepthMaterial = depth;
    track(mat);
    track(depth);
    track(geo);
    return mesh;
  };
  const leafG = new Float32Array(tree.leaves.length);
  const leafMesh = buildLeafMesh(leafGeometry(0.46, 0.84, 0.32), tree.leaves.length, leafTex, 0.6);
  const lowLeafSites: PerchSite[] = [];
  tree.leaves.forEach((lf, i) => {
    leafMesh.setMatrixAt(i, lf.m);
    leafG[i] = lf.g;
    const r = rnd();
    col.setRGB(0.62 + r * 0.55, 0.78 + rnd() * 0.4, 0.45 + rnd() * 0.4);
    if (rnd() < 0.08) col.setRGB(1.1, 1.0, 0.45);
    if (rnd() < 0.1) col.multiplyScalar(0.7);
    leafMesh.setColorAt(i, col);
    if (lf.low && rnd() < 0.06) {
      const p = new THREE.Vector3().setFromMatrixPosition(lf.m);
      p.addScaledVector(new THREE.Vector3(0, 1, 0).transformDirection(lf.m), 0.3);
      lowLeafSites.push({ pos: p, up: new THREE.Vector3(0, 1, 0), kind: "leaf" });
    }
  });
  leafMesh.geometry.setAttribute("aLeafG", new THREE.InstancedBufferAttribute(leafG, 1));
  leafMesh.castShadow = true;
  leafMesh.receiveShadow = true;
  leafMesh.frustumCulled = false;
  scene.add(leafMesh);
  await yieldUi();

  // ---------- ground ----------
  const soilMatDefs = { map: soil.map, bumpMap: soil.bump, bumpScale: 3, roughness: 1, metalness: 0, envMapIntensity: 0.3 };
  const groundMat = new THREE.MeshStandardMaterial({ ...soilMatDefs, vertexColors: true });
  track(groundMat);
  const clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
  const buildGround = (size: number, seg: number, detailed: boolean) => {
    const g = new THREE.PlaneGeometry(size, size, seg, seg);
    g.rotateX(-Math.PI / 2);
    const p = g.getAttribute("position") as THREE.BufferAttribute;
    const uv = g.getAttribute("uv") as THREE.BufferAttribute;
    const colors = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      let y = baseHeight(noise, x, z);
      let ao = 1;
      if (detailed) {
        y = groundY(x, z);
        const d = Math.max(0, rootDist(x, z));
        ao = 1 - 0.5 * Math.exp(-Math.pow(d / 0.35, 2)) - 0.25 * Math.exp(-Math.pow(Math.hypot(x, z) / 2.2, 2));
      }
      p.setY(i, y);
      const v = (0.82 + 0.34 * noise.fbm(x * 0.35 + 7, z * 0.35, 256, 256, 3)) * ao;
      colors[i * 3] = v;
      colors[i * 3 + 1] = v;
      colors[i * 3 + 2] = v;
      uv.setXY(i, (x / 3.4), (z / 3.4));
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  };
  const innerGround = new THREE.Mesh(buildGround(30, HI ? 200 : 120, true), groundMat);
  innerGround.receiveShadow = true;
  const outerGround = new THREE.Mesh(buildGround(440, 44, false), groundMat);
  outerGround.position.y = -0.08;
  outerGround.receiveShadow = true;
  scene.add(innerGround, outerGround);
  track(innerGround.geometry);
  track(outerGround.geometry);
  await yieldUi();

  // ---------- forest floor ----------
  const perch: PerchSite[] = [...lowLeafSites];
  const plantMat = (extra: THREE.MeshStandardMaterialParameters) => {
    const m = new THREE.MeshStandardMaterial({ roughness: 0.85, side: THREE.DoubleSide, envMapIntensity: 0.4, ...extra });
    patch(m, U, "plant");
    track(m);
    return m;
  };

  // grass
  const grassCount = HI ? 9000 : 3200;
  const blade = bladeGeometry();
  track(blade);
  const grass = new THREE.InstancedMesh(blade, plantMat({ vertexColors: true, roughness: 0.9 }), grassCount);
  {
    let n = 0;
    let tries = 0;
    while (n < grassCount && tries < grassCount * 6) {
      tries++;
      const rad = Math.sqrt(rnd()) * 15;
      const a = rnd() * Math.PI * 2;
      const x = Math.cos(a) * rad;
      const z = Math.sin(a) * rad;
      if (rad < 2.6 && rnd() < 0.85) continue;
      if (rad < 1.7) continue;
      const dens = sstep(0.34, 0.7, noise.fbm(x * 0.22 + 30, z * 0.22, 256, 256, 3));
      if (rnd() > dens * 0.92 + 0.05) continue;
      if (rootDist(x, z) < 0.3) continue;
      const tall = rnd() < 0.12 ? 1.5 : 1;
      dummy.position.set(x, groundY(x, z) - 0.02, z);
      dummy.rotation.set(rr(-0.18, 0.18), rnd() * Math.PI * 2, rr(-0.18, 0.18));
      dummy.scale.set(rr(0.8, 1.6), rr(0.2, 0.55) * tall, 1);
      dummy.updateMatrix();
      grass.setMatrixAt(n, dummy.matrix);
      if (rnd() < 0.12) col.setHSL(0.13, 0.4, 0.34, THREE.SRGBColorSpace);
      else col.setHSL(rr(0.22, 0.3), rr(0.38, 0.6), rr(0.17, 0.34), THREE.SRGBColorSpace);
      grass.setColorAt(n, col);
      n++;
    }
    grass.count = n;
  }
  grass.receiveShadow = true;
  grass.frustumCulled = false;
  scene.add(grass);

  // ferns
  const fernClusters = HI ? 34 : 16;
  const frond = frondGeometry();
  track(frond);
  const fernMat = plantMat({ map: leafTex, alphaTest: 0.45, vertexColors: true, roughness: 0.7 });
  const fernTotal = fernClusters * 10;
  const ferns = new THREE.InstancedMesh(frond, fernMat, fernTotal);
  {
    let n = 0;
    let c = 0;
    let tries = 0;
    while (c < fernClusters && tries < 800) {
      tries++;
      const rad = 2.6 + Math.sqrt(rnd()) * 11;
      const a = rnd() * Math.PI * 2;
      const x = Math.cos(a) * rad;
      const z = Math.sin(a) * rad;
      if (rootDist(x, z) < 0.3) continue;
      if (noise.fbm(x * 0.3 + 90, z * 0.3, 256, 256, 3) < 0.42) continue;
      c++;
      const fronds = 7 + Math.floor(rnd() * 4);
      const cs = rr(0.5, 1.0);
      const off = rnd() * 6;
      for (let f = 0; f < fronds && n < fernTotal; f++) {
        dummy.position.set(x, groundY(x, z) + 0.02, z);
        dummy.rotation.set(0, off + (f / fronds) * Math.PI * 2 + rr(-0.25, 0.25), rr(-0.1, 0.25), "YXZ");
        const s = cs * rr(0.8, 1.2);
        dummy.scale.set(s, s * rr(0.85, 1.15), s);
        dummy.updateMatrix();
        ferns.setMatrixAt(n, dummy.matrix);
        col.setRGB(rr(0.7, 1.0), rr(0.85, 1.12), rr(0.6, 0.9));
        ferns.setColorAt(n, col);
        n++;
      }
    }
    ferns.count = n;
  }
  ferns.receiveShadow = true;
  ferns.castShadow = false;
  ferns.frustumCulled = false;
  scene.add(ferns);

  // wildflowers
  const flowerCount = HI ? 80 : 36;
  const stemGeo = new THREE.CylinderGeometry(0.007, 0.011, 1, 5);
  stemGeo.translate(0, 0.5, 0);
  {
    const p = stemGeo.getAttribute("position") as THREE.BufferAttribute;
    const sw: number[] = [];
    for (let i = 0; i < p.count; i++) sw.push(p.getY(i));
    stemGeo.setAttribute("aSway", new THREE.Float32BufferAttribute(sw, 1));
  }
  const headGeo = new THREE.PlaneGeometry(0.22, 0.22);
  headGeo.rotateX(-Math.PI / 2);
  headGeo.setAttribute("aSway", new THREE.Float32BufferAttribute(new Array(4).fill(1), 1));
  track(stemGeo);
  track(headGeo);
  const stems = new THREE.InstancedMesh(stemGeo, plantMat({ color: 0x3f6a2a }), flowerCount);
  const heads = new THREE.InstancedMesh(headGeo, plantMat({ map: flowerTex, alphaTest: 0.5, roughness: 0.7 }), flowerCount);
  {
    let n = 0;
    let tries = 0;
    const palette: [number, number, number][] = [
      [1, 1, 1],
      [1, 0.94, 0.7],
      [1, 0.72, 0.8],
      [1, 0.84, 0.32],
      [0.85, 0.78, 1],
    ];
    while (n < flowerCount && tries < 2000) {
      tries++;
      const rad = 2.4 + Math.sqrt(rnd()) * 9;
      const a = rnd() * Math.PI * 2;
      const x = Math.cos(a) * rad;
      const z = Math.sin(a) * rad;
      if (rootDist(x, z) < 0.25) continue;
      if (noise.fbm(x * 0.4 + 200, z * 0.4, 256, 256, 3) < 0.55) continue;
      const h = rr(0.35, 0.8);
      const tx = rr(-0.18, 0.18);
      const tz = rr(-0.18, 0.18);
      const gy = groundY(x, z);
      dummy.position.set(x, gy, z);
      dummy.rotation.set(tx, 0, tz);
      dummy.scale.set(1, h, 1);
      dummy.updateMatrix();
      stems.setMatrixAt(n, dummy.matrix);
      // tip position follows the stem's tilt
      const tip = new THREE.Vector3(0, h, 0).applyEuler(dummy.rotation).add(dummy.position);
      dummy.position.copy(tip);
      dummy.rotation.set(tx * 0.6, rnd() * 6.28, tz * 0.6);
      const hs = rr(0.8, 1.35);
      dummy.scale.set(hs, hs, hs);
      dummy.updateMatrix();
      heads.setMatrixAt(n, dummy.matrix);
      const c0 = palette[Math.floor(rnd() * palette.length)];
      col.setRGB(c0[0], c0[1], c0[2]);
      heads.setColorAt(n, col);
      perch.push({ pos: tip.clone().add(new THREE.Vector3(0, 0.02, 0)), up: new THREE.Vector3(0, 1, 0), kind: "flower" });
      n++;
    }
    stems.count = heads.count = n;
  }
  stems.receiveShadow = true;
  stems.frustumCulled = heads.frustumCulled = false;
  scene.add(stems, heads);

  // fallen leaves
  const litterCount = HI ? 260 : 110;
  const litterGeo = leafGeometry(0.32, 0.56, 0.12);
  litterGeo.rotateX(-Math.PI / 2);
  const litter = buildLeafMesh(litterGeo, litterCount, dryTex, 0.85);
  litter.geometry.setAttribute("aLeafG", new THREE.InstancedBufferAttribute(new Float32Array(litterCount).fill(-1), 1));
  {
    let n = 0;
    let tries = 0;
    const tones: [number, number, number][] = [
      [1.0, 0.9, 0.7],
      [1.25, 0.9, 0.5],
      [0.8, 0.85, 0.6],
      [0.7, 0.6, 0.45],
      [0.6, 0.9, 0.35],
    ];
    while (n < litterCount && tries < litterCount * 6) {
      tries++;
      const rad = 0.9 + Math.sqrt(rnd()) * 11;
      const a = rnd() * Math.PI * 2;
      const x = Math.cos(a) * rad;
      const z = Math.sin(a) * rad;
      const d = rootDist(x, z);
      if (d < 0.02 && rnd() < 0.6) continue;
      dummy.position.set(x, groundY(x, z) + 0.015 + rnd() * 0.02, z);
      dummy.rotation.set(rr(-0.08, 0.08), rnd() * 6.28, rr(-0.08, 0.08), "YXZ");
      const s = rr(0.7, 1.3);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      litter.setMatrixAt(n, dummy.matrix);
      const t = tones[Math.floor(rnd() * tones.length)];
      col.setRGB(t[0] * rr(0.85, 1.1), t[1] * rr(0.85, 1.1), t[2]);
      litter.setColorAt(n, col);
      n++;
    }
    litter.count = n;
  }
  litter.castShadow = false;
  litter.receiveShadow = true;
  litter.frustumCulled = false;
  scene.add(litter);

  // twigs
  const twigCount = HI ? 90 : 36;
  const twigGeo = new THREE.CylinderGeometry(0.012, 0.02, 1, 5);
  twigGeo.rotateZ(Math.PI / 2);
  const twigMat = new THREE.MeshStandardMaterial({ map: bark.map, roughness: 1, color: 0x9a8a78 });
  track(twigGeo);
  track(twigMat);
  const twigs = new THREE.InstancedMesh(twigGeo, twigMat, twigCount);
  for (let i = 0; i < twigCount; i++) {
    const rad = 1 + Math.sqrt(rnd()) * 11;
    const a = rnd() * 6.28;
    const x = Math.cos(a) * rad;
    const z = Math.sin(a) * rad;
    dummy.position.set(x, groundY(x, z) + 0.03, z);
    dummy.rotation.set(0, rnd() * 6.28, rr(-0.12, 0.12));
    dummy.scale.set(rr(0.3, 1.1), rr(0.8, 1.6), rr(0.8, 1.6));
    dummy.updateMatrix();
    twigs.setMatrixAt(i, dummy.matrix);
  }
  twigs.receiveShadow = true;
  twigs.castShadow = HI;
  scene.add(twigs);

  // stones
  const stoneCount = HI ? 34 : 16;
  const stoneGeo = stoneGeometry(noise);
  const stoneMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, envMapIntensity: 0.4 });
  track(stoneGeo);
  track(stoneMat);
  const stones = new THREE.InstancedMesh(stoneGeo, stoneMat, stoneCount);
  const decals: { x: number; z: number; r: number }[] = [{ x: 0, z: 0, r: 3.6 }];
  for (let i = 0; i < stoneCount; i++) {
    let x = 0;
    let z = 0;
    for (let k = 0; k < 12; k++) {
      const rad = 1.4 + Math.sqrt(rnd()) * 10;
      const a = rnd() * 6.28;
      x = Math.cos(a) * rad;
      z = Math.sin(a) * rad;
      if (rootDist(x, z) > 0.2) break;
    }
    const s = Math.pow(rnd(), 2) * 0.42 + 0.1;
    const y = groundY(x, z) + s * 0.12;
    dummy.position.set(x, y, z);
    dummy.rotation.set(rr(-0.2, 0.2), rnd() * 6.28, rr(-0.2, 0.2));
    dummy.scale.set(s * rr(0.9, 1.5), s * rr(0.7, 1.1), s * rr(0.9, 1.5));
    dummy.updateMatrix();
    stones.setMatrixAt(i, dummy.matrix);
    decals.push({ x, z, r: s * 1.8 });
    if (s > 0.2) perch.push({ pos: new THREE.Vector3(x, y + s * 0.55, z), up: new THREE.Vector3(0, 1, 0), kind: "stone" });
  }
  stones.castShadow = HI;
  stones.receiveShadow = true;
  scene.add(stones);

  // moss cushions on roots, trunk base and between roots
  const cushionGeo = cushionGeometry(noise);
  const mossMat = new THREE.MeshStandardMaterial({ map: mossT.map, bumpMap: mossT.bump, bumpScale: 4, roughness: 1, envMapIntensity: 0.3 });
  track(cushionGeo);
  track(mossMat);
  const groundMoss = HI ? 150 : 60;
  const mossTotal = tree.mossSpots.length + groundMoss;
  const mossMesh = new THREE.InstancedMesh(cushionGeo, mossMat, mossTotal);
  let mi = 0;
  const putMoss = (x: number, y: number, z: number, s: number) => {
    dummy.position.set(x, y - s * 0.12, z);
    dummy.rotation.set(rr(-0.2, 0.2), rnd() * 6.28, rr(-0.2, 0.2));
    dummy.scale.set(s * rr(1.0, 1.9), s * rr(0.3, 0.55), s * rr(1.0, 1.9));
    dummy.updateMatrix();
    mossMesh.setMatrixAt(mi, dummy.matrix);
    col.setRGB(rr(0.75, 1.05), rr(0.85, 1.15), rr(0.65, 0.95));
    mossMesh.setColorAt(mi, col);
    mi++;
  };
  tree.mossSpots.forEach((m) => putMoss(m.pos.x, m.pos.y, m.pos.z, m.s));
  for (let i = 0; i < groundMoss; i++) {
    const s0 = rootSamples[Math.floor(rnd() * rootSamples.length)];
    const x = s0.x + rr(-0.7, 0.7);
    const z = s0.z + rr(-0.7, 0.7);
    if (rootDist(x, z) < -0.02) continue;
    putMoss(x, groundY(x, z) + 0.02, z, rr(0.1, 0.28));
  }
  mossMesh.count = mi;
  mossMesh.receiveShadow = true;
  scene.add(mossMesh);

  // contact shadows (cheap stand-in for ambient occlusion)
  rootSamples.forEach((s, i) => {
    if (s.r > 0.09 && i % 2 === 0) decals.push({ x: s.x, z: s.z, r: s.r * 2.6 });
  });
  const decalGeo = new THREE.PlaneGeometry(1, 1);
  decalGeo.rotateX(-Math.PI / 2);
  const decalMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, color: 0x000000, opacity: 0.5, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  track(decalGeo);
  track(decalMat);
  const decalMesh = new THREE.InstancedMesh(decalGeo, decalMat, decals.length);
  decals.forEach((d, i) => {
    dummy.position.set(d.x, groundY(d.x, d.z) + 0.02, d.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(d.r * 2, 1, d.r * 2);
    dummy.updateMatrix();
    decalMesh.setMatrixAt(i, dummy.matrix);
  });
  decalMesh.renderOrder = 1;
  scene.add(decalMesh);
  await yieldUi();

  // ---------- backdrop: trunks and the high canopy that dapples the floor ----------
  const bgGeo = new THREE.CylinderGeometry(0.55, 0.95, 30, 10, 1, true);
  bgGeo.translate(0, 15, 0);
  {
    const uv = bgGeo.getAttribute("uv") as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 3, uv.getY(i) * 12);
  }
  const bgMat = new THREE.MeshStandardMaterial({ map: bark.map, bumpMap: bark.bump, bumpScale: 4, roughness: 1, color: 0x9d9488, envMapIntensity: 0.3 });
  track(bgGeo);
  track(bgMat);
  const bgCount = HI ? 22 : 12;
  const bgTrunks = new THREE.InstancedMesh(bgGeo, bgMat, bgCount);
  for (let i = 0; i < bgCount; i++) {
    const a = (i / bgCount) * Math.PI * 2 + rr(-0.15, 0.15);
    const rad = rr(33, 62);
    dummy.position.set(Math.cos(a) * rad, -0.2, Math.sin(a) * rad);
    dummy.rotation.set(rr(-0.04, 0.04), rnd() * 6, rr(-0.04, 0.04));
    const s = rr(0.7, 1.6);
    dummy.scale.set(s, rr(1, 1.4), s);
    dummy.updateMatrix();
    bgTrunks.setMatrixAt(i, dummy.matrix);
  }
  bgTrunks.castShadow = HI;
  bgTrunks.receiveShadow = true;
  scene.add(bgTrunks);

  const ceilCount = HI ? 620 : 240;
  const ceilMesh = buildLeafMesh(leafGeometry(1.1, 2.0, 0.25), ceilCount, leafTex, 0.8);
  ceilMesh.geometry.setAttribute("aLeafG", new THREE.InstancedBufferAttribute(new Float32Array(ceilCount).fill(-1), 1));
  for (let i = 0; i < ceilCount; i++) {
    const rad = rr(6, 36);
    const a = rnd() * 6.28;
    dummy.position.set(Math.cos(a) * rad, rr(17, 25), Math.sin(a) * rad);
    dummy.rotation.set(rr(-1.3, 1.3), rnd() * 6.28, rr(-1.3, 1.3));
    const s = rr(1.1, 2.1);
    dummy.scale.set(s, s, s);
    dummy.updateMatrix();
    ceilMesh.setMatrixAt(i, dummy.matrix);
    col.setRGB(rr(0.3, 0.55), rr(0.5, 0.75), rr(0.25, 0.45));
    ceilMesh.setColorAt(i, col);
  }
  ceilMesh.castShadow = true;
  ceilMesh.frustumCulled = false;
  scene.add(ceilMesh);

  // ---------- light shafts ----------
  const shaftGroup = new THREE.Group();
  const shaftMat = new THREE.MeshBasicMaterial({ map: shaftTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.3, fog: false, side: THREE.DoubleSide });
  const shaftGeo = new THREE.PlaneGeometry(1, 1);
  track(shaftMat);
  track(shaftGeo);
  type Shaft = { a: THREE.Mesh; b: THREE.Mesh; gx: number; gz: number; w: number; ph: number };
  const shafts: Shaft[] = [];
  const shaftN = HI ? 11 : 6;
  for (let i = 0; i < shaftN; i++) {
    const rad = rr(2.5, 11);
    const a = rnd() * 6.28;
    const mkp = () => {
      const m = new THREE.Mesh(shaftGeo, shaftMat);
      m.renderOrder = 2;
      shaftGroup.add(m);
      return m;
    };
    shafts.push({ a: mkp(), b: mkp(), gx: Math.cos(a) * rad, gz: Math.sin(a) * rad, w: rr(1.3, 3.2), ph: rnd() * 6.28 });
  }
  scene.add(shaftGroup);

  // ---------- pollen, falling leaves ----------
  const pollenN = HI ? 190 : 80;
  const pPos = new Float32Array(pollenN * 3);
  const pSeed = new Float32Array(pollenN * 3);
  for (let i = 0; i < pollenN; i++) {
    pPos[i * 3] = rr(-11, 11);
    pPos[i * 3 + 1] = rr(0.3, 9);
    pPos[i * 3 + 2] = rr(-11, 8);
    pSeed[i * 3] = rr(0, 6.28);
    pSeed[i * 3 + 1] = rr(0.3, 1.1);
    pSeed[i * 3 + 2] = rr(0.5, 1.4);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute("seed", new THREE.BufferAttribute(pSeed, 3));
  const pMat = new THREE.ShaderMaterial({
    uniforms: { uTime: U.uTime, uWind: U.uWind, uMap: { value: pollenTex }, uAlpha: { value: 0.7 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute vec3 seed; uniform float uTime; uniform float uWind;
      varying float vA;
      void main(){
        vec3 p = position;
        p.x += sin(uTime*seed.y*0.35 + seed.x)*0.9 + uTime*0.06*uWind;
        p.y += mod(uTime*seed.y*0.07 + seed.x*2.0, 9.0);
        p.y = mod(p.y, 9.3);
        p.z += cos(uTime*seed.z*0.3 + seed.x)*0.7;
        vec4 mv = modelViewMatrix * vec4(p,1.0);
        vA = 0.55 + 0.45*sin(uTime*seed.z + seed.x*5.0);
        gl_PointSize = clamp(5.0*seed.z*(60.0/-mv.z), 1.5, 9.0);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform sampler2D uMap; uniform float uAlpha; varying float vA;
      void main(){ vec4 t = texture2D(uMap, gl_PointCoord); gl_FragColor = vec4(t.rgb, t.a * vA * uAlpha); }`,
  });
  track(pGeo);
  track(pMat);
  const pollen = new THREE.Points(pGeo, pMat);
  pollen.frustumCulled = false;
  scene.add(pollen);

  const fallN = HI ? 30 : 14;
  const fallGeo = leafGeometry(0.3, 0.54, 0.2);
  const fallMat = new THREE.MeshStandardMaterial({ map: dryTex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8 });
  track(fallGeo);
  track(fallMat);
  const falling = new THREE.InstancedMesh(fallGeo, fallMat, fallN);
  const fl = Array.from({ length: fallN }, () => ({ x: 0, y: 0, z: 0, ph: 0, sp: 0, rx: 0, ry: 0, rz: 0, vr: 0 }));
  const respawn = (f: (typeof fl)[number], fresh: boolean) => {
    const a = rnd() * 6.28;
    const r = Math.sqrt(rnd()) * 5.5;
    f.x = Math.cos(a) * r;
    f.z = Math.sin(a) * r;
    f.y = fresh ? rr(0.4, 10.5) : rr(8.5, 11);
    f.ph = rnd() * 6.28;
    f.sp = rr(0.35, 0.7);
    f.rx = rnd() * 6;
    f.ry = rnd() * 6;
    f.rz = rnd() * 6;
    f.vr = rr(0.6, 1.8);
  };
  fl.forEach((f, i) => {
    respawn(f, true);
    col.setRGB(rr(0.9, 1.3), rr(0.8, 1.1), rr(0.5, 0.9));
    falling.setColorAt(i, col);
  });
  falling.frustumCulled = false;
  falling.castShadow = false;
  scene.add(falling);
  let leafBoost = 0;

  // ---------- cross-section (inspect) ----------
  const underGeo = buildUnderRoots(rnd, noise);
  const underMat = new THREE.MeshStandardMaterial({ map: bark.map, color: 0xb39a78, roughness: 0.9, emissive: 0x2e1c0c, emissiveIntensity: 0.9, clippingPlanes: [clipPlane], envMapIntensity: 0.3 });
  const under = new THREE.Mesh(underGeo, underMat);
  const soilWallGeo = new THREE.CylinderGeometry(9.6, 9.6, 4.2, 72, 1, true);
  {
    const uv = soilWallGeo.getAttribute("uv") as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * 3);
  }
  const strataMat = new THREE.MeshStandardMaterial({ map: strata, side: THREE.BackSide, roughness: 1, clippingPlanes: [clipPlane], emissive: 0x1a1008, emissiveIntensity: 0.6 });
  const soilWall = new THREE.Mesh(soilWallGeo, strataMat);
  soilWall.position.y = -2.1;
  const floorGeo = new THREE.CircleGeometry(9.6, 48);
  floorGeo.rotateX(-Math.PI / 2);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 1, clippingPlanes: [clipPlane] });
  const soilFloor = new THREE.Mesh(floorGeo, floorMat);
  soilFloor.position.y = -4.2;
  const inspectGroup = new THREE.Group();
  inspectGroup.add(under, soilWall, soilFloor);
  inspectGroup.visible = false;
  scene.add(inspectGroup);
  [underGeo, underMat, soilWallGeo, strataMat, floorGeo, floorMat].forEach((x) => track(x));
  innerGround.material = groundMat;
  groundMat.clippingPlanes = [];

  // ---------- butterflies ----------
  const species: SpeciesId[] = ["morpho", "monarch", "swallowtail"];
  const butterflies = species.map((id) => new Butterfly(id, rnd, quality));
  butterflies.forEach((b, i) => {
    scene.add(b.group);
    const a = i * 2.1 + 0.6;
    b.placeAt(new THREE.Vector3(Math.cos(a) * 4.5, 2.2 + i * 0.9, Math.sin(a) * 4.5));
  });
  if (reduced) {
    const flowers = perch.filter((p) => p.kind === "flower");
    butterflies.forEach((b, i) => b.perchStatic(flowers[(i * 7) % Math.max(1, flowers.length)] ?? perch[i], i * 1.7));
  }

  // ---------- mood ----------
  const cur = {
    az: MOODS.afternoon.az,
    el: MOODS.afternoon.el,
    sunInt: MOODS.afternoon.sunInt,
    hemi: MOODS.afternoon.hemi,
    fogD: MOODS.afternoon.fogD,
    exp: MOODS.afternoon.exp,
    shafts: MOODS.afternoon.shafts,
    act: MOODS.afternoon.act,
    sun: new THREE.Color(MOODS.afternoon.sun),
    sky: new THREE.Color(MOODS.afternoon.sky),
    ground: new THREE.Color(MOODS.afternoon.ground),
    fog: new THREE.Color(MOODS.afternoon.fog),
  };
  let moodTarget: Mood = "afternoon";
  const tmpCol = new THREE.Color();
  const sunDir = new THREE.Vector3();
  const applyMood = () => {
    const el = (cur.el * Math.PI) / 180;
    const az = (cur.az * Math.PI) / 180;
    sunDir.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    sun.position.copy(sun.target.position).addScaledVector(sunDir, 45);
    sun.color.copy(cur.sun);
    sun.intensity = cur.sunInt;
    hemi.color.copy(cur.sky);
    hemi.groundColor.copy(cur.ground);
    hemi.intensity = cur.hemi;
    fog.color.copy(cur.fog);
    fog.density = cur.fogD;
    (scene.background as THREE.Color).copy(cur.fog);
    renderer.toneMappingExposure = cur.exp;
    shaftMat.color.copy(cur.sun);
    shaftMat.opacity = tier >= 1 ? 0 : cur.shafts;
    pMat.uniforms.uAlpha.value = 0.5 + 0.35 * cur.shafts;
    // orient shafts along the sun direction
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), sunDir);
    const len = Math.min(26, 20 / Math.max(0.35, sunDir.y));
    shafts.forEach((s) => {
      const base = new THREE.Vector3(s.gx, 0, s.gz);
      const mid = base.clone().addScaledVector(sunDir, len / 2);
      for (const [m, rot] of [
        [s.a, 0],
        [s.b, Math.PI / 2],
      ] as [THREE.Mesh, number][]) {
        m.position.copy(mid);
        m.quaternion.copy(q);
        m.rotateY(rot);
        m.scale.set(s.w * (1 + (1 - sunDir.y) * 0.9), len, 1);
      }
    });
  };
  applyMood();
  const stepMood = (dt: number, instant: boolean) => {
    const m = MOODS[moodTarget];
    const k = instant ? 1 : 1 - Math.exp(-dt * 1.6);
    const L = (a: number, b: number) => a + (b - a) * k;
    cur.az = L(cur.az, m.az);
    cur.el = L(cur.el, m.el);
    cur.sunInt = L(cur.sunInt, m.sunInt);
    cur.hemi = L(cur.hemi, m.hemi);
    cur.fogD = L(cur.fogD, m.fogD);
    cur.exp = L(cur.exp, m.exp);
    cur.shafts = L(cur.shafts, m.shafts);
    cur.act = L(cur.act, m.act);
    cur.sun.lerp(tmpCol.set(m.sun), k);
    cur.sky.lerp(tmpCol.set(m.sky), k);
    cur.ground.lerp(tmpCol.set(m.ground), k);
    cur.fog.lerp(tmpCol.set(m.fog), k);
    applyMood();
  };

  // ---------- camera ----------
  const DEF = { az: 0.35, pol: 1.44, rad: 25, tx: 0, ty: 5.3, tz: 0 };
  const cam = { ...DEF };
  const goal = { ...DEF };
  let userMoved = false;
  let followId: SpeciesId | null = null;
  let cinematic = false;
  let inspect = false;
  const followPos = new THREE.Vector3();
  let polMin = 1.0;
  let polMax = 1.62;
  let radMin = 6;
  let radMax = 30;
  let dirty = true;

  const layout = () => {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const aspect = w / h;
    DEF.rad = 25 * Math.min(1.9, Math.max(1, 1 / (aspect * 1.25)));
    radMax = Math.min(30, DEF.rad * 1.4);
    if (!userMoved && !followId && !inspect) goal.rad = cam.rad = DEF.rad;
    dirty = true;
  };
  layout();
  const ro = new ResizeObserver(layout);
  ro.observe(container);

  const clearModes = (keepInspect = false) => {
    if (cinematic) {
      cinematic = false;
      o.onCinematicEnd();
    }
    followId = null;
    if (!keepInspect) {
      polMin = 1.0;
      polMax = 1.62;
      radMin = 6;
    }
    radMax = Math.min(30, DEF.rad * 1.4);
  };
  const go = (p: Partial<typeof goal>) => {
    Object.assign(goal, p);
    dirty = true;
  };
  const toDefault = () => {
    if (inspect) go({ az: goal.az, pol: 1.34, rad: 17, tx: 0, ty: -0.2, tz: 0 });
    else go({ ...DEF });
  };

  // ---------- pointer & keyboard ----------
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let hoverRay: THREE.Ray | null = null;
  let hoverOn = false;
  const pointers = new Map<number, { x: number; y: number }>();
  let downPos = { x: 0, y: 0 };
  let moved = false;
  let pinchDist = 0;
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.3);
  const hit = new THREE.Vector3();

  const setNdc = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };
  const userInput = () => {
    userMoved = true;
    if (cinematic || followId) {
      const keepIn = inspect;
      clearModes(keepIn);
    }
  };
  const onDown = (e: PointerEvent) => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    downPos = { x: e.clientX, y: e.clientY };
    moved = false;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };
  const onMove = (e: PointerEvent) => {
    setNdc(e);
    hoverOn = true;
    const prev = pointers.get(e.pointerId);
    if (prev) {
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinchDist > 0) {
          userInput();
          goal.rad = Math.min(radMax, Math.max(radMin, goal.rad * (pinchDist / d)));
        }
        pinchDist = d;
        moved = true;
      } else if (pointers.size === 1) {
        if (Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) > 5) moved = true;
        if (moved) {
          userInput();
          goal.az -= dx * 0.006;
          goal.pol = Math.min(polMax, Math.max(polMin, goal.pol - dy * 0.004));
        }
      }
      dirty = true;
    }
    raycaster.setFromCamera(ndc, camera);
    hoverRay = raycaster.ray.clone();
    if (raycaster.ray.intersectPlane(groundPlane, hit)) U.uPointer.value.set(hit.x, U.uPointer.value.y, hit.z);
    dirty = true;
  };
  const onUp = (e: PointerEvent) => {
    const wasDrag = moved;
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchDist = 0;
    if (e.pointerType !== "mouse") {
      hoverOn = false;
      hoverRay = null;
    }
    if (wasDrag) return;
    setNdc(e);
    raycaster.setFromCamera(ndc, camera);
    const bHits = raycaster.intersectObjects(
      butterflies.map((b) => b.proxy),
      false
    );
    if (bHits.length) {
      const b = bHits[0].object.userData.butterfly as Butterfly;
      o.onSelect({ kind: "butterfly", id: b.id });
      return;
    }
    const tHits = raycaster.intersectObjects([treeMesh, leafMesh], false);
    if (tHits.length) o.onSelect({ kind: "tree" });
  };
  const onLeave = () => {
    hoverOn = false;
    hoverRay = null;
    dirty = true;
  };
  const onKey = (e: KeyboardEvent) => {
    const step = 0.12;
    let used = true;
    if (e.key === "ArrowLeft") goal.az += step;
    else if (e.key === "ArrowRight") goal.az -= step;
    else if (e.key === "ArrowUp") goal.pol = Math.max(polMin, goal.pol - 0.06);
    else if (e.key === "ArrowDown") goal.pol = Math.min(polMax, goal.pol + 0.06);
    else if (e.key === "+" || e.key === "=") goal.rad = Math.max(radMin, goal.rad * 0.9);
    else if (e.key === "-" || e.key === "_") goal.rad = Math.min(radMax, goal.rad * 1.1);
    else if (e.key === "Home" || e.key === "0") {
      clearModes(inspect);
      toDefault();
      userMoved = false;
    } else used = false;
    if (used) {
      e.preventDefault();
      if (e.key !== "Home" && e.key !== "0") userInput();
      dirty = true;
    }
  };
  const onWheel = (e: WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    userInput();
    goal.rad = Math.min(radMax, Math.max(radMin, goal.rad * Math.exp(e.deltaY * 0.0025)));
    dirty = true;
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("pointerleave", onLeave);
  canvas.addEventListener("keydown", onKey);
  canvas.addEventListener("wheel", onWheel, { passive: false });

  // ---------- growth ----------
  let growAuto = false;
  let lastGrowReport = -1;
  const reportGrowth = (force = false) => {
    const p = Math.min(1, U.uGrow.value / GROW_FULL);
    if (force || Math.abs(p - lastGrowReport) > 0.01) {
      lastGrowReport = p;
      o.onGrowth(p, p >= 1);
    }
  };

  // ---------- quality tiers ----------
  const applyTier = (n: number) => {
    tier = n;
    setDpr();
    layout();
    if (n >= 1) shaftMat.opacity = 0;
    if (n >= 2) {
      renderer.shadowMap.enabled = false;
      sun.castShadow = false;
      scene.traverse((ob) => {
        const m = (ob as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
        if (m) (Array.isArray(m) ? m : [m]).forEach((mm) => (mm.needsUpdate = true));
      });
      grass.count = Math.floor(grass.count * 0.6);
    }
    o.onTier(n);
  };
  let frames = 0;
  let acc = 0;

  // ---------- main loop ----------
  const clock = new THREE.Clock();
  let rafId = 0;
  let visible = true;
  let gustT = 0;
  let windBase = reduced ? 0 : 1;
  U.uWind.value = windBase;
  if (reduced) U.uTime.value = 3.3;
  const io = new IntersectionObserver((en) => (visible = en[0]?.isIntersecting ?? true), { threshold: 0.01 });
  io.observe(container);

  const camPos = new THREE.Vector3();
  const bFlight = { dt: 0, t: 0, activity: 1, sites: perch, ray: null as THREE.Ray | null, groundY: (x: number, z: number) => baseHeight(noise, x, z), rnd };
  let inspectK = 0;
  let wasTransparent = false;
  const strengthTarget = { v: 0 };

  const frame = () => {
    rafId = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!visible || document.hidden) return;
    const t = (U.uTime.value += reduced ? 0 : dt);

    if (reduced && !dirty) return;

    // adaptive quality
    if (o.quality === "auto" && !reduced && tier < 2) {
      frames++;
      if (frames > 70) {
        acc += dt;
        if (frames > 160) {
          if (acc / 90 > 0.027) applyTier(tier + 1);
          frames = 40;
          acc = 0;
        }
      }
    }

    // mood
    stepMood(reduced ? 1 : dt, reduced);

    // wind with gusts
    gustT = Math.max(0, gustT - dt);
    const gustK = gustT > 0 ? Math.sin(Math.min(1, gustT / 2.6) * Math.PI) : 0;
    U.uWind.value = windBase + gustK * 2.2;
    leafBoost = Math.max(0, leafBoost - dt * 0.4);

    // growth
    if (growAuto) {
      U.uGrow.value = Math.min(GROW_FULL, U.uGrow.value + dt * (GROW_FULL / 17));
      if (U.uGrow.value >= GROW_FULL) growAuto = false;
      reportGrowth(!growAuto);
    }

    // pointer strength for plant bending
    const wantStrength = hoverOn && pointers.size === 0 ? 1 : 0;
    strengthTarget.v += (wantStrength - strengthTarget.v) * Math.min(1, dt * 6);
    U.uPointer.value.y = strengthTarget.v;

    // butterflies
    if (!reduced) {
      bFlight.dt = dt;
      bFlight.t = t;
      bFlight.activity = Math.max(0.3, cur.act);
      bFlight.ray = hoverOn ? hoverRay : null;
      butterflies.forEach((b) => b.update(bFlight));
    }

    // falling leaves
    if (!reduced) {
      for (let i = 0; i < fl.length; i++) {
        const f = fl[i];
        f.y -= dt * f.sp * (1 + leafBoost * 2);
        f.x += (Math.sin(t * 0.8 + f.ph) * 0.35 + U.uWind.value * 0.22) * dt;
        f.z += Math.cos(t * 0.6 + f.ph) * 0.25 * dt;
        f.rx += dt * f.vr * 0.7;
        f.ry += dt * f.vr * 0.4;
        f.rz += dt * f.vr;
        if (f.y < groundY(f.x, f.z) + 0.05) respawn(f, false);
        dummy.position.set(f.x, f.y, f.z);
        dummy.rotation.set(f.rx * 0.5, f.ry, f.rz * 0.4);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        falling.setMatrixAt(i, dummy.matrix);
      }
      falling.instanceMatrix.needsUpdate = true;
    }

    // inspect transition
    inspectK += ((inspect ? 1 : 0) - inspectK) * Math.min(1, dt * 4);
    if (Math.abs(inspectK - (inspect ? 1 : 0)) < 0.002) inspectK = inspect ? 1 : 0;
    const wantTransparent = inspectK > 0.01;
    if (wantTransparent !== wasTransparent) {
      wasTransparent = wantTransparent;
      groundMat.transparent = wantTransparent;
      groundMat.depthWrite = !wantTransparent;
      groundMat.clippingPlanes = wantTransparent ? [clipPlane] : [];
      groundMat.needsUpdate = true;
      inspectGroup.visible = wantTransparent;
    }
    groundMat.opacity = 1 - 0.78 * inspectK;
    outerGround.visible = inspectK < 0.5;
    decalMesh.visible = inspectK < 0.5;
    const floorOn = inspectK < 0.3;
    grass.visible = ferns.visible = stems.visible = heads.visible = litter.visible = twigs.visible = stones.visible = floorOn;

    // camera
    if (followId) {
      const b = butterflies.find((x) => x.id === followId)!;
      followPos.lerp(b.group.position, 1 - Math.exp(-dt * 4));
      goal.tx = followPos.x;
      goal.ty = followPos.y;
      goal.tz = followPos.z;
    } else if (cinematic && !reduced) {
      goal.az += dt * 0.045;
      goal.rad = DEF.rad * (0.84 + 0.12 * Math.sin(t * 0.12));
      goal.ty = 4.0 + 1.6 * Math.sin(t * 0.1);
      goal.pol = 1.36 + 0.07 * Math.sin(t * 0.08);
    }
    const kc = reduced ? 1 : 1 - Math.exp(-dt * 5);
    cam.az += (goal.az - cam.az) * kc;
    cam.pol += (goal.pol - cam.pol) * kc;
    cam.rad += (goal.rad - cam.rad) * kc;
    cam.tx += (goal.tx - cam.tx) * kc;
    cam.ty += (goal.ty - cam.ty) * kc;
    cam.tz += (goal.tz - cam.tz) * kc;
    camPos.set(cam.tx + cam.rad * Math.sin(cam.pol) * Math.sin(cam.az), cam.ty + cam.rad * Math.cos(cam.pol), cam.tz + cam.rad * Math.sin(cam.pol) * Math.cos(cam.az));
    camera.position.copy(camPos);
    camera.lookAt(cam.tx, cam.ty, cam.tz);
    // section plane faces away from the camera so the front half is cut away
    const hx = camPos.x;
    const hz = camPos.z;
    const hl = Math.hypot(hx, hz) || 1;
    clipPlane.normal.set(-hx / hl, 0, -hz / hl);

    renderer.render(scene, camera);
    if (reduced) dirty = false;
  };
  frame();

  // ---------- api ----------
  const api: Forest = {
    species,
    setWind(v) {
      windBase = reduced ? 0 : v;
      dirty = true;
    },
    gust() {
      if (reduced) return;
      gustT = 2.6;
      leafBoost = 1;
    },
    setMood(m, instant) {
      moodTarget = m;
      if (instant) stepMood(0, true);
      dirty = true;
    },
    setInspect(on) {
      inspect = on;
      if (on) {
        clearModes(true);
        polMin = 1.05;
        polMax = 1.6;
        radMin = 7;
        radMax = 22;
        go({ pol: 1.34, rad: 17, tx: 0, ty: -0.2, tz: 0 });
      } else {
        polMin = 1.0;
        polMax = 1.62;
        radMin = 6;
        radMax = Math.min(30, DEF.rad * 1.4);
        go({ ...DEF });
        userMoved = false;
      }
    },
    startGrowth() {
      U.uGrow.value = 0;
      growAuto = !reduced;
      lastGrowReport = -1;
      reportGrowth(true);
      dirty = true;
    },
    setGrowth(p) {
      growAuto = false;
      U.uGrow.value = Math.min(1, Math.max(0, p)) * GROW_FULL;
      reportGrowth(true);
      dirty = true;
    },
    finishGrowth() {
      growAuto = false;
      U.uGrow.value = GROW_FULL;
      reportGrowth(true);
      dirty = true;
    },
    setCinematic(on) {
      if (reduced) return;
      if (on) {
        followId = null;
        cinematic = true;
        if (inspect) {
          inspect = false;
        }
        polMin = 1.0;
        polMax = 1.62;
        radMin = 6;
        radMax = Math.min(30, DEF.rad * 1.4);
      } else cinematic = false;
      dirty = true;
    },
    resetCamera() {
      clearModes(inspect);
      userMoved = false;
      toDefault();
    },
    zoom(f) {
      userInput();
      goal.rad = Math.min(radMax, Math.max(radMin, goal.rad * f));
      dirty = true;
    },
    follow(id) {
      if (!id) {
        followId = null;
        radMin = 6;
        toDefault();
        return;
      }
      if (cinematic) {
        cinematic = false;
        o.onCinematicEnd();
      }
      const b = butterflies.find((x) => x.id === id)!;
      followPos.copy(b.group.position);
      followId = id;
      radMin = 2.2;
      go({ rad: 3.6, pol: 1.4 });
    },
    focusBark() {
      clearModes(false);
      userMoved = true;
      radMin = 3;
      go({ pol: 1.5, rad: 4.6, tx: 0.2, ty: 2.0, tz: 0 });
    },
    focusFoliage() {
      clearModes(false);
      userMoved = true;
      radMin = 3;
      go({ pol: 1.42, rad: 6.5, tx: 2.4, ty: 7.0, tz: 1.0 });
    },
    resize: layout,
    dispose() {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("keydown", onKey);
      canvas.removeEventListener("wheel", onWheel);
      butterflies.forEach((b) => b.dispose());
      [leafMesh, ceilMesh, litter, grass, ferns, stems, heads, twigs, stones, mossMesh, decalMesh, bgTrunks, falling].forEach((m) => m.dispose());
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
  void SPECIES_INFO;
  return api;
}

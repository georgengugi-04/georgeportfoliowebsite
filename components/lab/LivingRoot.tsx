"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A small procedural WebGL scene: an instanced root grown from a curve,
 * moss sampled along its upward-facing surface, drifting pollen, and a
 * butterfly that cruises, approaches, lands, and takes off again on its
 * own timer. Everything — bark, moss, flower and wing textures — is
 * generated on a <canvas> at runtime; nothing is loaded from disk.
 *
 * Colors are pulled from the site's own palette (see tailwind.config.ts):
 * bark and moss stay neutral/organic, and `signal` (#B4FF39) is reused as
 * the pollen + flower accent so the experiment reads as part of the site,
 * not a separate skin.
 */

const TOKENS = {
  ink: 0x0a0b0a,
  graphite: 0x1a1c1a,
  line: 0x232520,
  signal: 0xb4ff39,
  paper: 0xf6f5f1,
  moss: 0x4f6a3e,
};

export default function LivingRoot() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const windRef = useRef(1);
  const burstFnRef = useRef<(() => void) | null>(null);
  const [ready, setReady] = useState(false);
  const [windOn, setWindOn] = useState(true);

  useEffect(() => {
    let disposed = false;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cleanup = () => {};

    import("three").then((THREE) => {
      if (disposed || !mountRef.current || !canvasRef.current) return;

      let seed = 918273645;
      const rnd = () => {
        seed ^= seed << 13;
        seed ^= seed >>> 17;
        seed ^= seed << 5;
        return (seed >>> 0) / 4294967296;
      };
      const rr = (lo: number, hi: number) => lo + (hi - lo) * rnd();

      const container = mountRef.current;
      const canvas = canvasRef.current;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 1, 100);
      camera.position.set(0, 0, 26);

      const key = new THREE.DirectionalLight(0xffffff, 1.3);
      key.position.set(-4, 6, 6);
      scene.add(key);
      const fill = new THREE.DirectionalLight(TOKENS.moss, 0.45);
      fill.position.set(4, -3, 3);
      scene.add(fill);
      scene.add(new THREE.AmbientLight(TOKENS.graphite, 1.2));

      // ---- root curve ----
      const pts = [
        new THREE.Vector3(-9, -3.2, -2),
        new THREE.Vector3(-4.6, -1.1, 0.4),
        new THREE.Vector3(-1.2, 1.5, 1.2),
        new THREE.Vector3(2.4, 2.2, 0.2),
        new THREE.Vector3(5.8, 0.3, -0.8),
        new THREE.Vector3(8.6, -1.3, -1.6),
      ];
      const curve = new THREE.CatmullRomCurve3(pts);
      const tubeGeo = new THREE.TubeGeometry(curve, 130, 0.6, 12, false);

      const barkCanvas = document.createElement("canvas");
      barkCanvas.width = 256;
      barkCanvas.height = 256;
      {
        const g = barkCanvas.getContext("2d")!;
        g.fillStyle = "#1a1c1a";
        g.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 300; i++) {
          const y = rr(0, 256);
          g.strokeStyle = `rgba(0,0,0,${rr(0.12, 0.4).toFixed(2)})`;
          g.lineWidth = rr(0.6, 2);
          g.beginPath();
          g.moveTo(0, y);
          for (let x = 0; x <= 256; x += 16) g.lineTo(x, y + Math.sin(x * 0.05 + i) * 6);
          g.stroke();
        }
      }
      const barkTex = new THREE.CanvasTexture(barkCanvas);
      barkTex.wrapS = barkTex.wrapT = THREE.RepeatWrapping;
      barkTex.repeat.set(6, 2);
      const barkMat = new THREE.MeshStandardMaterial({
        map: barkTex,
        roughness: 0.95,
        metalness: 0.05,
        color: 0x77786f,
      });
      const root = new THREE.Mesh(tubeGeo, barkMat);
      scene.add(root);

      // ---- moss: instanced blades, weighted toward the upward face ----
      const bladeGeo = new THREE.ConeGeometry(0.05, 0.32, 4);
      bladeGeo.translate(0, 0.16, 0);
      const bladeMat = new THREE.MeshStandardMaterial({ color: TOKENS.moss, roughness: 1 });
      const bladeCount = window.innerWidth < 760 ? 1200 : 2800;
      const blades = new THREE.InstancedMesh(bladeGeo, bladeMat, bladeCount);
      const dummy = new THREE.Object3D();
      const p = new THREE.Vector3();
      const tangent = new THREE.Vector3();
      for (let i = 0; i < bladeCount; i++) {
        const t = rr(0, 1);
        curve.getPointAt(t, p);
        curve.getTangentAt(t, tangent);
        const up = Math.pow(rnd(), 0.4);
        const theta = rr(-1, 1) * 1.1;
        const radius = 0.62;
        const pos = p
          .clone()
          .add(
            new THREE.Vector3(
              Math.sin(theta) * radius,
              Math.cos(theta) * radius * up + (1 - up) * 0.05,
              rr(-0.3, 0.3)
            )
          );
        dummy.position.copy(pos);
        dummy.lookAt(pos.clone().add(new THREE.Vector3(rr(-0.3, 0.3), 1, rr(-0.3, 0.3))));
        dummy.rotateX(Math.PI / 2);
        dummy.scale.setScalar(rr(0.6, 1.4) * (0.4 + 0.6 * up));
        dummy.updateMatrix();
        blades.setMatrixAt(i, dummy.matrix);
      }
      blades.instanceMatrix.needsUpdate = true;
      scene.add(blades);

      // ---- flowers: canvas sprite, tinted with the site's signal accent ----
      const flowerCanvas = document.createElement("canvas");
      flowerCanvas.width = flowerCanvas.height = 48;
      {
        const g = flowerCanvas.getContext("2d")!;
        g.translate(24, 24);
        for (let pi = 0; pi < 5; pi++) {
          g.save();
          g.rotate((pi / 5) * Math.PI * 2);
          g.fillStyle = "rgba(246,245,241,0.92)";
          g.beginPath();
          g.ellipse(0, -9, 4, 9, 0, 0, Math.PI * 2);
          g.fill();
          g.restore();
        }
        g.fillStyle = "#B4FF39";
        g.beginPath();
        g.arc(0, 0, 3, 0, Math.PI * 2);
        g.fill();
      }
      const flowerTex = new THREE.CanvasTexture(flowerCanvas);
      const flowerMesh = new THREE.InstancedMesh(
        new THREE.PlaneGeometry(0.4, 0.4),
        new THREE.MeshBasicMaterial({ map: flowerTex, transparent: true, depthWrite: false }),
        40
      );
      for (let f = 0; f < 40; f++) {
        const tf = rr(0.05, 0.95);
        curve.getPointAt(tf, p);
        const thf = rr(-0.7, 0.7);
        const pos2 = p
          .clone()
          .add(new THREE.Vector3(Math.sin(thf) * 0.66, Math.cos(thf) * 0.5 + 0.25, rr(-0.35, 0.35)));
        dummy.position.copy(pos2);
        dummy.rotation.set(rr(-0.2, 0.2), rr(0, Math.PI * 2), 0);
        dummy.scale.setScalar(rr(0.7, 1.25));
        dummy.updateMatrix();
        flowerMesh.setMatrixAt(f, dummy.matrix);
      }
      scene.add(flowerMesh);

      // ---- ferns ----
      const fernMat = new THREE.MeshStandardMaterial({
        color: 0x2b3324,
        roughness: 1,
        side: THREE.DoubleSide,
      });
      const ferns: any[] = [];
      for (let fe = 0; fe < 9; fe++) {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        const segs = 9;
        for (let s = 1; s <= segs; s++) {
          const sT = s / segs;
          shape.lineTo(-0.16 * Math.sin(Math.PI * sT), sT * 1.05);
        }
        for (let s = segs; s >= 0; s--) {
          const sT = s / segs;
          shape.lineTo(0.16 * Math.sin(Math.PI * sT), sT * 1.05);
        }
        const fmesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), fernMat);
        const tfe = rr(0.1, 0.9);
        curve.getPointAt(tfe, p);
        const thfe = rr(0.5, 1.3) * (rnd() < 0.5 ? 1 : -1);
        fmesh.position
          .copy(p)
          .add(new THREE.Vector3(Math.sin(thfe) * 0.7, Math.cos(thfe) * 0.55, rr(-0.4, 0.4)));
        fmesh.rotation.set(rr(-0.3, 0.1), rr(0, Math.PI * 2), rr(-0.3, 0.3));
        fmesh.scale.setScalar(rr(0.75, 1.5));
        scene.add(fmesh);
        ferns.push(fmesh);
      }

      // ---- pollen ----
      const pollenCount = window.innerWidth < 760 ? 140 : 320;
      const positions = new Float32Array(pollenCount * 3);
      const seeds = new Float32Array(pollenCount * 3);
      for (let pp = 0; pp < pollenCount; pp++) {
        positions[pp * 3] = rr(-11, 11);
        positions[pp * 3 + 1] = rr(-5, 6);
        positions[pp * 3 + 2] = rr(-3, 5);
        seeds[pp * 3] = rr(0, Math.PI * 2);
        seeds[pp * 3 + 1] = rr(0.3, 1.1);
        seeds[pp * 3 + 2] = rr(0.4, 1.3);
      }
      const pg = new THREE.BufferGeometry();
      pg.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      pg.setAttribute("seed", new THREE.BufferAttribute(seeds, 3));

      const dotCanvas = document.createElement("canvas");
      dotCanvas.width = dotCanvas.height = 64;
      {
        const g = dotCanvas.getContext("2d")!;
        const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, "rgba(255,255,255,1)");
        grad.addColorStop(0.4, "rgba(180,255,57,0.55)");
        grad.addColorStop(1, "rgba(180,255,57,0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, 64, 64);
      }
      const pollenTex = new THREE.CanvasTexture(dotCanvas);
      const pollenMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uMap: { value: pollenTex }, uWind: { value: 1 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
          attribute vec3 seed; uniform float uTime; uniform float uWind;
          void main(){
            vec3 pos = position;
            pos.x += sin(uTime*seed.y*0.4 + seed.x) * 0.6 * uWind;
            pos.y += mod(uTime*seed.y*0.5*uWind + seed.x*2.0, 11.0) - 5.5;
            pos.z += cos(uTime*seed.z*0.3 + seed.x) * 0.4 * uWind;
            vec4 mv = modelViewMatrix * vec4(pos,1.0);
            gl_PointSize = (10.0*seed.z) * (300.0/-mv.z);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          uniform sampler2D uMap;
          void main(){ gl_FragColor = texture2D(uMap, gl_PointCoord); }`,
      });
      const pollen = new THREE.Points(pg, pollenMat);
      scene.add(pollen);

      // ---- burst: a handful of pollen scattered on demand ----
      const burstPositions = new Float32Array(60 * 3);
      const burstSeeds = new Float32Array(60 * 3);
      const burstGeo = new THREE.BufferGeometry();
      burstGeo.setAttribute("position", new THREE.BufferAttribute(burstPositions, 3));
      burstGeo.setAttribute("seed", new THREE.BufferAttribute(burstSeeds, 3));
      const burstMat = pollenMat.clone();
      burstMat.uniforms = {
        uTime: { value: 0 },
        uMap: { value: pollenTex },
        uWind: { value: 1 },
      };
      const burstPts = new THREE.Points(burstGeo, burstMat);
      burstPts.visible = false;
      scene.add(burstPts);
      let burstUntil = 0;
      burstFnRef.current = () => {
        for (let i = 0; i < 60; i++) {
          burstPositions[i * 3] = rr(-2, 2);
          burstPositions[i * 3 + 1] = rr(-1, 3);
          burstPositions[i * 3 + 2] = rr(-1, 1);
          burstSeeds[i * 3] = rr(0, Math.PI * 2);
          burstSeeds[i * 3 + 1] = rr(0.8, 2.2);
          burstSeeds[i * 3 + 2] = rr(0.6, 1.4);
        }
        burstGeo.attributes.position.needsUpdate = true;
        burstGeo.attributes.seed.needsUpdate = true;
        burstPts.visible = true;
        burstUntil = clock.elapsedTime + 3.2;
      };

      // ---- butterfly: two wings + body, own flight state machine ----
      const wingCanvas = document.createElement("canvas");
      wingCanvas.width = 128;
      wingCanvas.height = 96;
      {
        const g = wingCanvas.getContext("2d")!;
        g.fillStyle = "#e7e4d6";
        g.fillRect(0, 0, 128, 96);
        g.fillStyle = "rgba(20,22,18,0.5)";
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(128, 0);
        g.lineTo(128, 26);
        g.lineTo(60, 50);
        g.lineTo(0, 20);
        g.closePath();
        g.fill();
        g.fillStyle = "rgba(180,255,57,0.55)";
        for (let i = 0; i < 6; i++) {
          g.beginPath();
          g.arc(20 + i * 16, 60 + (i % 2) * 10, 6, 0, Math.PI * 2);
          g.fill();
        }
      }
      const wingTex = new THREE.CanvasTexture(wingCanvas);
      const wingGeo = new THREE.PlaneGeometry(0.5, 0.36);
      wingGeo.translate(0.25, 0, 0);
      const wingMat = new THREE.MeshStandardMaterial({
        map: wingTex,
        side: THREE.DoubleSide,
        roughness: 0.6,
        transparent: true,
      });
      const wingL = new THREE.Mesh(wingGeo, wingMat);
      const wingR = new THREE.Mesh(wingGeo, wingMat);
      wingR.scale.x = -1;
      const butterfly = new THREE.Group();
      butterfly.add(wingL, wingR);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x141410, roughness: 0.8 });
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.28, 6), bodyMat);
      body.rotation.z = Math.PI / 2;
      butterfly.add(body);
      butterfly.scale.setScalar(1.4);
      scene.add(butterfly);

      const perch = new THREE.Vector3();
      curve.getPointAt(0.42, perch);
      perch.add(new THREE.Vector3(0, 0.9, 0.15));

      const ud = {
        mode: "cruise" as "cruise" | "approach" | "landed" | "takeoff",
        timer: rr(2, 4),
        settle: 0,
        flap: 0,
        pos: new THREE.Vector3(perch.x - 4, perch.y + 2, perch.z + 1.5),
        vel: new THREE.Vector3(0.4, 0, 0),
        target: new THREE.Vector3(),
      };
      const pickTarget = () => {
        ud.target.set(perch.x + rr(-3.5, 2), perch.y + rr(0.6, 2.6), perch.z + rr(-1, 1.4));
      };
      pickTarget();

      // ---- layout / resize ----
      const layout = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      layout();
      const resizeObserver = new ResizeObserver(layout);
      resizeObserver.observe(container);

      // ---- pointer parallax ----
      const mouse = { x: 0, y: 0 };
      const smooth = { x: 0, y: 0 };
      const onPointerMove = (e: PointerEvent) => {
        if (reduced) return;
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });

      const clock = new THREE.Clock();
      let rafId = 0;

      const tick = (dt: number, t: number) => {
        ud.timer -= dt;
        if (ud.mode === "cruise" && ud.timer <= 0) {
          ud.mode = "approach";
          ud.timer = 8;
        } else if (
          ud.mode === "approach" &&
          (ud.pos.distanceTo(perch) < 0.2 || ud.timer <= 0)
        ) {
          ud.mode = "landed";
          ud.timer = rr(4, 7);
        } else if (ud.mode === "landed" && ud.timer <= 0) {
          ud.mode = "takeoff";
          ud.timer = 1.4;
          pickTarget();
        } else if (ud.mode === "takeoff" && ud.timer <= 0) {
          ud.mode = "cruise";
          ud.timer = rr(3, 5);
        }

        const landing = ud.mode === "landed";
        ud.settle += ((landing ? 1 : 0) - ud.settle) * Math.min(1, dt * 3);

        const beat = 9 - 8.6 * ud.settle;
        ud.flap += dt * beat * Math.PI * 2;
        const flapAmt =
          (Math.PI / 180) *
          (landing ? 14 + 6 * Math.sin(ud.flap) : 55 + 35 * Math.sin(ud.flap));
        wingL.rotation.y = flapAmt;
        wingR.rotation.y = -flapAmt;

        const goal = ud.mode === "approach" ? perch : ud.target;
        const toGoal = goal.clone().sub(ud.pos);
        const dist = toGoal.length();
        const desired = toGoal.normalize().multiplyScalar(Math.min(2.2, 0.3 + dist));
        desired.x += Math.sin(t * 1.8) * 0.5 * (1 - ud.settle);
        desired.y += Math.sin(t * 1.1 + 1) * 0.3 * (1 - ud.settle);
        ud.vel.lerp(desired, 1 - Math.pow(0.02, dt));
        if (ud.settle > 0.02) {
          ud.pos.lerp(perch, Math.min(1, dt * 4 * ud.settle));
        } else {
          ud.pos.addScaledVector(ud.vel, dt);
        }

        butterfly.position.copy(ud.pos);
        const fwd = ud.vel.clone().normalize();
        if (fwd.lengthSq() > 0.001) {
          const targetQ = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(1, 0, 0),
            fwd
          );
          butterfly.quaternion.slerp(targetQ, Math.min(1, dt * 4));
        }
      };

      const animate = () => {
        rafId = requestAnimationFrame(animate);
        const dt = Math.min(clock.getDelta(), 0.05);
        const t = clock.elapsedTime;
        const wind = windRef.current;

        if (!reduced) {
          smooth.x += (mouse.x - smooth.x) * 0.04;
          smooth.y += (mouse.y - smooth.y) * 0.04;
          scene.rotation.y = smooth.x * 0.1;
          scene.rotation.x = -smooth.y * 0.04;
          pollenMat.uniforms.uTime.value = t;
          pollenMat.uniforms.uWind.value = wind;
          burstMat.uniforms.uTime.value = t;
          burstMat.uniforms.uWind.value = wind;
          if (burstPts.visible && t > burstUntil) burstPts.visible = false;
          if (wind > 0.05) tick(dt * wind, t);
        }
        renderer.render(scene, camera);
      };
      animate();
      setReady(true);

      cleanup = () => {
        cancelAnimationFrame(rafId);
        resizeObserver.disconnect();
        window.removeEventListener("pointermove", onPointerMove);
        scene.traverse((obj: any) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            mats.forEach((m: any) => {
              if (m.map) m.map.dispose();
              m.dispose();
            });
          }
        });
        pollenTex.dispose();
        barkTex.dispose();
        flowerTex.dispose();
        wingTex.dispose();
        renderer.dispose();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div>
      <div
        ref={mountRef}
        className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden rounded-3xl border border-line bg-graphite"
      >
        <canvas
          ref={canvasRef}
          className={`h-full w-full transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
        />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-xs uppercase tracking-[0.18em] text-mist">
            Growing the scene…
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => burstFnRef.current?.()}
          className="inline-flex items-center gap-2 rounded-full bg-signal text-ink px-5 py-2.5 font-mono text-sm font-medium hover:bg-paper transition-colors"
        >
          Nudge the pollen
        </button>
        <button
          onClick={() => {
            const next = windRef.current > 0.05 ? 0 : 1;
            windRef.current = next;
            setWindOn(next > 0.05);
          }}
          className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 font-mono text-sm text-paper hover:border-signal hover:text-signal transition-colors"
        >
          {windOn ? "Pause motion" : "Resume motion"}
        </button>
      </div>
    </div>
  );
}

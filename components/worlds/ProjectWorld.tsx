"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export type WorldState = "idle" | "loading" | "ready" | "static" | "error";
export type WorldHandle = { dispose(): void };
export type WorldMountCtx = { canvas: HTMLCanvasElement; container: HTMLElement; reduced: boolean; quality: "auto" | "high" | "low" };

type Props<A extends WorldHandle> = {
  /** Lazily creates the scene. Keep the heavy import inside this function so nothing loads until needed. */
  mount: (ctx: WorldMountCtx) => Promise<A>;
  /** A real render of the scene. It is the base layer, so the page still communicates without WebGL. */
  poster: string;
  posterAlt: string;
  posterPriority?: boolean;
  /** Start only when the world is near the viewport. Defaults to true. */
  lazy?: boolean;
  /** Wait for the page to be idle first, so the scene never competes with first paint. */
  deferStart?: boolean;
  className?: string;
  children?: (s: { state: WorldState; api: A | null; reduced: boolean; reason: string | null; load: () => void }) => ReactNode;
  onReady?: (api: A, ctx: { reduced: boolean }) => void;
  onState?: (state: WorldState, reason: string | null) => void;
  /** CSS object-position for the poster, so the subject stays in frame on narrow screens. */
  posterPosition?: string;
};

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * Shared shell for every Project World: poster base layer, lazy + idle start, capability checks
 * (WebGL, data saver, low memory), reduced-motion, loading and error states, and guaranteed disposal.
 * The scene itself is supplied by `mount`, so environments share this behaviour without sharing scene code.
 */
export default function ProjectWorld<A extends WorldHandle>({ mount, poster, posterAlt, posterPriority, lazy = true, deferStart = true, className = "", children, onReady, onState, posterPosition = "50% 50%" }: Props<A>) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const apiRef = useRef<A | null>(null);
  const [state, setState] = useState<WorldState>("idle");
  const [api, setApi] = useState<A | null>(null);
  const [reduced, setReduced] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [forced, setForced] = useState(false);
  const mountRef = useRef(mount);
  mountRef.current = mount;
  const readyRef = useRef(onReady);
  readyRef.current = onReady;

  const stateCb = useRef(onState);
  stateCb.current = onState;
  useEffect(() => {
    stateCb.current?.(state, reason);
  }, [state, reason]);

  const load = useCallback(() => setForced(true), []);

  useEffect(() => {
    let disposed = false;
    let started = false;
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(rm);

    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    if (!hasWebGL()) {
      setReason("WebGL is not available on this device, so the still image is shown.");
      setState("static");
      return;
    }
    if (!forced && (nav.connection?.saveData || (nav.deviceMemory !== undefined && nav.deviceMemory <= 2))) {
      setReason("Showing a still image to save data and battery.");
      setState("static");
      return;
    }

    const q = new URLSearchParams(window.location.search).get("quality");
    const quality = q === "high" || q === "low" ? q : "auto";

    const start = async () => {
      if (started || disposed || !canvasRef.current || !boxRef.current) return;
      started = true;
      setState("loading");
      try {
        const a = await mountRef.current({ canvas: canvasRef.current, container: boxRef.current, reduced: rm, quality });
        if (disposed) {
          a.dispose();
          return;
        }
        apiRef.current = a;
        setApi(a);
        setState("ready");
        readyRef.current?.(a, { reduced: rm });
      } catch {
        if (!disposed) {
          setReason("The interactive scene could not start, so the still image is shown.");
          setState("error");
        }
      }
    };

    let cancel = () => {};
    const schedule = () => {
      if (deferStart) {
        const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
        if (w.requestIdleCallback) {
          const id = w.requestIdleCallback(start, { timeout: 1800 });
          cancel = () => w.cancelIdleCallback?.(id);
        } else {
          const id = window.setTimeout(start, 500);
          cancel = () => window.clearTimeout(id);
        }
      } else void start();
    };

    let io: IntersectionObserver | null = null;
    if (lazy && boxRef.current && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (en) => {
          if (en.some((e) => e.isIntersecting)) {
            io?.disconnect();
            schedule();
          }
        },
        { rootMargin: "240px" }
      );
      io.observe(boxRef.current);
    } else schedule();

    return () => {
      disposed = true;
      io?.disconnect();
      cancel();
      apiRef.current?.dispose();
      apiRef.current = null;
      setApi(null);
    };
  }, [forced, lazy, deferStart]);

  const showCanvas = state !== "static" && state !== "error";
  return (
    <div ref={boxRef} className={`relative isolate overflow-hidden bg-[#0a0b0a] ${className}`}>
      <Image src={poster} alt={posterAlt} fill priority={posterPriority} sizes="100vw" className="object-cover" style={{ objectPosition: posterPosition }} />
      {showCanvas && <canvas ref={canvasRef} aria-hidden className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${state === "ready" ? "opacity-100" : "opacity-0"}`} />}
      {children?.({ state, api, reduced, reason, load })}
    </div>
  );
}

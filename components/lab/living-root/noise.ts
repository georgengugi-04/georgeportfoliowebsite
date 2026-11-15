export function makeRng(seed: number) {
  let s = (seed >>> 0) || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

const N = 256;

/** Value noise with optional integer periods, so textures tile without seams. */
export function makeNoise(seed: number) {
  const rnd = makeRng(seed);
  const g = new Float32Array(N * N);
  for (let i = 0; i < g.length; i++) g[i] = rnd();
  const sm = (t: number) => t * t * (3 - 2 * t);
  const wrap = (v: number, p: number) => ((v % p) + p) % p;

  const n2 = (x: number, y: number, px = N, py = N) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = sm(x - xi);
    const yf = sm(y - yi);
    const x0 = wrap(xi, px) & 255;
    const x1 = wrap(xi + 1, px) & 255;
    const y0 = wrap(yi, py) & 255;
    const y1 = wrap(yi + 1, py) & 255;
    const a = g[y0 * N + x0];
    const b = g[y0 * N + x1];
    const c = g[y1 * N + x0];
    const d = g[y1 * N + x1];
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };

  const fbm = (x: number, y: number, px = N, py = N, oct = 4) => {
    let amp = 0.5;
    let f = 1;
    let sum = 0;
    let norm = 0;
    for (let o = 0; o < oct; o++) {
      sum += amp * n2(x * f, y * f, px * f, py * f);
      norm += amp;
      amp *= 0.5;
      f *= 2;
    }
    return sum / norm;
  };

  return { n2, fbm };
}

export type Noise = ReturnType<typeof makeNoise>;

/** Tiny upward-trending sparkline, deterministic from a seed (SSR-safe). */
export default function Sparkline({
  seed,
  up = true,
  width = 72,
  height = 24,
}: {
  seed: string;
  up?: boolean;
  width?: number;
  height?: number;
}) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rng = () => {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };

  const n = 10;
  const vals: number[] = [];
  let v = 0.35 + rng() * 0.15;
  for (let i = 0; i < n; i++) {
    v += (rng() - (up ? 0.32 : 0.68)) * 0.16; // bias the drift up or down
    v = Math.max(0.06, Math.min(0.96, v));
    vals.push(v);
  }

  const pad = 2;
  const pts = vals.map((val, i) => {
    const x = (i / (n - 1)) * width;
    const y = height - pad - val * (height - pad * 2);
    return [x, y] as const;
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const color = up ? "var(--green)" : "var(--red)";
  const gid = `sp-${Math.abs(h) % 100000}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

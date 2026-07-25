import { formatNumber } from "@/lib/format";

/** Stacked trapezoid conversion funnel. */
export default function ConversionFunnel({ stages }: { stages: { label: string; value: number }[] }) {
  // Top width of each block (%). Bottom width = next block's top (true funnel).
  const widths = [100, 76, 60, 46, 36];
  // Hue ramps from blue → green across the funnel.
  const hues = [255, 232, 205, 175, 150];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      {stages.map((s, i) => {
        const top = widths[i] ?? 36;
        const bottom = widths[i + 1] ?? top * 0.82;
        const l1 = (100 - top) / 2;
        const r1 = 100 - l1;
        const l2 = (100 - bottom) / 2;
        const r2 = 100 - l2;
        const hue = hues[i] ?? 150;
        return (
          <div
            key={s.label}
            style={{
              width: "100%",
              height: 52,
              clipPath: `polygon(${l1}% 0, ${r1}% 0, ${r2}% 100%, ${l2}% 100%)`,
              background: `linear-gradient(135deg, oklch(58% 0.19 ${hue}), oklch(52% 0.17 ${hue + 18}))`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              color: "white",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 19, fontWeight: 800, lineHeight: 1 }}>{formatNumber(s.value)}</div>
            <div style={{ fontSize: 11, opacity: 0.9, marginTop: 3 }}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}

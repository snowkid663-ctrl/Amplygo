import { RARITY, getBadge } from "@/lib/badges";

/** Renders earned badges as rarity-colored pills (hover title = description). */
export default function BadgeList({ ids }: { ids: string[] }) {
  if (!ids.length) {
    return (
      <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
        Run campaigns and hit view milestones to start earning badges.
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {ids.map((id) => {
        const b = getBadge(id);
        if (!b) return null;
        const r = RARITY[b.rarity];
        return (
          <div
            key={id}
            title={`${b.description} · ${r.label}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 12px",
              borderRadius: 100,
              background: r.bg,
              border: `1px solid ${r.border}`,
            }}
          >
            <span style={{ fontSize: 15 }}>{b.emoji}</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{b.name}</span>
            <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: r.color }}>
              {r.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

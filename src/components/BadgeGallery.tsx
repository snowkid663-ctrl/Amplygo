import { RARITY, type BadgeProgress } from "@/lib/badges";

/**
 * Gamified badge wall: earned badges glow in their rarity color; locked ones are
 * dimmed with a progress bar showing how close the creator is to unlocking them.
 */
export default function BadgeGallery({ items }: { items: BadgeProgress[] }) {
  const earnedCount = items.filter((i) => i.earned).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
          Unlock badges by running campaigns, hitting view milestones and building trust with brands.
        </div>
        <div className="tabular" style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-text)", whiteSpace: "nowrap" }}>
          {earnedCount} / {items.length}
        </div>
      </div>

      <div className="badge-gallery">
        {items.map(({ def, earned, pct, label }) => {
          const r = RARITY[def.rarity];
          return (
            <div
              key={def.id}
              className={`badge-tile ${earned ? "badge-tile-earned" : "badge-tile-locked"}`}
              style={earned ? { background: r.bg, borderColor: r.border } : undefined}
              title={def.description}
            >
              <div className="badge-tile-top">
                <span className="badge-tile-emoji">{def.emoji}</span>
                <span
                  className="badge-tile-rarity"
                  style={{ color: earned ? r.color : "var(--text-dimmer)" }}
                >
                  {r.label}
                </span>
              </div>
              <div className="badge-tile-name">{def.name}</div>
              <div className="badge-tile-desc">{def.description}</div>

              {earned ? (
                <div className="badge-tile-status" style={{ color: r.color }}>✓ Unlocked</div>
              ) : pct != null ? (
                <div className="badge-tile-progress">
                  <div className="badge-progress-track">
                    <div className="badge-progress-fill" style={{ width: `${Math.round(pct * 100)}%` }} />
                  </div>
                  {label && <div className="badge-tile-metric">{label}</div>}
                </div>
              ) : (
                <div className="badge-tile-status badge-tile-locked-label">🔒 Locked</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { RARITY, type BadgeProgress } from "@/lib/badges";

/**
 * Gamified badge wall: earned badges glow as rarity-colored medallions; locked
 * ones are dimmed with a progress bar showing how close the creator is.
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
              className={`badge-card ${earned ? "is-earned" : "is-locked"}`}
              title={def.description}
            >
              <div
                className="badge-medal"
                style={earned ? { background: r.bg, borderColor: r.border, boxShadow: `0 0 22px -4px ${r.border}` } : undefined}
              >
                <span className="badge-medal-emoji">{def.emoji}</span>
                {!earned && pct == null && <span className="badge-lock">🔒</span>}
              </div>

              <div className="badge-card-name">{def.name}</div>
              <div className="badge-card-rarity" style={{ color: earned ? r.color : "var(--text-dimmer)" }}>
                {r.label}
              </div>

              {earned ? (
                <div className="badge-card-status" style={{ color: r.color }}>✓ Unlocked</div>
              ) : pct != null ? (
                <div className="badge-card-prog">
                  <div className="badge-progress-track">
                    <div className="badge-progress-fill" style={{ width: `${Math.round(pct * 100)}%` }} />
                  </div>
                  {label && <div className="badge-card-metric">{label}</div>}
                </div>
              ) : (
                <div className="badge-card-status badge-card-locked">Locked</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

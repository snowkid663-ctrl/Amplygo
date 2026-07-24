"use client";

import CountUp from "./CountUp";
import PlatformIcon from "./PlatformIcon";
import type { Platform } from "@/lib/types";

const bars: { platform: Platform; label: string; pct: number }[] = [
  { platform: "TIKTOK", label: "TikTok", pct: 82 },
  { platform: "INSTAGRAM_REELS", label: "Instagram", pct: 58 },
  { platform: "YOUTUBE_SHORTS", label: "YouTube", pct: 34 },
];

/** The "living" campaign dashboard shown in the hero — animated counters + bars. */
export default function LiveCampaignCard() {
  return (
    <div className="live-card glass-strong glass-hi grad-border">
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--text-dim)" }}>Campaign</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Nike Air Max &apos;24</div>
        </div>
        <span className="badge badge-sm" style={{ background: "var(--green-bg)", color: "var(--green)", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span className="pulse-dot" /> Live
        </span>
      </div>

      {/* big metric */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 2 }}>Views generated</div>
          <div className="gradient-text-pink" style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 }}>
            <CountUp to={12.4} duration={1600} format={(n) => n.toFixed(1) + "M"} />
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--green)" }}>
            +$<CountUp to={4821} duration={1600} />
          </div>
          <div style={{ fontSize: 11, color: "var(--text-dim)" }}>earned today</div>
        </div>
      </div>

      {/* platform bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
        {bars.map((b, i) => (
          <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 84, display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "var(--text-dim)" }}>
              <PlatformIcon platform={b.platform} size={15} />
              {b.label}
            </div>
            <div className="bar" style={{ flex: 1 }}>
              <span style={{ width: `${b.pct}%`, background: "linear-gradient(90deg, var(--accent-1), var(--accent-2))", animationDelay: `${0.2 + i * 0.15}s` }} />
            </div>
          </div>
        ))}
      </div>

      {/* footer stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 16, borderTop: "1px solid var(--hairline)" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            <CountUp to={1284} duration={1600} />
          </div>
          <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
            creators joined <span style={{ color: "var(--green)" }}>+12 today</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            $<CountUp to={18240} duration={1600} /> <span style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 500 }}>/ $25k</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-dim)" }}>budget spent</div>
        </div>
      </div>
    </div>
  );
}

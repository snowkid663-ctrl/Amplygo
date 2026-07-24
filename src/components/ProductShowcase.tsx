"use client";

import { useState } from "react";

/**
 * Big framed product screenshot with a glow behind it. Drop a real screenshot
 * at public/product.png and it shows automatically; otherwise a styled
 * dashboard mock is rendered as a graceful fallback.
 */
export default function ProductShowcase() {
  const [failed, setFailed] = useState(false);

  return (
    <div className="showcase-wrap">
      <div className="showcase-glow" aria-hidden="true" />
      <div className="showcase-frame">
        <div className="showcase-bar">
          <span className="d" />
          <span className="d" />
          <span className="d" />
          <div style={{ marginLeft: 12, fontSize: 12, color: "var(--text-dim)" }}>app.amplygo.com</div>
        </div>

        {!failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/product.png" alt="AmplyGo campaign dashboard" onError={() => setFailed(true)} />
        ) : (
          <MockDashboard />
        )}
      </div>
    </div>
  );
}

function MockDashboard() {
  const bars = [42, 68, 55, 80, 61, 92, 74, 100, 83];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", minHeight: 380 }}>
      {/* rail */}
      <div style={{ borderRight: "1px solid var(--hairline)", padding: "18px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="hp-line accent" style={{ width: "60%" }} />
        {["70%", "85%", "55%", "78%", "48%", "66%"].map((w, i) => (
          <div key={i} className="hp-line" style={{ width: w }} />
        ))}
      </div>
      {/* main */}
      <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-dim)" }}>Total views this month</div>
            <div className="gradient-text-pink" style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em" }}>4,812,904</div>
          </div>
          <span className="badge badge-sm badge-green">▲ 24% vs last month</span>
        </div>
        {/* chart */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 150, padding: "0 4px" }}>
          {bars.map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${h}%`,
                borderRadius: "6px 6px 0 0",
                background: "linear-gradient(180deg, var(--accent-1), var(--accent-2))",
                opacity: 0.35 + (i / bars.length) * 0.65,
              }}
            />
          ))}
        </div>
        {/* stat row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { k: "Active campaigns", v: "12" },
            { k: "Creators", v: "1,284" },
            { k: "Spent", v: "$18,240" },
          ].map((s) => (
            <div key={s.k} className="stat-tile">
              <div className="k">{s.k}</div>
              <div className="v">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

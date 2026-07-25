"use client";

import { useState } from "react";
import MiniAreaChart from "./MiniAreaChart";
import { formatCents } from "@/lib/money";
import type { Currency } from "@/lib/types";

/**
 * Stripe-style chart with a date-range switcher (7D / 30D / 90D). The series
 * are precomputed server-side (deterministic demo) and passed in per range.
 */
export default function RangeAreaChart({
  ranges,
  currency,
  height = 200,
}: {
  ranges: Record<string, number[]>;
  currency: Currency;
  height?: number;
}) {
  const keys = Object.keys(ranges);
  const [active, setActive] = useState(keys.includes("30D") ? "30D" : keys[0]);
  const data = ranges[active] ?? [];
  const total = data.reduce((a, b) => a + b, 0);
  const rangeLabel: Record<string, string> = { "7D": "Last 7 days", "30D": "Last 30 days", "90D": "Last 90 days" };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "4px 4px 14px", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div className="tabular" style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
            {formatCents(total, currency)}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>{rangeLabel[active] ?? active}</div>
        </div>
        <div className="range-tabs">
          {keys.map((k) => (
            <button key={k} className={`range-tab ${active === k ? "active" : ""}`} onClick={() => setActive(k)} type="button">
              {k}
            </button>
          ))}
        </div>
      </div>
      <MiniAreaChart data={data} height={height} />
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 6px 0", fontSize: 12, color: "var(--text-dimmer)" }}>
        <span>{active === "7D" ? "7 days ago" : active === "90D" ? "90 days ago" : "30 days ago"}</span>
        <span>Today</span>
      </div>
    </div>
  );
}

"use client";

import { useState, type ReactNode } from "react";

export default function CampaignTabs({ tabs }: { tabs: { key: string; label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.key);
  return (
    <div>
      <div className="tabbar">
        {tabs.map((t) => (
          <button key={t.key} className={`tab ${active === t.key ? "tab-active" : ""}`} onClick={() => setActive(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      <div>{tabs.find((t) => t.key === active)?.content}</div>
    </div>
  );
}

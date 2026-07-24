"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Client-side search + filter bar. Filters any descendant rows that carry a
 * `data-search` attribute by hiding the ones that don't match — no refetch.
 */
export default function TableSearch({
  placeholder,
  right,
  children,
}: {
  placeholder: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rows = ref.current?.querySelectorAll<HTMLElement>("[data-search]");
    if (!rows) return;
    const term = q.trim().toLowerCase();
    rows.forEach((r) => {
      const hit = !term || (r.dataset.search ?? "").toLowerCase().includes(term);
      r.style.display = hit ? "" : "none";
    });
  }, [q]);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <input
          className="input"
          placeholder={placeholder}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: 340 }}
        />
        {right}
      </div>
      <div ref={ref}>{children}</div>
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

export interface Option {
  value: string;
  label: string;
}

/** Chip-style multi-select with a searchable dropdown. */
export default function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select…",
  searchable = false,
}: {
  options: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v;
  const toggle = (v: string) => onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  const filtered = q ? options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase())) : options;

  return (
    <div ref={ref} className="ms" style={{ position: "relative" }}>
      <button type="button" className="ms-control input" onClick={() => setOpen((o) => !o)}>
        {selected.length === 0 ? (
          <span style={{ color: "var(--text-dimmer)" }}>{placeholder}</span>
        ) : (
          <span className="ms-chips">
            {selected.map((v) => (
              <span key={v} className="ms-chip">
                {labelOf(v)}
                <span
                  role="button"
                  aria-label={`Remove ${labelOf(v)}`}
                  className="ms-chip-x"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(v);
                  }}
                >
                  ×
                </span>
              </span>
            ))}
          </span>
        )}
        <span className={`ms-caret ${open ? "open" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="ms-menu fu">
          {searchable && (
            <input
              autoFocus
              className="ms-search"
              placeholder="Search…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          )}
          <div className="ms-options">
            {filtered.map((o) => {
              const on = selected.includes(o.value);
              return (
                <button type="button" key={o.value} className={`ms-option ${on ? "on" : ""}`} onClick={() => toggle(o.value)}>
                  <span className={`ms-check ${on ? "on" : ""}`}>{on ? "✓" : ""}</span>
                  {o.label}
                </button>
              );
            })}
            {filtered.length === 0 && <div className="ms-empty">No matches</div>}
          </div>
        </div>
      )}
    </div>
  );
}

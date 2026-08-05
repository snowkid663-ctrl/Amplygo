"use client";

import { useState } from "react";
import { Button } from "./ui/Button";

export default function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <code
        style={{
          flex: 1,
          minWidth: 200,
          fontSize: 12.5,
          background: "oklch(100% 0 0 / 0.05)",
          border: "1px solid var(--hairline)",
          borderRadius: 8,
          padding: "9px 12px",
          fontFamily: "monospace",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </code>
      <Button small variant="secondary" onClick={copy}>{copied ? "Copied!" : "Copy"}</Button>
    </div>
  );
}

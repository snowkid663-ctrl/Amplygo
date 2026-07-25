"use client";

import { useState } from "react";
import { Button } from "./ui/Button";

export default function ShareResults({ campaignId, token: initial }: { campaignId: string; token: string | null }) {
  const [token, setToken] = useState<string | null>(initial);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = token ? `${origin}/share/${token}` : "";

  async function enable() {
    setLoading(true);
    const r = await fetch(`/api/campaigns/${campaignId}/share`, { method: "POST" });
    const d = await r.json().catch(() => ({}));
    setLoading(false);
    if (d.token) setToken(d.token);
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  if (!token) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
          Turn this campaign&apos;s results into a beautiful public page you can share.
        </div>
        <Button small onClick={enable} disabled={loading}>
          {loading ? "Creating…" : "Create results link"}
        </Button>
      </div>
    );
  }

  const text = encodeURIComponent("Our creator campaign results on AmplyGo:");
  const enc = encodeURIComponent(url);
  const x = `https://twitter.com/intent/tweet?text=${text}&url=${enc}`;
  const li = `https://www.linkedin.com/sharing/share-offsite/?url=${enc}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <code style={{ flex: 1, minWidth: 200, fontSize: 12, background: "oklch(100% 0 0 / 0.05)", border: "1px solid var(--hairline)", borderRadius: 8, padding: "9px 12px", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {url}
        </code>
        <Button small variant="secondary" onClick={copy}>{copied ? "Copied!" : "Copy"}</Button>
        <a className="btn btn-secondary btn-sm" href={url} target="_blank" rel="noreferrer">Open</a>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <a className="btn btn-secondary btn-sm" href={x} target="_blank" rel="noreferrer">Share on X</a>
        <a className="btn btn-secondary btn-sm" href={li} target="_blank" rel="noreferrer">Share on LinkedIn</a>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/Button";

export default function ShareResults({
  campaignId,
  token: initial,
  compact = false,
}: {
  campaignId: string;
  token: string | null;
  compact?: boolean;
}) {
  const [token, setToken] = useState<string | null>(initial);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = token ? `${origin}/share/${token}` : "";

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  async function enable() {
    setLoading(true);
    const r = await fetch(`/api/campaigns/${campaignId}/share`, { method: "POST" });
    const d = await r.json().catch(() => ({}));
    setLoading(false);
    if (d.token) setToken(d.token);
    return d.token as string | undefined;
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

  const text = encodeURIComponent("Our creator campaign results on AmplyGo:");
  const enc = encodeURIComponent(url);
  const x = `https://twitter.com/intent/tweet?text=${text}&url=${enc}`;
  const li = `https://www.linkedin.com/sharing/share-offsite/?url=${enc}`;

  const linkRow = (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <code
          style={{
            flex: 1,
            minWidth: 200,
            fontSize: 12,
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
          {url}
        </code>
        <Button small variant="secondary" onClick={copy}>{copied ? "Copied!" : "Copy"}</Button>
        <a className="btn btn-secondary btn-sm" href={url} target="_blank" rel="noreferrer">Open</a>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <a className="btn btn-secondary btn-sm" href={x} target="_blank" rel="noreferrer">Share on X</a>
        <a className="btn btn-secondary btn-sm" href={li} target="_blank" rel="noreferrer">Share on LinkedIn</a>
      </div>
    </>
  );

  // ---- Compact: a single button in a panel header that reveals a popover ----
  if (compact) {
    return (
      <div ref={ref} style={{ position: "relative" }}>
        <Button
          small
          variant="secondary"
          onClick={async () => {
            if (!token) await enable();
            setOpen((o) => !o);
          }}
          disabled={loading}
        >
          {loading ? "Creating…" : "↗ Share results"}
        </Button>
        {open && token && (
          <div className="share-popover fu">
            <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 10 }}>Public results page</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{linkRow}</div>
          </div>
        )}
      </div>
    );
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

  return <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{linkRow}</div>;
}

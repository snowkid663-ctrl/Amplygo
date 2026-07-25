"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import Modal from "./Modal";
import MiniAreaChart from "./MiniAreaChart";
import { formatNumber } from "@/lib/format";

interface Preview {
  companyName: string;
  campaignName: string;
  totalViews: number;
  revenue: string;
  roas: string;
  series: number[];
}

export default function ShareResults({
  campaignId,
  token: initial,
  compact = false,
  preview,
}: {
  campaignId: string;
  token: string | null;
  compact?: boolean;
  preview?: Preview;
}) {
  const [token, setToken] = useState<string | null>(initial);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = token ? `${origin}/share/${token}` : "";
  const displayUrl = token ? url.replace(/^https?:\/\//, "") : "amplygo.com/share/…";

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

  // Miniature of the public results page.
  const previewCard = preview && (
    <div className="share-preview">
      <div className="share-preview-bar">
        <span className="dot r" /><span className="dot y" /><span className="dot g" />
        <div className="share-preview-url">🔒 {displayUrl}</div>
      </div>
      <div className="share-preview-body">
        <div style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 600 }}>
          {preview.companyName} · Campaign results
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, margin: "2px 0 10px", letterSpacing: "-0.01em" }}>{preview.campaignName}</div>
        <div className="gradient-text-pink" style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
          {formatNumber(preview.totalViews)}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-dim)", margin: "2px 0 10px" }}>organic views generated</div>
        <div style={{ opacity: 0.9 }}>
          <MiniAreaChart data={preview.series} height={70} />
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
          <div><div className="share-preview-k">Revenue</div><div className="share-preview-v">{preview.revenue}</div></div>
          <div><div className="share-preview-k">ROAS</div><div className="share-preview-v">{preview.roas}</div></div>
        </div>
      </div>
    </div>
  );

  // ---- Compact: a button in the panel header that opens a Stripe-style modal ----
  if (compact) {
    return (
      <>
        <Button small variant="secondary" onClick={() => setOpen(true)}>↗ Share results</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Share campaign results" width={560}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
              Create a public page anyone can open — a snapshot of this campaign&apos;s results.
            </div>
            {previewCard}
            {token ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{linkRow}</div>
            ) : (
              <Button onClick={enable} disabled={loading}>
                {loading ? "Creating…" : "Create results link"}
              </Button>
            )}
          </div>
        </Modal>
      </>
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

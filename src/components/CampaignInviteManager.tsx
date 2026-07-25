"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { Input, Select } from "./ui/Field";
import Modal from "./Modal";
import type { CampaignInviteRow } from "@/lib/types";

export default function CampaignInviteManager({
  campaignId,
  invites,
}: {
  campaignId: string;
  invites: CampaignInviteRow[];
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [requireApproval, setRequireApproval] = useState(false);
  const [expiresDays, setExpiresDays] = useState("0");
  const [maxUses, setMaxUses] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [panel, setPanel] = useState<{ id: string; token: string; kind: "qr" | "embed" } | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const linkFor = (token: string) => `${origin}/invite/${token}`;
  const embedFor = (token: string) =>
    `<iframe src="${origin}/embed/${token}" width="360" height="240" style="border:0;border-radius:14px" title="AmplyGo campaign"></iframe>`;

  async function copyText(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600);
    } catch {
      /* ignore */
    }
  }

  async function create() {
    setLoading(true);
    await fetch(`/api/campaigns/${campaignId}/invites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label,
        requireApproval,
        expiresDays: Number(expiresDays) || 0,
        maxUses: maxUses ? Number(maxUses) : null,
      }),
    });
    setLoading(false);
    setCreateOpen(false);
    setLabel("");
    setMaxUses("");
    setExpiresDays("0");
    setRequireApproval(false);
    router.refresh();
  }

  async function revoke(id: string) {
    await fetch(`/api/invites/${id}`, { method: "DELETE" });
    router.refresh();
  }

  function statusOf(inv: CampaignInviteRow): string {
    if (!inv.active) return "Revoked";
    if (inv.expiresAt && new Date(inv.expiresAt).getTime() < Date.now()) return "Expired";
    if (inv.maxUses != null && inv.uses >= inv.maxUses) return "Limit reached";
    return "Active";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
          Share a link so creators can join. Track clicks and joins per link.
        </div>
        <Button small onClick={() => setCreateOpen(true)}>Invite creators</Button>
      </div>

      {invites.length > 0 && (
        <div className="card" style={{ overflow: "hidden" }}>
          {invites.map((inv, i) => {
            const status = statusOf(inv);
            const conv = inv.clicks > 0 ? Math.round((inv.uses / inv.clicks) * 100) : 0;
            return (
              <div
                key={inv.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "12px 16px",
                  borderTop: i === 0 ? "none" : "1px solid var(--hairline)",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                    {inv.label || "Invite link"}
                    <span className={`badge badge-sm ${status === "Active" ? "badge-green" : "badge-neutral"}`}>{status}</span>
                    {inv.requireApproval ? <span className="badge badge-sm badge-amber">Approval</span> : null}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-dimmer)", fontFamily: "monospace" }}>/invite/{inv.token}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                    <b style={{ color: "white" }}>{inv.clicks}</b> clicks · <b style={{ color: "white" }}>{inv.uses}</b> joins ·{" "}
                    <b style={{ color: "var(--accent-text)" }}>{conv}%</b>
                  </div>
                  <Button small variant="secondary" onClick={() => copyText(linkFor(inv.token), inv.token)}>
                    {copied === inv.token ? "Copied!" : "Copy"}
                  </Button>
                  <Button small variant="secondary" onClick={() => setPanel({ id: inv.id, token: inv.token, kind: "qr" })}>QR</Button>
                  <Button small variant="secondary" onClick={() => setPanel({ id: inv.id, token: inv.token, kind: "embed" })}>Embed</Button>
                  {inv.active ? <Button small variant="danger" onClick={() => revoke(inv.id)}>Revoke</Button> : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New invite link">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="field">
            <label>Label / channel</label>
            <Input placeholder="Discord, WhatsApp, Email…" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="resp-collapse">
            <div className="field">
              <label>Expiration</label>
              <Select value={expiresDays} onChange={(e) => setExpiresDays(e.target.value)}>
                <option value="0">Never</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
              </Select>
            </div>
            <div className="field">
              <label>Max uses</label>
              <Input type="number" min={1} placeholder="Unlimited" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "oklch(80% 0.005 264)" }}>
            <input type="checkbox" checked={requireApproval} onChange={(e) => setRequireApproval(e.target.checked)} />
            Require my approval before a creator joins
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button small variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button small onClick={create} disabled={loading}>{loading ? "Creating…" : "Create link"}</Button>
          </div>
        </div>
      </Modal>

      {/* QR / Embed modal */}
      <Modal open={!!panel} onClose={() => setPanel(null)} title={panel?.kind === "qr" ? "QR code" : "Embed widget"}>
        {panel?.kind === "qr" ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/invites/${panel.id}/qr`} alt="QR code" width={200} height={200} style={{ background: "white", borderRadius: 12, padding: 10 }} />
            <div style={{ fontSize: 13, color: "var(--text-dim)", textAlign: "center" }}>
              Scan to open the campaign invite.
              <br />
              <a href={`/api/invites/${panel.id}/qr`} download={`amplygo-${panel.token}.svg`}>Download SVG ↓</a>
            </div>
          </div>
        ) : panel ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Paste this on your site to embed a join widget:</div>
            <code style={{ display: "block", fontSize: 12, background: "oklch(100% 0 0 / 0.05)", border: "1px solid var(--hairline)", borderRadius: 8, padding: "12px 14px", wordBreak: "break-all", fontFamily: "monospace" }}>
              {embedFor(panel.token)}
            </code>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button small onClick={() => copyText(embedFor(panel.token), `embed-${panel.id}`)}>
                {copied === `embed-${panel.id}` ? "Copied!" : "Copy embed code"}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

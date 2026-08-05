"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { Input, Select } from "./ui/Field";
import Modal from "./Modal";
import PlatformIcon from "./PlatformIcon";
import type { CampaignInviteRow, Platform } from "@/lib/types";

const THEME_COLORS = ["#22c55e", "#06b6d4", "#6366f1", "#a855f7", "#ec4899", "#f59e0b", "#ef4444", "#e2e8f0"];

interface InvitePreview {
  companyName: string;
  brand: string;
  campaignName: string;
  cpmLabel: string;
  platform: Platform;
}

export default function CampaignInviteManager({
  campaignId,
  invites,
  preview,
}: {
  campaignId: string;
  invites: CampaignInviteRow[];
  preview?: InvitePreview;
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
  const [themeColor, setThemeColor] = useState<string | null>(null);
  const [themeBgUrl, setThemeBgUrl] = useState<string | null>(null);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [created, setCreated] = useState<string | null>(null); // token of a freshly-created link
  const bgInput = useRef<HTMLInputElement>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const linkFor = (token: string) => `${origin}/invite/${token}`;
  const embedFor = (token: string) =>
    `<iframe src="${origin}/embed/${token}" width="360" height="240" style="border:0;border-radius:14px" title="AmplyGo campaign"></iframe>`;

  async function uploadBg(file: File | undefined) {
    if (!file) return;
    setUploadingBg(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setUploadingBg(false);
    if (res.ok) setThemeBgUrl((await res.json()).url);
  }

  async function copyText(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600);
    } catch {
      /* ignore */
    }
  }

  function resetForm() {
    setLabel("");
    setMaxUses("");
    setExpiresDays("0");
    setRequireApproval(false);
    setThemeColor(null);
    setThemeBgUrl(null);
  }

  function openCreate() {
    setCreated(null);
    resetForm();
    setCreateOpen(true);
  }

  async function create() {
    setLoading(true);
    const res = await fetch(`/api/campaigns/${campaignId}/invites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, requireApproval, expiresDays: Number(expiresDays) || 0, maxUses: maxUses ? Number(maxUses) : null, themeColor, themeBgUrl }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (data?.invite?.token) {
      const token = data.invite.token as string;
      setCreated(token);
      copyText(linkFor(token), "created"); // auto-copy so it's on the clipboard
      router.refresh();
    }
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

  const accent = themeColor;
  const previewCard = preview && (
    <div className="invite-preview" style={{ borderColor: accent ? `${accent}55` : "var(--card-border)" }}>
      {themeBgUrl && <div className="invite-preview-bg" style={{ backgroundImage: `url(${themeBgUrl})` }} />}
      <div className="invite-preview-inner">
        <div style={{ fontSize: 10.5, color: "var(--text-dim)" }}>You&apos;re invited by <b style={{ color: "white" }}>{preview.companyName}</b></div>
        <div style={{ fontSize: 12, fontWeight: 700, color: accent ?? "var(--accent-text)" }}>{preview.brand}</div>
        <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.15 }}>{preview.campaignName}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
          <span className="tabular" style={{ fontSize: 18, fontWeight: 800, color: accent ?? "var(--accent-text)" }}>{preview.cpmLabel}</span>
          <span style={{ fontSize: 10.5, color: "var(--text-dim)" }}>per 1,000 views</span>
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-dim)" }}>
            <PlatformIcon platform={preview.platform} size={13} />
          </span>
        </div>
        <div className="invite-preview-cta" style={{ background: accent ?? "linear-gradient(135deg, var(--accent-1), var(--accent-2))" }}>
          Create account to join →
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Share a link so creators can join. Track clicks and joins per link.</div>
        <Button small onClick={openCreate}>Invite creators</Button>
      </div>

      {invites.length > 0 && (
        <div className="card" style={{ overflow: "hidden" }}>
          {invites.map((inv, i) => {
            const status = statusOf(inv);
            const conv = inv.clicks > 0 ? Math.round((inv.uses / inv.clicks) * 100) : 0;
            return (
              <div key={inv.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 16px", borderTop: i === 0 ? "none" : "1px solid var(--hairline)", flexWrap: "wrap" }}>
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
                    <b style={{ color: "white" }}>{inv.clicks}</b> clicks · <b style={{ color: "white" }}>{inv.uses}</b> joins · <b style={{ color: "var(--accent-text)" }}>{conv}%</b>
                  </div>
                  <Button small variant="secondary" onClick={() => copyText(linkFor(inv.token), inv.token)}>{copied === inv.token ? "Copied!" : "Copy"}</Button>
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
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={created ? "Invite link ready" : "New invite link"} width={560}>
        {created ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="invite-success">✓ Link created and copied to your clipboard.</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <code style={{ flex: 1, minWidth: 200, fontSize: 12.5, background: "oklch(100% 0 0 / 0.05)", border: "1px solid var(--hairline)", borderRadius: 8, padding: "9px 12px", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{linkFor(created)}</code>
              <Button small variant="secondary" onClick={() => copyText(linkFor(created), "created")}>{copied === "created" ? "Copied!" : "Copy"}</Button>
              <a className="btn btn-secondary btn-sm" href={linkFor(created)} target="_blank" rel="noreferrer">Open</a>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button small variant="secondary" onClick={openCreate}>Create another</Button>
              <Button small onClick={() => setCreateOpen(false)}>Done</Button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {previewCard && (
              <div>
                <div className="section-label" style={{ marginBottom: 8 }}>Preview — what creators see</div>
                {previewCard}
              </div>
            )}
            <div className="field">
              <label>Link name (optional)</label>
              <Input placeholder="e.g. Discord drop, IG story, newsletter" value={label} onChange={(e) => setLabel(e.target.value)} />
              <div style={{ fontSize: 12, color: "var(--text-dimmer)", marginTop: 4 }}>Just for you — to tell your links apart in the list.</div>
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

            <div className="field">
              <label>Accent color</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                {THEME_COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setThemeColor((cur) => (cur === c ? null : c))} aria-label={`Accent ${c}`} className="swatch" style={{ background: c, outline: themeColor === c ? "2px solid white" : "2px solid transparent", outlineOffset: 2 }} />
                ))}
                <span style={{ fontSize: 12, color: "var(--text-dimmer)" }}>{themeColor ? "Custom" : "Default (mint)"}</span>
              </div>
            </div>

            <div className="field">
              <label>Background image (optional)</label>
              <input ref={bgInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={(e) => uploadBg(e.target.files?.[0])} />
              <div className="invite-bg-preview" style={{ backgroundImage: themeBgUrl ? `url(${themeBgUrl})` : undefined, borderColor: themeColor ?? "var(--card-border)" }}>
                <div className="invite-bg-preview-inner" style={{ background: themeColor ? `${themeColor}22` : undefined }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button small variant="secondary" onClick={() => bgInput.current?.click()} disabled={uploadingBg}>{uploadingBg ? "Uploading…" : themeBgUrl ? "Replace image" : "Upload image"}</Button>
                    {themeBgUrl && <Button small variant="secondary" onClick={() => setThemeBgUrl(null)}>Remove</Button>}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-dimmer)", marginTop: 6 }}>Shown behind your invite page. PNG, JPEG, WebP or GIF · up to 5 MB.</div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button small variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button small onClick={create} disabled={loading}>{loading ? "Creating…" : "Create link"}</Button>
            </div>
          </div>
        )}
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
            <code style={{ display: "block", fontSize: 12, background: "oklch(100% 0 0 / 0.05)", border: "1px solid var(--hairline)", borderRadius: 8, padding: "12px 14px", wordBreak: "break-all", fontFamily: "monospace" }}>{embedFor(panel.token)}</code>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button small onClick={() => copyText(embedFor(panel.token), `embed-${panel.id}`)}>{copied === `embed-${panel.id}` ? "Copied!" : "Copy embed code"}</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

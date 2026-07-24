"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { Input } from "./ui/Field";
import { PLATFORM_LABEL, type Platform, type SocialAccountRow } from "@/lib/types";
import PlatformIcon from "./PlatformIcon";

const PLATFORMS: Platform[] = ["TIKTOK", "YOUTUBE_SHORTS", "INSTAGRAM_REELS"];

// Platforms connected through a real OAuth flow, and the provider slug used by
// the /api/connect/[provider] routes.
const OAUTH_PROVIDER: Partial<Record<Platform, "youtube" | "instagram">> = {
  YOUTUBE_SHORTS: "youtube",
  INSTAGRAM_REELS: "instagram",
};

export default function SocialAccountsPanel({
  accounts,
  connectStatus,
}: {
  accounts: SocialAccountRow[];
  connectStatus: { youtube: boolean; instagram: boolean };
}) {
  const router = useRouter();
  const [handles, setHandles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Platform | null>(null);
  const byPlatform = new Map(accounts.map((a) => [a.platform, a]));

  async function connectManual(platform: Platform) {
    const handle = handles[platform]?.trim();
    if (!handle) return;
    setLoading(platform);
    await fetch("/api/social-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, handle }),
    });
    setLoading(null);
    router.refresh();
  }

  async function disconnect(platform: Platform) {
    setLoading(platform);
    await fetch("/api/social-accounts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      {PLATFORMS.map((platform, i) => {
        const account = byPlatform.get(platform);
        const provider = OAUTH_PROVIDER[platform];
        const oauthEnabled = provider ? connectStatus[provider] : false;

        return (
          <div
            key={platform}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderTop: i === 0 ? "none" : "1px solid var(--hairline)",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "oklch(20% 0.01 264)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PlatformIcon platform={platform} size={20} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  {PLATFORM_LABEL[platform]}
                  {account?.connectedVia === "OAUTH" && <span className="badge badge-sm badge-green">via API</span>}
                </div>
                <div style={{ fontSize: 12, color: account ? "var(--green)" : "var(--text-dim)" }}>
                  {account ? `Connected as ${account.handle}` : "Not connected"}
                </div>
              </div>
            </div>

            {account ? (
              <Button small variant="danger" onClick={() => disconnect(platform)} disabled={loading === platform}>
                Disconnect
              </Button>
            ) : provider ? (
              // Real OAuth connect (full-page redirect to the provider's consent).
              oauthEnabled ? (
                <a className="btn btn-primary btn-sm" href={`/api/connect/${provider}`}>
                  Connect with {PLATFORM_LABEL[platform]}
                </a>
              ) : (
                <button className="btn btn-secondary btn-sm" disabled title="Add OAuth credentials to .env — see SETUP-OAUTH.md">
                  Setup required
                </button>
              )
            ) : (
              // TikTok: manual handle for now (no OAuth app wired up).
              <div style={{ display: "flex", gap: 8 }}>
                <Input
                  placeholder="@handle"
                  style={{ width: 140 }}
                  value={handles[platform] ?? ""}
                  onChange={(e) => setHandles((h) => ({ ...h, [platform]: e.target.value }))}
                />
                <Button small onClick={() => connectManual(platform)} disabled={loading === platform}>
                  Connect
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

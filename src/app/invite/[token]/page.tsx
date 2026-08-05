import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import {
  getInviteByToken,
  getCampaignById,
  getCompanyById,
  incrementInviteClicks,
} from "@/lib/data";
import { formatCents } from "@/lib/money";
import { PLATFORM_LABEL } from "@/lib/types";
import PlatformIcon from "@/components/PlatformIcon";
import BrandLogo from "@/components/BrandLogo";
import NetworkBackground from "@/components/NetworkBackground";
import InviteJoinButton from "@/components/InviteJoinButton";

export const dynamic = "force-dynamic";

function companyInitials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  return (p.length === 1 ? p[0].slice(0, 2) : (p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "?";
}

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { ref?: string };
}) {
  const invite = await getInviteByToken(params.token);
  if (!invite) notFound();

  const campaign = await getCampaignById(invite.campaignId);
  const company = campaign ? await getCompanyById(campaign.companyId) : null;
  if (!campaign || !company) notFound();

  await incrementInviteClicks(invite.id).catch(() => {});

  const cur = company.currency;
  const expired = invite.expiresAt ? new Date(invite.expiresAt).getTime() < Date.now() : false;
  const full = invite.maxUses != null && invite.uses >= invite.maxUses;
  const notLive = campaign.status !== "ACTIVE";
  const usable = !!invite.active && !expired && !full && !notLive;

  // A precise, friendly reason when the link can't be used.
  const reason = !invite.active
    ? { tone: "err", text: "This invite link was revoked by the company." }
    : expired
    ? { tone: "err", text: "This invite link has expired." }
    : full
    ? { tone: "err", text: "This invite link reached its limit." }
    : notLive
    ? { tone: "info", text: "This campaign isn't live yet — it's awaiting approval. Check back soon!" }
    : null;

  const budgetLeft = Math.max(0, campaign.budgetCents - campaign.spentCents);
  const net = (views: number) => Math.round((views / 1000) * campaign.cpmCents * 0.9);
  const rules: string[] = JSON.parse(campaign.rulesChecklist || "[]");

  const session = await getSession();
  const isCreator = session?.user?.role === "CREATOR";
  const isLoggedIn = !!session?.user;
  const returnTo = `/invite/${invite.token}${searchParams.ref ? `?ref=${encodeURIComponent(searchParams.ref)}` : ""}`;

  const accent = invite.themeColor;
  const bgUrl = invite.themeBgUrl;
  const accentText = accent ?? "var(--accent-text)";
  const glow = accent ?? "oklch(72% 0.2 160)";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      {bgUrl ? (
        <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: -1 }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${bgUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, oklch(4% 0.01 264 / 0.55), oklch(4% 0.01 264 / 0.9))" }} />
        </div>
      ) : (
        <NetworkBackground />
      )}

      <div style={{ padding: "20px 32px" }}>
        <Link href="/" style={{ display: "inline-block" }}>
          <BrandLogo height={26} />
        </Link>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ position: "relative", width: 460, maxWidth: "100%" }}>
          {/* accent glow behind the card */}
          <div aria-hidden="true" className="invite-glow" style={{ background: `radial-gradient(circle, ${glow}, transparent 70%)` }} />

          <div className="fu glass-strong glass-hi invite-card" style={{ position: "relative", zIndex: 1 }}>
            {/* Brand header */}
            <div className="fu fu-1" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="invite-logo" style={{ borderColor: accent ?? "var(--card-border)" }}>
                {company.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logoUrl} alt={company.companyName} />
                ) : (
                  <span>{companyInitials(company.companyName)}</span>
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "var(--text-dim)" }}>You&apos;re invited by</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{company.companyName}</div>
              </div>
              <span className="invite-live" style={{ marginLeft: "auto", color: usable ? accentText : "var(--text-dimmer)" }}>
                <span className="dot" style={{ background: usable ? glow : "var(--text-dimmer)", boxShadow: usable ? `0 0 8px 1px ${glow}` : "none" }} />
                {usable ? "Live" : "Paused"}
              </span>
            </div>

            {/* Campaign */}
            <div className="fu fu-2">
              <div style={{ fontSize: 13, color: accentText, fontWeight: 600 }}>{campaign.brand}</div>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: "2px 0 0", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{campaign.name}</h1>
            </div>

            {/* Reward highlight */}
            <div className="fu fu-2 invite-reward" style={{ borderColor: accent ? `${accent}55` : undefined, background: accent ? `${accent}14` : undefined }}>
              <div>
                <div style={{ fontSize: 11.5, color: "var(--text-dim)" }}>You earn</div>
                <div className="tabular" style={{ fontSize: 24, fontWeight: 800, color: accentText }}>{formatCents(campaign.cpmCents, cur)}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-dim)" }}>per 1,000 views</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", fontSize: 12.5, color: "oklch(85% 0.01 264)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <PlatformIcon platform={campaign.platform} size={15} /> {PLATFORM_LABEL[campaign.platform]}
                </span>
                <span>🌎 {campaign.country}</span>
                <span>💰 {formatCents(budgetLeft, cur)} left</span>
              </div>
            </div>

            {/* Estimated earnings */}
            <div className="fu fu-3">
              <div className="section-label" style={{ marginBottom: 8 }}>Estimated earnings</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, textAlign: "center" }}>
                {[
                  { v: "10k", n: net(10000) },
                  { v: "100k", n: net(100000) },
                  { v: "1M", n: net(1000000) },
                ].map((t) => (
                  <div key={t.v} className="invite-earn glass">
                    <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{t.v} views</div>
                    <div className={accent ? undefined : "gradient-text-pink"} style={{ fontSize: 18, fontWeight: 800, color: accent ?? undefined }}>
                      {formatCents(t.n, cur)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {rules.length > 0 && (
              <div className="fu fu-3">
                <div className="section-label" style={{ marginBottom: 8 }}>Requirements</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "var(--text-dim)" }}>
                  {rules.map((r) => (
                    <div key={r}>• {r}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Action */}
            <div className="fu fu-4">
              {reason ? (
                <div className={reason.tone === "info" ? "invite-info" : "alert-error"}>{reason.text}</div>
              ) : isCreator ? (
                <InviteJoinButton token={invite.token} refCode={searchParams.ref} />
              ) : isLoggedIn ? (
                <div className="alert-error">Only creator accounts can join campaigns.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Link
                    href={`/auth?callbackUrl=${encodeURIComponent(returnTo)}`}
                    className="btn btn-primary glow-primary"
                    style={accent ? { borderRadius: 100, background: accent, borderColor: accent, color: "#04140c" } : { borderRadius: 100 }}
                  >
                    Create account to join →
                  </Link>
                  <Link href={`/auth?callbackUrl=${encodeURIComponent(returnTo)}`} className="btn btn-secondary glass" style={{ borderRadius: 100 }}>
                    Log in
                  </Link>
                </div>
              )}
              {invite.requireApproval && usable && (
                <div style={{ fontSize: 12, color: "var(--text-dimmer)", textAlign: "center", marginTop: 10 }}>
                  This campaign reviews join requests before approving.
                </div>
              )}
            </div>
          </div>

          <div className="fu fu-4" style={{ textAlign: "center", fontSize: 12, color: "var(--text-dimmer)", marginTop: 14 }}>
            Powered by AmplyGo
          </div>
        </div>
      </div>
    </div>
  );
}

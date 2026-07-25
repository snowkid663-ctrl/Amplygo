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
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

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

  // Count the visit (best-effort).
  await incrementInviteClicks(invite.id).catch(() => {});

  const cur = company.currency;
  const expired = invite.expiresAt ? new Date(invite.expiresAt).getTime() < Date.now() : false;
  const full = invite.maxUses != null && invite.uses >= invite.maxUses;
  const usable = !!invite.active && !expired && !full && campaign.status === "ACTIVE";

  const budgetLeft = Math.max(0, campaign.budgetCents - campaign.spentCents);
  const net = (views: number) => Math.round((views / 1000) * campaign.cpmCents * 0.9);
  const rules: string[] = JSON.parse(campaign.rulesChecklist || "[]");

  const session = await getSession();
  const isCreator = session?.user?.role === "CREATOR";
  const isLoggedIn = !!session?.user;
  const returnTo = `/invite/${invite.token}${searchParams.ref ? `?ref=${encodeURIComponent(searchParams.ref)}` : ""}`;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NetworkBackground />
      <div style={{ padding: "20px 32px" }}>
        <Link href="/" style={{ display: "inline-block" }}>
          <BrandLogo height={28} />
        </Link>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div
          className="fu glass-strong glass-hi"
          style={{ width: 460, maxWidth: "100%", padding: 30, display: "flex", flexDirection: "column", gap: 18, position: "relative", zIndex: 1 }}
        >
          <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
            Invited by <b style={{ color: "white" }}>{company.companyName}</b>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--accent-text)", fontWeight: 600 }}>{campaign.brand}</div>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: "2px 0 0", letterSpacing: "-0.02em" }}>{campaign.name}</h1>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 13, color: "oklch(85% 0.01 264)" }}>
            <span>💰 {formatCents(campaign.cpmCents, cur)} CPM</span>
            <span>🌎 {campaign.country}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <PlatformIcon platform={campaign.platform} size={15} /> {PLATFORM_LABEL[campaign.platform]}
            </span>
          </div>

          <div className="glass" style={{ padding: "12px 14px", borderRadius: 10, fontSize: 13 }}>
            <span style={{ color: "var(--text-dim)" }}>Budget remaining</span>{" "}
            <b style={{ float: "right" }}>{formatCents(budgetLeft, cur)}</b>
          </div>

          {rules.length > 0 && (
            <div>
              <div className="section-label" style={{ marginBottom: 8 }}>Requirements</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "var(--text-dim)" }}>
                {rules.map((r) => (
                  <div key={r}>• {r}</div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="section-label" style={{ marginBottom: 8 }}>Estimated earnings</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, textAlign: "center" }}>
              {[
                { v: "10k", n: net(10000) },
                { v: "100k", n: net(100000) },
                { v: "1M", n: net(1000000) },
              ].map((t) => (
                <div key={t.v} className="glass" style={{ padding: "12px 6px", borderRadius: 10 }}>
                  <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{t.v} views</div>
                  <div className="gradient-text-pink" style={{ fontSize: 18, fontWeight: 700 }}>{formatCents(t.n, cur)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action */}
          {!usable ? (
            <div className="alert-error">This invite link is no longer available.</div>
          ) : isCreator ? (
            <InviteJoinButton token={invite.token} refCode={searchParams.ref} />
          ) : isLoggedIn ? (
            <div className="alert-error">Only creator accounts can join campaigns.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link href={`/auth?callbackUrl=${encodeURIComponent(returnTo)}`} className="btn btn-primary glow-primary" style={{ borderRadius: 100 }}>
                Create account to join
              </Link>
              <Link href={`/auth?callbackUrl=${encodeURIComponent(returnTo)}`} className="btn btn-secondary glass" style={{ borderRadius: 100 }}>
                Log in
              </Link>
            </div>
          )}
          {invite.requireApproval && usable && isCreator && (
            <div style={{ fontSize: 12, color: "var(--text-dimmer)", textAlign: "center" }}>
              This campaign reviews join requests before approving.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

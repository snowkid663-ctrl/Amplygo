import { getInviteByToken, getCampaignById, getCompanyById } from "@/lib/data";
import { formatCents } from "@/lib/money";
import { PLATFORM_LABEL } from "@/lib/types";
import PlatformIcon from "@/components/PlatformIcon";

export const dynamic = "force-dynamic";

// Compact, self-contained "join this campaign" widget meant to be dropped into
// any site via <iframe src="/embed/<token>">. No app chrome.
export default async function EmbedPage({ params }: { params: { token: string } }) {
  const invite = await getInviteByToken(params.token);
  const campaign = invite ? await getCampaignById(invite.campaignId) : null;
  const company = campaign ? await getCompanyById(campaign.companyId) : null;

  const wrap: React.CSSProperties = {
    fontFamily: "'Inter Tight','Inter',system-ui,sans-serif",
    height: "100vh",
    padding: 16,
    display: "flex",
    boxSizing: "border-box",
  };

  if (!invite || !campaign || !company || !invite.active) {
    return (
      <div style={{ ...wrap, alignItems: "center", justifyContent: "center", color: "#8b949e", background: "#0d1117" }}>
        This campaign invite is no longer available.
      </div>
    );
  }

  const cur = company.currency;
  const budgetLeft = Math.max(0, campaign.budgetCents - campaign.spentCents);
  const href = `/invite/${invite.token}`;

  return (
    <div style={{ ...wrap, background: "radial-gradient(120% 100% at 50% 0%, #16211c, #0d1117)" }}>
      <div
        style={{
          width: "100%",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14,
          background: "rgba(255,255,255,0.04)",
          padding: 18,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          color: "#e6edf3",
        }}
      >
        <div style={{ fontSize: 11, color: "#8b949e" }}>{company.companyName} · AmplyGo campaign</div>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>{campaign.name}</div>
        <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#c9d1d9", alignItems: "center", flexWrap: "wrap" }}>
          <span>💰 {formatCents(campaign.cpmCents, cur)} CPM</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <PlatformIcon platform={campaign.platform} size={14} /> {PLATFORM_LABEL[campaign.platform]}
          </span>
          <span>🌎 {campaign.country}</span>
        </div>
        <div style={{ fontSize: 12, color: "#8b949e" }}>Budget remaining: {formatCents(budgetLeft, cur)}</div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginTop: 2,
            textAlign: "center",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 14,
            padding: "11px 18px",
            borderRadius: 100,
            color: "white",
            background: "linear-gradient(135deg, oklch(76% 0.19 158), oklch(75% 0.14 195))",
          }}
        >
          Join campaign →
        </a>
      </div>
    </div>
  );
}

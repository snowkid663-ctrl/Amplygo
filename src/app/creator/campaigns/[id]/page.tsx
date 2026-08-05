import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import {
  getCreatorByUserId,
  getCampaignById,
  getCompanyById,
  getParticipation,
  getSubmissionByParticipation,
  listSocialAccounts,
  getOrCreateTrackingLink,
} from "@/lib/data";
import { appBaseUrl } from "@/lib/urls";
import CopyField from "@/components/CopyField";
import { formatConverted } from "@/lib/money";
import { PLATFORM_LABEL } from "@/lib/types";
import PlatformIcon from "@/components/PlatformIcon";
import { formatDate } from "@/lib/format";
import CreatorNav from "@/components/CreatorNav";
import { Card } from "@/components/ui/Card";
import CampaignJoinPanel from "@/components/CampaignJoinPanel";

export default async function CreatorCampaignDetail({ params }: { params: { id: string } }) {
  const session = await requireRole("CREATOR");
  const creator = (await getCreatorByUserId(session.user.id))!;
  const campaign = await getCampaignById(params.id);
  if (!campaign) notFound();

  const participation = await getParticipation(campaign.id, creator.id);
  const submission = participation ? (await getSubmissionByParticipation(participation.id)) ?? null : null;
  const accounts = await listSocialAccounts(creator.id);
  const hasMatchingAccount = accounts.some((a) => a.platform === campaign.platform);
  const rulesChecklist: string[] = JSON.parse(campaign.rulesChecklist || "[]");
  const budgetLeft = Math.max(0, campaign.budgetCents - campaign.spentCents);
  const cur = creator.displayCurrency;
  const companyCur = (await getCompanyById(campaign.companyId))?.currency ?? "USD";

  // Per-creator tracking link (only meaningful once the company set a landing URL).
  const trackingLink =
    participation && campaign.landingUrl
      ? `${appBaseUrl()}/r/${(await getOrCreateTrackingLink(campaign.id, creator.id)).code}`
      : null;

  return (
    <CreatorNav title={campaign.name}>
      <div className="page-narrow">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: "oklch(100% 0 0 / 0.06)",
              border: "1px solid oklch(100% 0 0 / 0.1)",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--accent-text)",
            }}
          >
            {campaign.brand.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
              {campaign.brand} · {campaign.category}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{campaign.name}</h1>
          </div>
        </div>
        <div style={{ fontSize: 14, color: "oklch(75% 0.01 264)", lineHeight: 1.5, marginTop: -12 }}>{campaign.description}</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
          <Card style={{ padding: 16 }}>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>CPM</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{formatConverted(campaign.cpmCents, companyCur, cur)}</div>
          </Card>
          <Card style={{ padding: 16 }}>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>Budget left</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{formatConverted(budgetLeft, companyCur, cur)}</div>
          </Card>
          <Card style={{ padding: 16 }}>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>Platform</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 20, fontWeight: 700 }}>
              <PlatformIcon platform={campaign.platform} size={22} />
              {PLATFORM_LABEL[campaign.platform]}
            </div>
          </Card>
        </div>

        <Card style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Rules</div>
          <div style={{ fontSize: 14, color: "oklch(80% 0.005 264)", display: "flex", flexDirection: "column", gap: 8 }}>
            {rulesChecklist.map((r) => (
              <div key={r}>• {r}</div>
            ))}
            {campaign.rulesExtra && <div>• {campaign.rulesExtra}</div>}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-dimmer)" }}>
            {campaign.language} · {campaign.country}
            {campaign.endDate ? ` · Ends ${formatDate(campaign.endDate)}` : ""}
          </div>
        </Card>

        {trackingLink && (
          <Card style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Your tracking link</div>
            <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
              Put this link in your video description / bio. Sales it drives are credited to you and paid on top of views.
            </div>
            <CopyField value={trackingLink} />
          </Card>
        )}

        <CampaignJoinPanel
          campaignId={campaign.id}
          hasMatchingAccount={hasMatchingAccount}
          platform={campaign.platform}
          joined={!!participation}
          submission={submission}
          companyCurrency={companyCur}
          displayCurrency={cur}
        />
      </div>
    </CreatorNav>
  );
}

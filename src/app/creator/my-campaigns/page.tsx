import Link from "next/link";
import { requireRole } from "@/lib/session";
import { getCreatorByUserId, listParticipationsByCreator, getCampaignById, getCompanyById, getSubmissionByParticipation } from "@/lib/data";
import { formatConverted } from "@/lib/money";
import { submissionStatusTone, campaignStatusTone, formatNumber } from "@/lib/format";
import { PLATFORM_LABEL } from "@/lib/types";
import PlatformIcon from "@/components/PlatformIcon";
import CreatorNav from "@/components/CreatorNav";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

export default async function MyCampaignsPage() {
  const session = await requireRole("CREATOR");
  const creator = (await getCreatorByUserId(session.user.id))!;
  const cur = creator.displayCurrency;
  const participations = await listParticipationsByCreator(creator.id);
  const rows = (
    await Promise.all(
      participations.map(async (p) => {
        const campaign = await getCampaignById(p.campaignId);
        if (!campaign) return null;
        const companyCur = (await getCompanyById(campaign.companyId))?.currency ?? "USD";
        const submission = await getSubmissionByParticipation(p.id);
        return { p, campaign, companyCur, submission };
      })
    )
  ).filter((r): r is NonNullable<typeof r> => r !== null);

  return (
    <CreatorNav title="My campaigns">
      <div className="page-pad">
        {participations.length === 0 ? (
          <EmptyState
            title="You haven't joined any campaigns yet"
            subtitle="Browse open campaigns and join one to get started."
            action={<LinkButton href="/creator/browse" small>Browse campaigns</LinkButton>}
          />
        ) : (
          <Card style={{ overflow: "hidden" }}>
            <div className="table-grid table-head" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr" }}>
              <div>Campaign</div>
              <div>Platform</div>
              <div>Views</div>
              <div>CPM</div>
              <div>Earned</div>
              <div>Status</div>
            </div>
            {rows.map(({ p, campaign, companyCur, submission }) => {
              return (
                <Link
                  key={p.id}
                  href={`/creator/campaigns/${campaign.id}`}
                  className="table-grid table-row table-row-link"
                  style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr" }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{campaign.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{campaign.brand}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--text-dim)" }}>
                    <PlatformIcon platform={campaign.platform} size={16} />
                    {PLATFORM_LABEL[campaign.platform]}
                  </div>
                  <div style={{ fontSize: 13 }}>{submission?.viewsCount != null ? formatNumber(submission.viewsCount) : "—"}</div>
                  <div style={{ fontSize: 13 }}>{formatConverted(campaign.cpmCents, companyCur, cur)}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {submission?.creatorNetCents != null ? formatConverted(submission.creatorNetCents, companyCur, cur) : "—"}
                  </div>
                  <div>
                    {submission ? (
                      <Badge tone={submissionStatusTone(submission.status)}>{submission.status}</Badge>
                    ) : (
                      <Badge tone={campaignStatusTone(campaign.status)}>Submit content</Badge>
                    )}
                  </div>
                </Link>
              );
            })}
          </Card>
        )}
      </div>
    </CreatorNav>
  );
}

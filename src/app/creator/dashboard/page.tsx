import Link from "next/link";
import { requireRole } from "@/lib/session";
import {
  getCreatorByUserId,
  listSocialAccounts,
  listParticipationsByCreator,
  listSubmissionsByCreator,
  getCampaignById,
  getCompanyById,
  availableBalance,
  totalApprovedEarnings,
} from "@/lib/data";
import { formatCents, formatConverted } from "@/lib/money";
import { submissionStatusTone, formatNumber } from "@/lib/format";
import CreatorNav from "@/components/CreatorNav";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

export default async function CreatorDashboard() {
  const session = await requireRole("CREATOR");
  const creator = getCreatorByUserId(session.user.id)!;
  const cur = creator.displayCurrency;
  const accounts = listSocialAccounts(creator.id);
  const participations = listParticipationsByCreator(creator.id);
  const submissions = listSubmissionsByCreator(creator.id);

  const activeCampaigns = participations
    .map((p) => getCampaignById(p.campaignId))
    .filter((c) => c && c.status === "ACTIVE");
  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;
  const totalViews = submissions.reduce((sum, s) => sum + (s.viewsCount ?? 0), 0);

  return (
    <CreatorNav
      title="Dashboard"
      headerRight={
        accounts.length > 0 ? (
          <Badge tone="green">{accounts.length} account{accounts.length > 1 ? "s" : ""} connected</Badge>
        ) : (
          <Badge tone="amber">No account connected</Badge>
        )
      }
    >
      <div className="page-pad">
        {accounts.length === 0 && (
          <Card style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
              Connect the account you post from before joining campaigns — this is how AmplyGo will read your views.
            </div>
            <LinkButton href="/creator/settings" small>Connect account</LinkButton>
          </Card>
        )}

        <div className="fu" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16 }}>
          <Card style={{ padding: 18 }}>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>Available balance</div>
            <div className="tabular" style={{ fontSize: 22, fontWeight: 700 }}>{formatCents(availableBalance(creator.id, cur), cur)}</div>
          </Card>
          <Card style={{ padding: 18 }}>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>Total earned</div>
            <div className="tabular" style={{ fontSize: 22, fontWeight: 700 }}>{formatCents(totalApprovedEarnings(creator.id, cur), cur)}</div>
          </Card>
          <Card style={{ padding: 18 }}>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>Total views</div>
            <div className="tabular" style={{ fontSize: 22, fontWeight: 700 }}>{formatNumber(totalViews)}</div>
          </Card>
          <Card style={{ padding: 18 }}>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>Awaiting review</div>
            <div className="tabular" style={{ fontSize: 22, fontWeight: 700, color: pendingCount ? "var(--amber)" : "white" }}>
              {pendingCount}
            </div>
          </Card>
        </div>

        <Card style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--hairline)", fontSize: 14, fontWeight: 600 }}>
            Active campaigns
          </div>
          {activeCampaigns.length === 0 ? (
            <div style={{ padding: 20 }}>
              <EmptyState
                title="You're not in any active campaigns"
                subtitle="Browse open campaigns and join one to start earning."
                action={<LinkButton href="/creator/browse" small>Browse campaigns</LinkButton>}
              />
            </div>
          ) : (
            activeCampaigns.map((c) => {
              const submission = submissions.find((s) => s.campaignId === c!.id);
              return (
                <Link
                  key={c!.id}
                  href={`/creator/campaigns/${c!.id}`}
                  className="table-grid table-row table-row-link"
                  style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}
                >
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{c!.name}</div>
                  <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{c!.brand}</div>
                  <div style={{ fontSize: 13 }}>{formatConverted(c!.cpmCents, getCompanyById(c!.companyId)!.currency, cur)} CPM</div>
                  <div>
                    {submission ? (
                      <Badge tone={submissionStatusTone(submission.status)}>{submission.status}</Badge>
                    ) : (
                      <Badge tone="amber">Submit content</Badge>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </Card>
      </div>
    </CreatorNav>
  );
}

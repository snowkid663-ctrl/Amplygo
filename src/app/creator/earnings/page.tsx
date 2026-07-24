import { requireRole } from "@/lib/session";
import {
  getCreatorByUserId,
  listSubmissionsByCreator,
  availableBalance,
  totalApprovedEarnings,
  totalPayouts,
  listPayouts,
  getCampaignById,
  getCompanyById,
} from "@/lib/data";
import { formatCents, formatConverted } from "@/lib/money";
import { submissionStatusTone, payoutStatusTone, formatDate, formatNumber } from "@/lib/format";
import CreatorNav from "@/components/CreatorNav";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import RequestPayoutForm from "@/components/RequestPayoutForm";

export default async function EarningsPage() {
  const session = await requireRole("CREATOR");
  const creator = (await getCreatorByUserId(session.user.id))!;
  const cur = creator.displayCurrency;
  const [submissionsRaw, payouts, available, earnedTotal, paidTotal] = await Promise.all([
    listSubmissionsByCreator(creator.id),
    listPayouts(creator.id),
    availableBalance(creator.id, cur),
    totalApprovedEarnings(creator.id, cur),
    totalPayouts(creator.id, cur),
  ]);
  // Attach each submission's paying-company currency for conversion.
  const submissions = await Promise.all(
    submissionsRaw.map(async (s) => {
      const campaign = await getCampaignById(s.campaignId);
      const companyCur = campaign ? (await getCompanyById(campaign.companyId))?.currency ?? "USD" : "USD";
      return { ...s, campaignName: campaign?.name ?? "—", companyCur };
    })
  );

  return (
    <CreatorNav title="Earnings">
      <div className="page-pad">
        <div className="fu" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
          <Card style={{ padding: 18 }}>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>Total earned</div>
            <div className="tabular" style={{ fontSize: 24, fontWeight: 700 }}>{formatCents(earnedTotal, cur)}</div>
          </Card>
          <Card style={{ padding: 18 }}>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>Paid out</div>
            <div className="tabular" style={{ fontSize: 24, fontWeight: 700 }}>{formatCents(paidTotal, cur)}</div>
          </Card>
          <Card style={{ padding: 18 }}>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>Available</div>
            <div className="tabular" style={{ fontSize: 24, fontWeight: 700, color: "var(--green)" }}>{formatCents(available, cur)}</div>
          </Card>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
          <Card style={{ overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--hairline)", fontSize: 14, fontWeight: 600 }}>
              Earnings history
            </div>
            <div className="table-grid table-head" style={{ gridTemplateColumns: "1fr 1.4fr 1fr 1fr 1fr" }}>
              <div>Date</div>
              <div>Campaign</div>
              <div>Views</div>
              <div>Earned</div>
              <div>Status</div>
            </div>
            {submissions.length === 0 && <div style={{ padding: 20, fontSize: 13, color: "var(--text-dim)" }}>No submissions yet.</div>}
            {submissions.map((s) => {
              const companyCur = s.companyCur;
              return (
                <div key={s.id} className="table-grid table-row" style={{ gridTemplateColumns: "1fr 1.4fr 1fr 1fr 1fr" }}>
                  <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{formatDate(s.createdAt)}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.campaignName}</div>
                  <div style={{ fontSize: 13 }}>{s.viewsCount != null ? formatNumber(s.viewsCount) : "—"}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.creatorNetCents != null ? formatConverted(s.creatorNetCents, companyCur, cur) : "—"}</div>
                  <div><Badge tone={submissionStatusTone(s.status)} small>{s.status}</Badge></div>
                </div>
              );
            })}
          </Card>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card style={{ padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Withdraw</div>
              <RequestPayoutForm availableCents={available} currency={cur} />
            </Card>
            <Card style={{ overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--hairline)", fontSize: 13, fontWeight: 600 }}>
                Payout history
              </div>
              {payouts.length === 0 && <div style={{ padding: 20, fontSize: 13, color: "var(--text-dim)" }}>No payouts requested yet.</div>}
              {payouts.map((p) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid var(--hairline)" }}>
                  <div style={{ fontSize: 13 }}>{formatDate(p.createdAt)}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{formatConverted(p.amountCents, p.currency ?? "USD", cur)}</div>
                  <Badge tone={payoutStatusTone(p.status)} small>{p.status}</Badge>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </CreatorNav>
  );
}

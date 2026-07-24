import Link from "next/link";
import { requireRole } from "@/lib/session";
import { getCompanyByUserId, listCampaignsByCompany, listSubmissionsByCampaign } from "@/lib/data";
import { formatCents } from "@/lib/money";
import { campaignStatusTone, companyStatusTone } from "@/lib/format";
import CompanyNav from "@/components/CompanyNav";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

export default async function CompanyDashboard() {
  const session = await requireRole("COMPANY");
  const company = getCompanyByUserId(session.user.id)!;
  const campaigns = listCampaignsByCompany(company.id);

  const active = campaigns.filter((c) => c.status === "ACTIVE");
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budgetCents, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spentCents, 0);
  const pendingSubmissions = campaigns.reduce(
    (sum, c) => sum + listSubmissionsByCampaign(c.id).filter((s) => s.status === "PENDING").length,
    0
  );

  return (
    <CompanyNav
      title="Dashboard"
      headerRight={
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Badge tone="green">Balance: {formatCents(company.balanceCents, company.currency)}</Badge>
          <div className="avatar-badge">{company.companyName.slice(0, 1).toUpperCase()}</div>
        </div>
      }
    >
      <div className="page-pad">
        {company.status !== "APPROVED" && (
          <Card style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <Badge tone={companyStatusTone(company.status)}>{company.status}</Badge>
            <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
              {company.status === "PENDING" &&
                "Your company is awaiting admin approval. You can prepare campaigns as drafts, but publishing requires approval."}
              {company.status === "SUSPENDED" && "Your company has been suspended. Contact AmplyGo support."}
              {company.status === "REJECTED" && "Your company application was rejected. Contact AmplyGo support."}
            </div>
          </Card>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
          <LinkButton href="/company/settings" variant="secondary">
            Add balance
          </LinkButton>
          <LinkButton href="/company/campaigns/new">Create campaign</LinkButton>
        </div>

        <div className="fu" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16 }}>
          <Card style={{ padding: 18 }}>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>Active campaigns</div>
            <div className="tabular" style={{ fontSize: 22, fontWeight: 700 }}>{active.length}</div>
          </Card>
          <Card style={{ padding: 18 }}>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>Budget committed</div>
            <div className="tabular" style={{ fontSize: 22, fontWeight: 700 }}>{formatCents(totalBudget, company.currency)}</div>
          </Card>
          <Card style={{ padding: 18 }}>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>Spent (approved views)</div>
            <div className="tabular" style={{ fontSize: 22, fontWeight: 700 }}>{formatCents(totalSpent, company.currency)}</div>
          </Card>
          <Card style={{ padding: 18 }}>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>Submissions awaiting review</div>
            <div className="tabular" style={{ fontSize: 22, fontWeight: 700, color: pendingSubmissions ? "var(--amber)" : "white" }}>
              {pendingSubmissions}
            </div>
          </Card>
        </div>

        <Card style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--hairline)", fontSize: 14, fontWeight: 600 }}>
            Your campaigns
          </div>
          {campaigns.length === 0 ? (
            <div style={{ padding: 20 }}>
              <EmptyState
                title="No campaigns yet"
                subtitle="Create your first campaign to start finding creators."
                action={<LinkButton href="/company/campaigns/new" small>Create campaign</LinkButton>}
              />
            </div>
          ) : (
            <>
              <div className="table-grid table-head" style={{ gridTemplateColumns: "2fr 1fr 1fr 1.4fr 1fr" }}>
                <div>Campaign</div>
                <div>Status</div>
                <div>CPM</div>
                <div>Budget used</div>
                <div>Ends</div>
              </div>
              {campaigns.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  href={`/company/campaigns/${c.id}`}
                  className="table-grid table-row table-row-link"
                  style={{ gridTemplateColumns: "2fr 1fr 1fr 1.4fr 1fr" }}
                >
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{c.name}</div>
                  <div><Badge tone={campaignStatusTone(c.status)}>{c.status}</Badge></div>
                  <div style={{ fontSize: 14 }}>{formatCents(c.cpmCents, company.currency)}</div>
                  <div>
                    <div className="progress-track" style={{ marginBottom: 4 }}>
                      <div className="progress-fill" style={{ width: `${Math.min(100, (c.spentCents / c.budgetCents) * 100)}%` }} />
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                      {formatCents(c.spentCents, company.currency)} / {formatCents(c.budgetCents, company.currency)}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{c.endDate ? new Date(c.endDate).toLocaleDateString() : "—"}</div>
                </Link>
              ))}
            </>
          )}
        </Card>
      </div>
    </CompanyNav>
  );
}

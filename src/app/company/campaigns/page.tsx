import Link from "next/link";
import { requireRole } from "@/lib/session";
import { getCompanyByUserId, listCampaignsByCompany } from "@/lib/data";
import { formatCents } from "@/lib/money";
import { campaignStatusTone, formatDate } from "@/lib/format";
import CompanyNav from "@/components/CompanyNav";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import PillFilterLinks from "@/components/ui/PillFilterLinks";
import type { CampaignStatus } from "@/lib/types";

export default async function CompanyCampaignsPage({ searchParams }: { searchParams: { status?: string } }) {
  const session = await requireRole("COMPANY");
  const company = getCompanyByUserId(session.user.id)!;
  const all = listCampaignsByCompany(company.id);
  const filter = (searchParams.status ?? "all") as CampaignStatus | "all";
  const campaigns = filter === "all" ? all : all.filter((c) => c.status === filter);

  return (
    <CompanyNav
      title="Campaigns"
      headerRight={
        <LinkButton href="/company/campaigns/new" small>
          Create campaign
        </LinkButton>
      }
    >
      <div className="page-pad">
        <PillFilterLinks
          basePath="/company/campaigns"
          paramName="status"
          current={filter}
          options={[
            { value: "all", label: "All" },
            { value: "ACTIVE", label: "Active" },
            { value: "PAUSED", label: "Paused" },
            { value: "DRAFT", label: "Draft" },
            { value: "ENDED", label: "Ended" },
          ]}
        />

        <Card style={{ overflow: "hidden" }}>
          {campaigns.length === 0 ? (
            <div style={{ padding: 20 }}>
              <EmptyState title="No campaigns in this view" />
            </div>
          ) : (
            <>
              <div className="table-grid table-head" style={{ gridTemplateColumns: "2.2fr 1fr 1fr 1.4fr 1fr 1fr" }}>
                <div>Campaign</div>
                <div>Status</div>
                <div>CPM</div>
                <div>Budget used</div>
                <div>Creators</div>
                <div>Ends</div>
              </div>
              {campaigns.map((c) => (
                <Link
                  key={c.id}
                  href={`/company/campaigns/${c.id}`}
                  className="table-grid table-row table-row-link"
                  style={{ gridTemplateColumns: "2.2fr 1fr 1fr 1.4fr 1fr 1fr" }}
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
                  <div style={{ fontSize: 14 }}>{c.maxCreators ?? "No limit"}</div>
                  <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{formatDate(c.endDate)}</div>
                </Link>
              ))}
            </>
          )}
        </Card>
      </div>
    </CompanyNav>
  );
}

import { requireRole } from "@/lib/session";
import { listCampaigns, getCompanyById } from "@/lib/data";
import { formatCents } from "@/lib/money";
import { campaignStatusTone, formatDate } from "@/lib/format";
import { PLATFORM_LABEL, type CampaignStatus } from "@/lib/types";
import AdminNav from "@/components/AdminNav";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import PillFilterLinks from "@/components/ui/PillFilterLinks";
import EmptyState from "@/components/ui/EmptyState";
import PlatformIcon from "@/components/PlatformIcon";
import TableSearch from "@/components/TableSearch";
import CampaignReviewActions from "@/components/CampaignReviewActions";

export default async function AdminCampaignsPage({ searchParams }: { searchParams: { status?: string } }) {
  await requireRole("ADMIN");
  const filter = (searchParams.status ?? "PENDING") as CampaignStatus | "all";
  const all = await listCampaigns(filter === "all" ? undefined : filter);
  const rows = await Promise.all(
    all.map(async (c) => ({ ...c, companyName: (await getCompanyById(c.companyId))?.companyName ?? "—" }))
  );

  return (
    <AdminNav title="Campaigns">
      <div className="page-pad">
        <TableSearch
          placeholder="Search campaigns"
          right={
            <PillFilterLinks
              basePath="/admin/campaigns"
              paramName="status"
              current={filter}
              options={[
                { value: "PENDING", label: "Pending" },
                { value: "ACTIVE", label: "Active" },
                { value: "DRAFT", label: "Draft" },
                { value: "ENDED", label: "Ended" },
                { value: "all", label: "All" },
              ]}
            />
          }
        >
          <Card style={{ overflow: "hidden" }}>
            {rows.length === 0 ? (
              <div style={{ padding: 20 }}>
                <EmptyState title="Nothing here" subtitle="No campaigns in this view." />
              </div>
            ) : (
              <>
                <div className="table-grid table-head" style={{ gridTemplateColumns: "1.8fr 1.2fr 1fr 1fr 1.2fr" }}>
                  <div>Campaign</div>
                  <div>Company</div>
                  <div>CPM / Budget</div>
                  <div>Status</div>
                  <div />
                </div>
                {rows.map((c) => (
                  <div
                    key={c.id}
                    data-search={`${c.name} ${c.brand} ${c.companyName}`}
                    className="table-grid table-row"
                    style={{ gridTemplateColumns: "1.8fr 1.2fr 1fr 1fr 1.2fr", alignItems: "center" }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}>
                        <PlatformIcon platform={c.platform} size={15} />
                        {c.name}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-dimmer)" }}>
                        {c.brand} · {PLATFORM_LABEL[c.platform]} · {formatDate(c.createdAt)}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{c.companyName}</div>
                    <div style={{ fontSize: 13 }}>
                      {formatCents(c.cpmCents)} · {formatCents(c.budgetCents)}
                    </div>
                    <div>
                      <Badge tone={campaignStatusTone(c.status)}>{c.status}</Badge>
                    </div>
                    <div style={{ justifySelf: "end" }}>
                      {c.status === "PENDING" && <CampaignReviewActions campaignId={c.id} />}
                    </div>
                  </div>
                ))}
              </>
            )}
          </Card>
        </TableSearch>
        <div style={{ fontSize: 12.5, color: "var(--text-dim)" }}>
          Companies join instantly; a campaign only goes live to creators after you approve it here.
        </div>
      </div>
    </AdminNav>
  );
}

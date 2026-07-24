import { requireRole } from "@/lib/session";
import { listSubmissions, getCreatorById, getCampaignById, getCompanyById } from "@/lib/data";
import { submissionStatusTone, formatDate } from "@/lib/format";
import { formatCents } from "@/lib/money";
import AdminNav from "@/components/AdminNav";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import PillFilterLinks from "@/components/ui/PillFilterLinks";
import EmptyState from "@/components/ui/EmptyState";
import SubmissionReviewActions from "@/components/SubmissionReviewActions";
import TableSearch from "@/components/TableSearch";
import type { SubmissionStatus } from "@/lib/types";

export default async function AdminSubmissionsPage({ searchParams }: { searchParams: { status?: string } }) {
  await requireRole("ADMIN");
  const filter = (searchParams.status ?? "PENDING") as SubmissionStatus | "all";
  const all = await listSubmissions();
  const filtered = filter === "all" ? all : all.filter((s) => s.status === filter);
  const submissions = await Promise.all(
    filtered.map(async (s) => {
      const creator = await getCreatorById(s.creatorId);
      const campaign = await getCampaignById(s.campaignId);
      const companyCur = campaign ? (await getCompanyById(campaign.companyId))?.currency ?? "USD" : "USD";
      return { ...s, creatorName: creator?.displayName ?? "Unknown", campaignName: campaign?.name ?? "—", companyCur };
    })
  );

  return (
    <AdminNav title="Submissions">
      <div className="page-pad">
        <TableSearch
          placeholder="Search by creator or campaign"
          right={
            <PillFilterLinks
              basePath="/admin/submissions"
              paramName="status"
              current={filter}
              options={[
                { value: "all", label: "All" },
                { value: "PENDING", label: "Pending" },
                { value: "FLAGGED", label: "Flagged" },
                { value: "APPROVED", label: "Approved" },
                { value: "REJECTED", label: "Rejected" },
              ]}
            />
          }
        >
        <Card style={{ overflow: "hidden" }}>
          {submissions.length === 0 ? (
            <div style={{ padding: 20 }}>
              <EmptyState title="No submissions in this view" />
            </div>
          ) : (
            <>
              <div className="table-grid table-head" style={{ gridTemplateColumns: "1.4fr 1.4fr 1fr 1fr 1.4fr" }}>
                <div>Creator</div>
                <div>Campaign</div>
                <div>Published</div>
                <div>Status</div>
                <div />
              </div>
              {submissions.map((s) => {
                const companyCur = s.companyCur;
                return (
                  <div key={s.id} data-search={`${s.creatorName} ${s.campaignName}`} className="table-grid table-row" style={{ gridTemplateColumns: "1.4fr 1.4fr 1fr 1fr 1.4fr" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{s.creatorName}</div>
                      <a href={s.videoUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11 }}>
                        view link ↗
                      </a>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{s.campaignName}</div>
                    <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{formatDate(s.publishedAt)}</div>
                    <div>
                      <Badge tone={submissionStatusTone(s.status)}>{s.status}</Badge>
                      {s.status === "APPROVED" && s.creatorNetCents != null && (
                        <div style={{ fontSize: 11, color: "var(--text-dimmer)", marginTop: 4 }}>{formatCents(s.creatorNetCents, companyCur)} to creator</div>
                      )}
                    </div>
                    <div>
                      {(s.status === "PENDING" || s.status === "FLAGGED") && <SubmissionReviewActions submissionId={s.id} />}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </Card>
        </TableSearch>
      </div>
    </AdminNav>
  );
}

import { requireRole } from "@/lib/session";
import { listCompanies } from "@/lib/data";
import { companyStatusTone, formatDate } from "@/lib/format";
import { formatCents } from "@/lib/money";
import AdminNav from "@/components/AdminNav";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import PillFilterLinks from "@/components/ui/PillFilterLinks";
import EmptyState from "@/components/ui/EmptyState";
import CompanyActions from "@/components/CompanyActions";
import type { CompanyStatus } from "@/lib/types";

export default async function AdminCompaniesPage({ searchParams }: { searchParams: { status?: string } }) {
  await requireRole("ADMIN");
  const filter = (searchParams.status ?? "PENDING") as CompanyStatus | "all";
  const all = listCompanies();
  const companies = filter === "all" ? all : all.filter((c) => c.status === filter);

  return (
    <AdminNav title="Companies">
      <div className="page-pad">
        <PillFilterLinks
          basePath="/admin/companies"
          paramName="status"
          current={filter}
          options={[
            { value: "all", label: "All" },
            { value: "PENDING", label: "Pending" },
            { value: "APPROVED", label: "Approved" },
            { value: "SUSPENDED", label: "Suspended" },
            { value: "REJECTED", label: "Rejected" },
          ]}
        />

        <Card style={{ overflow: "hidden" }}>
          {companies.length === 0 ? (
            <div style={{ padding: 20 }}>
              <EmptyState title="No companies in this view" />
            </div>
          ) : (
            <>
              <div className="table-grid table-head" style={{ gridTemplateColumns: "2fr 1.4fr 1fr 1fr" }}>
                <div>Company</div>
                <div>Registered</div>
                <div>Status</div>
                <div />
              </div>
              {companies.map((c) => (
                <div key={c.id} className="table-grid table-row" style={{ gridTemplateColumns: "2fr 1.4fr 1fr 1fr" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{c.companyName}</div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)" }}>Balance: {formatCents(c.balanceCents, c.currency)}</div>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{formatDate(c.createdAt)}</div>
                  <div><Badge tone={companyStatusTone(c.status)}>{c.status}</Badge></div>
                  <CompanyActions companyId={c.id} status={c.status} />
                </div>
              ))}
            </>
          )}
        </Card>
      </div>
    </AdminNav>
  );
}

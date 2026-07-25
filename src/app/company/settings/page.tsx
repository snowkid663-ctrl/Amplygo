import { requireRole } from "@/lib/session";
import { getCompanyByUserId, listBalanceTransactions } from "@/lib/data";
import { formatCents } from "@/lib/money";
import { companyStatusTone, formatDate } from "@/lib/format";
import CompanyNav from "@/components/CompanyNav";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import AddBalanceForm from "@/components/AddBalanceForm";
import CompanyProfileForm from "@/components/CompanyProfileForm";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import ProfileMediaEditor from "@/components/ProfileMediaEditor";

export default async function CompanySettingsPage() {
  const session = await requireRole("COMPANY");
  const company = (await getCompanyByUserId(session.user.id))!;
  const transactions = await listBalanceTransactions(company.id);

  return (
    <CompanyNav title="Settings">
      <div className="page-narrow">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="section-label">Company profile</div>
            <Badge tone={companyStatusTone(company.status)}>{company.status}</Badge>
          </div>
          <Card className="lift" style={{ padding: "20px" }}>
            <ProfileMediaEditor
              name={company.companyName}
              avatarUrl={company.logoUrl}
              bannerUrl={company.bannerUrl}
              bannerPos={company.bannerPos}
              avatarShape="rounded"
            />
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 16 }}>
              Signed in as {session.user.email}
            </div>
            <CompanyProfileForm
              companyName={company.companyName}
              website={company.website}
              about={company.about}
              currency={company.currency}
            />
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="section-label">Password</div>
          <Card className="lift" style={{ padding: "20px" }}>
            <ChangePasswordForm />
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="section-label">Balance</div>
          <Card style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 4 }}>Current balance</div>
              <div className="tabular" style={{ fontSize: 26, fontWeight: 700 }}>{formatCents(company.balanceCents, company.currency)}</div>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
              Deposits are simulated in this MVP — no real payment processor is connected yet.
            </div>
            <AddBalanceForm currency={company.currency} />
          </Card>

          <Card style={{ overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--hairline)", fontSize: 13, fontWeight: 600 }}>
              Balance history
            </div>
            {transactions.length === 0 ? (
              <div style={{ padding: 20, fontSize: 13, color: "var(--text-dim)" }}>No transactions yet.</div>
            ) : (
              (transactions as any[]).map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 20px",
                    borderTop: "1px solid var(--hairline)",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13 }}>{t.reason}</div>
                    <div style={{ fontSize: 11, color: "var(--text-dimmer)" }}>{formatDate(t.createdAt)}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.amountCents < 0 ? "var(--red)" : "var(--green)" }}>
                    {t.amountCents < 0 ? "−" : "+"}
                    {formatCents(Math.abs(t.amountCents), company.currency)}
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </CompanyNav>
  );
}

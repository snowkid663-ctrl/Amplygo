import Link from "next/link";
import { requireRole } from "@/lib/session";
import { listCompanies, listSubmissions, platformStats, getCreatorById } from "@/lib/data";
import { formatCents } from "@/lib/money";
import { formatDate } from "@/lib/format";
import AdminNav from "@/components/AdminNav";
import CountUp from "@/components/CountUp";
import Sparkline from "@/components/Sparkline";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default async function AdminDashboard() {
  await requireRole("ADMIN");
  const stats = await platformStats();
  const pendingCompanies = await listCompanies("PENDING");
  const [pend, flag] = await Promise.all([listSubmissions("PENDING"), listSubmissions("FLAGGED")]);
  const pendingSubmissions = await Promise.all(
    [...pend, ...flag].slice(0, 6).map(async (s) => ({
      ...s,
      creatorName: (await getCreatorById(s.creatorId))?.displayName ?? "Unknown",
    }))
  );

  return (
    <AdminNav title="Dashboard">
      <div style={{ maxWidth: 920, padding: 28, display: "flex", flexDirection: "column", gap: 28 }}>
        <div className="resp-2" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16 }}>
          <Card className="lift spot-card fu fu-1" style={{ padding: 18 }}>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>Awaiting review</div>
            <div className="tabular" style={{ fontSize: 26, fontWeight: 700, color: "var(--amber)" }}>
              <CountUp to={stats.pendingCompanies + stats.pendingSubmissions} />
            </div>
            <div style={{ marginTop: 10 }}><Sparkline seed="ad-review" up={false} /></div>
          </Card>
          <Card className="lift spot-card fu fu-2" style={{ padding: 18 }}>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>Companies</div>
            <div className="tabular" style={{ fontSize: 26, fontWeight: 700 }}><CountUp to={stats.companiesCount} /></div>
            <div style={{ marginTop: 10 }}><Sparkline seed="ad-companies" /></div>
          </Card>
          <Card className="lift spot-card fu fu-3" style={{ padding: 18 }}>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>Total GMV (USD)</div>
            <div className="tabular" style={{ fontSize: 26, fontWeight: 700 }}><CountUp to={stats.gmvCents} currency="USD" /></div>
            <div style={{ marginTop: 10 }}><Sparkline seed="ad-gmv" /></div>
          </Card>
          <Card className="lift spot-card fu fu-4" style={{ padding: 18 }}>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>Platform revenue (10%, USD)</div>
            <div className="tabular" style={{ fontSize: 26, fontWeight: 700 }}><CountUp to={stats.platformFeeCents} currency="USD" /></div>
            <div style={{ marginTop: 10 }}><Sparkline seed="ad-rev" /></div>
          </Card>
        </div>

        <div className="fu" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Needs your review</div>
          <Card style={{ overflow: "hidden" }}>
            {pendingCompanies.length === 0 && pendingSubmissions.length === 0 && (
              <div style={{ padding: 20, fontSize: 13, color: "var(--text-dim)" }}>Nothing waiting on you right now.</div>
            )}
            {pendingCompanies.map((c) => (
              <div key={c.id} style={{ display: "grid", gridTemplateColumns: "110px 1.6fr 1.6fr 1fr", alignItems: "center", padding: "16px 20px", borderTop: "1px solid var(--hairline)" }}>
                <Badge tone="amber">New company</Badge>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.companyName}</div>
                  <div style={{ fontSize: 12, color: "var(--text-dimmer)" }}>registered {formatDate(c.createdAt)}</div>
                </div>
                <div />
                <Link href="/admin/companies" style={{ justifySelf: "end", fontSize: 13, fontWeight: 600, color: "var(--accent-text)" }}>
                  Review →
                </Link>
              </div>
            ))}
            {pendingSubmissions.map((s) => {
              return (
                <div key={s.id} style={{ display: "grid", gridTemplateColumns: "110px 1.6fr 1.6fr 1fr", alignItems: "center", padding: "16px 20px", borderTop: "1px solid var(--hairline)" }}>
                  <Badge tone={s.status === "FLAGGED" ? "red" : "amber"}>{s.status === "FLAGGED" ? "Flagged" : "Submission"}</Badge>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{s.creatorName}</div>
                    <div style={{ fontSize: 12, color: "var(--text-dimmer)" }}>{formatDate(s.createdAt)}</div>
                  </div>
                  <div />
                  <Link href="/admin/submissions" style={{ justifySelf: "end", fontSize: 13, fontWeight: 600, color: "var(--accent-text)" }}>
                    Review →
                  </Link>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </AdminNav>
  );
}

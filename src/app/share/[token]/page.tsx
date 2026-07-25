import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getCampaignByShareToken,
  getCompanyById,
  listSubmissionsByCampaign,
  getCreatorById,
} from "@/lib/data";
import { formatCents } from "@/lib/money";
import { formatNumber } from "@/lib/format";
import { campaignMetrics } from "@/lib/demoMetrics";
import BrandLogo from "@/components/BrandLogo";
import NetworkBackground from "@/components/NetworkBackground";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { token: string } }): Promise<Metadata> {
  const campaign = await getCampaignByShareToken(params.token);
  const company = campaign ? await getCompanyById(campaign.companyId) : null;
  if (!campaign || !company) return { title: "Campaign results — AmplyGo" };
  return {
    title: `${company.companyName} — campaign results on AmplyGo`,
    description: `See how ${company.companyName}'s creator campaign performed on AmplyGo.`,
  };
}

async function names(submissions: { creatorId: string }[]) {
  const ids = Array.from(new Set(submissions.map((s) => s.creatorId)));
  const entries = await Promise.all(ids.map(async (id) => [id, (await getCreatorById(id))?.displayName ?? "Creator"] as const));
  return new Map(entries);
}

export default async function SharePage({ params }: { params: { token: string } }) {
  const campaign = await getCampaignByShareToken(params.token);
  if (!campaign) notFound();
  const company = await getCompanyById(campaign.companyId);
  if (!company) notFound();

  const submissions = await listSubmissionsByCampaign(campaign.id);
  const nameMap = await names(submissions);
  const m = campaignMetrics(campaign, submissions, (id) => nameMap.get(id) ?? "Creator", company.currency);
  const money = (c: number) => formatCents(c, company.currency);
  const top = m.leaderboard.filter((c) => c.trend !== "pending").slice(0, 3);
  const medals = ["🥇", "🥈", "🥉"];

  const stat = (label: string, value: string) => (
    <div className="glass glass-hi" style={{ padding: "18px 20px", borderRadius: 14 }}>
      <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>{label}</div>
      <div className="tabular" style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>{value}</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NetworkBackground />
      <div style={{ padding: "20px 32px" }}>
        <Link href="/" style={{ display: "inline-block" }}>
          <BrandLogo height={28} />
        </Link>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 24px 56px" }}>
        <div style={{ width: "100%", maxWidth: 780, display: "flex", flexDirection: "column", gap: 20, position: "relative", zIndex: 1 }}>
          {/* Hero */}
          <div className="fu" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "var(--text-dim)", fontWeight: 600 }}>{company.companyName} · Campaign results</div>
            <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", margin: "4px 0 18px" }}>{campaign.name}</h1>
            <div className="gradient-text-pink" style={{ fontSize: 68, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
              {formatNumber(m.totalViews)}
            </div>
            <div style={{ fontSize: 15, color: "var(--text-dim)", marginTop: 6 }}>organic views generated</div>
          </div>

          {/* Stat cards */}
          <div className="fu fu-1 resp-2" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {stat("Revenue", money(m.revenueCents))}
            {stat("ROAS", `${m.roi.toFixed(1)}x`)}
            {stat("Sales", formatNumber(m.sales))}
            {stat("Videos", formatNumber(submissions.length))}
          </div>

          {/* Top creators */}
          {top.length > 0 && (
            <div className="fu fu-2 glass glass-hi" style={{ padding: "18px 20px", borderRadius: 16 }}>
              <div className="section-label" style={{ marginBottom: 12 }}>Top creators</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {top.map((c, i) => (
                  <div key={c.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>
                      {medals[i]} {c.name}
                    </div>
                    <div className="tabular" style={{ fontSize: 15, fontWeight: 700 }}>{formatNumber(c.views)} views</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="fu fu-3 glass-strong glass-hi grad-border" style={{ padding: "32px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ fontSize: 20, fontWeight: 700, position: "relative" }}>Want results like this?</div>
            <div style={{ fontSize: 14, color: "var(--text-dim)", margin: "6px 0 16px", position: "relative" }}>
              Launch a performance campaign where creators compete to promote your product.
            </div>
            <Link href="/auth?mode=register&role=company" className="btn btn-primary glow-primary" style={{ borderRadius: 100, position: "relative" }}>
              Start free
            </Link>
          </div>

          <div style={{ textAlign: "center", fontSize: 12, color: "var(--text-dimmer)" }}>Powered by AmplyGo</div>
        </div>
      </div>
    </div>
  );
}

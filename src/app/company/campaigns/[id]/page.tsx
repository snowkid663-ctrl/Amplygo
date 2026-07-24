import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import {
  getCompanyByUserId,
  getCampaignById,
  listParticipationsByCampaign,
  listSubmissionsByCampaign,
  getCreatorById,
  countParticipants,
} from "@/lib/data";
import { formatCents, convertCents } from "@/lib/money";
import { campaignMetrics } from "@/lib/demoMetrics";
import { campaignStatusTone, submissionStatusTone, formatDate, formatNumber } from "@/lib/format";
import { PLATFORM_LABEL } from "@/lib/types";
import PlatformIcon from "@/components/PlatformIcon";
import CompanyNav from "@/components/CompanyNav";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import CampaignStatusActions from "@/components/CampaignStatusActions";
import EmptyState from "@/components/ui/EmptyState";
import MiniAreaChart from "@/components/MiniAreaChart";
import ConversionFunnel from "@/components/ConversionFunnel";
import CampaignTabs from "@/components/CampaignTabs";

const VIDEO_TITLES = ["Unboxing done right", "Why I switched", "3 tips nobody tells you", "The honest review", "POV: you found it"];

function Panel({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card style={{ overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--hairline)" }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
        {right}
      </div>
      {children}
    </Card>
  );
}

export default async function CompanyCampaignDetail({ params }: { params: { id: string } }) {
  const session = await requireRole("COMPANY");
  const company = getCompanyByUserId(session.user.id)!;
  const campaign = getCampaignById(params.id);
  if (!campaign || campaign.companyId !== company.id) notFound();

  const cur = company.currency;
  const participations = listParticipationsByCampaign(campaign.id);
  const submissions = listSubmissionsByCampaign(campaign.id);
  const submissionByParticipation = new Map(submissions.map((s) => [s.participationId, s]));
  const rulesChecklist: string[] = JSON.parse(campaign.rulesChecklist || "[]");
  const pct = campaign.budgetCents > 0 ? Math.min(100, (campaign.spentCents / campaign.budgetCents) * 100) : 0;

  const nameOf = (id: string) => getCreatorById(id)?.displayName ?? "Unknown creator";
  const m = campaignMetrics(campaign, submissions, nameOf, cur);
  const money = (c: number) => formatCents(c, cur);
  const aov = convertCents(4900, "USD", cur);

  // Top performing videos (real submissions by views, demo revenue).
  const topVideos = [...submissions]
    .filter((s) => (s.viewsCount ?? 0) > 0)
    .sort((a, b) => (b.viewsCount ?? 0) - (a.viewsCount ?? 0))
    .slice(0, 3)
    .map((s, i) => {
      const views = s.viewsCount ?? 0;
      const sales = Math.max(1, Math.round(views * m.ctr * m.cvr));
      return { title: VIDEO_TITLES[i % VIDEO_TITLES.length], name: nameOf(s.creatorId), views, sales, revenueCents: sales * aov, platform: s.platform };
    });

  // Timeline milestones (real dates where available + demo).
  const firstJoin = participations.length ? [...participations].sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))[0].joinedAt : null;
  const firstSub = submissions.length ? [...submissions].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0].createdAt : null;
  const spentPctReal = campaign.budgetCents > 0 ? (campaign.spentCents / campaign.budgetCents) * 100 : 0;
  const milestones = [
    { label: "Campaign created", date: formatDate(campaign.createdAt), done: true },
    { label: "Creators joined", date: firstJoin ? formatDate(firstJoin) : "—", done: !!firstJoin },
    { label: "First video", date: firstSub ? formatDate(firstSub) : "—", done: !!firstSub },
    { label: "First sale", date: m.sales > 0 ? "recently" : "—", done: m.sales > 0 },
    { label: "50 sales", date: m.sales >= 50 ? "reached" : "~soon", done: m.sales >= 50 },
    { label: "Budget 50%", date: spentPctReal >= 50 ? "reached" : "~soon", done: spentPctReal >= 50 },
    { label: "100 sales", date: m.sales >= 100 ? "reached" : "~soon", done: m.sales >= 100 },
    { label: "Budget 100%", date: spentPctReal >= 100 ? "reached" : "~soon", done: spentPctReal >= 100 },
  ];

  const kpi = (label: string, value: string, delta: number, sub?: string) => (
    <div>
      <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>{label}</div>
      <div className="tabular" style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.01em" }}>{value}</div>
      <div style={{ fontSize: 12, marginTop: 4 }} className={delta >= 0 ? "kpi-up" : "kpi-down"}>
        {sub ?? `▲ ${delta}% vs yesterday`}
      </div>
    </div>
  );

  // ---- Tab contents ----
  const submissionsTab = (
    <Card style={{ overflow: "hidden" }}>
      <div className="table-grid table-head" style={{ gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr" }}>
        <div>Creator</div>
        <div>Published</div>
        <div>Views</div>
        <div>Earned</div>
        <div>Status</div>
      </div>
      {submissions.length === 0 ? (
        <div style={{ padding: 20 }}>
          <EmptyState title="No submissions yet" />
        </div>
      ) : (
        submissions.map((s) => (
          <div key={s.id} className="table-grid table-row" style={{ gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr" }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{nameOf(s.creatorId)}</div>
            <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{formatDate(s.publishedAt)}</div>
            <div style={{ fontSize: 14 }}>{s.viewsCount != null ? formatNumber(s.viewsCount) : "—"}</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{s.creatorNetCents != null ? money(s.creatorNetCents) : "—"}</div>
            <div><Badge tone={submissionStatusTone(s.status)} small>{s.status}</Badge></div>
          </div>
        ))
      )}
    </Card>
  );

  const participantsTab = (
    <Card style={{ overflow: "hidden" }}>
      {participations.length === 0 ? (
        <div style={{ padding: 20 }}>
          <EmptyState title="No creators have joined yet" />
        </div>
      ) : (
        <>
          <div className="table-grid table-head" style={{ gridTemplateColumns: "1.6fr 1fr 1fr 1fr" }}>
            <div>Creator</div>
            <div>Joined</div>
            <div>Views</div>
            <div>Status</div>
          </div>
          {participations.map((p) => {
            const sub = submissionByParticipation.get(p.id);
            return (
              <div key={p.id} className="table-grid table-row" style={{ gridTemplateColumns: "1.6fr 1fr 1fr 1fr" }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{nameOf(p.creatorId)}</div>
                <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{formatDate(p.joinedAt)}</div>
                <div style={{ fontSize: 14 }}>{sub?.viewsCount != null ? formatNumber(sub.viewsCount) : "—"}</div>
                <div>{sub ? <Badge tone={submissionStatusTone(sub.status)} small>{sub.status}</Badge> : <Badge tone="neutral" small>No submission</Badge>}</div>
              </div>
            );
          })}
        </>
      )}
    </Card>
  );

  const rulesTab = (
    <Card style={{ padding: 20, display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "oklch(82% 0.005 264)" }}>
      {rulesChecklist.length === 0 && <div style={{ color: "var(--text-dim)" }}>No checklist rules set.</div>}
      {rulesChecklist.map((r) => (
        <div key={r}>✓ {r}</div>
      ))}
      {campaign.rulesExtra && <div style={{ marginTop: 8, color: "var(--text-dim)" }}>{campaign.rulesExtra}</div>}
    </Card>
  );

  return (
    <CompanyNav
      title={campaign.name}
      headerRight={<CampaignStatusActions campaignId={campaign.id} status={campaign.status} />}
    >
      <div className="page-pad">
        {/* Hero KPIs */}
        <Card hero style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <Badge tone={campaignStatusTone(campaign.status)}>{campaign.status}</Badge>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-dim)" }}>
              <PlatformIcon platform={campaign.platform} size={15} />
              {PLATFORM_LABEL[campaign.platform]} · {campaign.language} · {campaign.country} ·{" "}
              {campaign.endDate ? `Ends ${formatDate(campaign.endDate)}` : "No end date"}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 20 }}>
            {kpi("Revenue", money(m.revenueCents), m.deltas.revenue)}
            <div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>Profit</div>
              <div className="tabular kpi-up" style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.01em" }}>+{money(m.profitCents)}</div>
              <div className="kpi-up" style={{ fontSize: 12, marginTop: 4 }}>▲ {m.deltas.profit}% vs last week</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>ROI</div>
              <div className="tabular" style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.01em" }}>{m.roi.toFixed(1)}x</div>
              <div style={{ fontSize: 12, marginTop: 4, color: "var(--text-dim)" }}>Target: 2.5x</div>
            </div>
            {kpi("Sales", formatNumber(m.sales), m.deltas.sales)}
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>
              <span>Budget spent</span>
              <span>{money(campaign.spentCents)} / {money(campaign.budgetCents)} · {Math.round(pct)}%</span>
            </div>
            <div className="progress-track" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div style={{ fontSize: 12, color: "var(--text-dimmer)", marginTop: 8 }}>
              Forecast: at this pace the budget lasts a few more weeks — projected to add more revenue before then.
            </div>
          </div>
        </Card>

        {/* Chart + funnel */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
          <Panel title="Revenue over time" right={<Badge tone="neutral" small>30D</Badge>}>
            <div style={{ padding: "18px 8px 8px" }}>
              <MiniAreaChart data={m.series} height={220} />
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px 0", fontSize: 12, color: "var(--text-dimmer)" }}>
                <span>30 days ago</span>
                <span>Today</span>
              </div>
            </div>
          </Panel>
          <Panel title="Conversion funnel">
            <div style={{ padding: 20 }}>
              <ConversionFunnel stages={m.funnel} />
            </div>
          </Panel>
        </div>

        {/* Creator leaderboard */}
        <Panel title="Creator leaderboard">
          {m.leaderboard.length === 0 ? (
            <div style={{ padding: 20 }}>
              <EmptyState title="No creators yet" subtitle="Once creators join and submit, they'll rank here." />
            </div>
          ) : (
            <>
              <div className="table-grid table-head" style={{ gridTemplateColumns: "1.8fr .7fr 1fr 1fr .7fr 1.1fr .8fr 1.1fr .7fr" }}>
                <div>Creator</div>
                <div>Videos</div>
                <div>Views</div>
                <div>Clicks</div>
                <div>Sales</div>
                <div>Revenue</div>
                <div>ROAS</div>
                <div>Profit</div>
                <div>Trend</div>
              </div>
              {m.leaderboard.map((c) => (
                <div key={c.name} className="table-grid table-row" style={{ gridTemplateColumns: "1.8fr .7fr 1fr 1fr .7fr 1.1fr .8fr 1.1fr .7fr", alignItems: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 13 }}>{c.videos}</div>
                  <div style={{ fontSize: 13 }}>{c.views > 0 ? formatNumber(c.views) : "—"}</div>
                  <div style={{ fontSize: 13 }}>{c.trend === "pending" ? "—" : formatNumber(c.clicks)}</div>
                  <div style={{ fontSize: 13 }}>{c.trend === "pending" ? "—" : c.sales}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.trend === "pending" ? "—" : money(c.revenueCents)}</div>
                  <div style={{ fontSize: 13, color: "var(--green)" }}>{c.trend === "pending" ? "—" : `${c.roas.toFixed(1)}x`}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }} className={c.trend === "down" ? "kpi-down" : c.trend === "up" ? "kpi-up" : ""}>
                    {c.trend === "pending" ? "—" : `${c.profitCents >= 0 ? "+" : "−"}${money(Math.abs(c.profitCents))}`}
                  </div>
                  <div>
                    {c.trend === "pending" ? (
                      <Badge tone="amber" small>Pending</Badge>
                    ) : (
                      <span style={{ color: c.trend === "up" ? "var(--green)" : "var(--red)" }}>{c.trend === "up" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </Panel>

        {/* Top videos + latest sales */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
          <Panel title="Top performing videos">
            {topVideos.length === 0 ? (
              <div style={{ padding: 20 }}>
                <EmptyState title="No videos with views yet" />
              </div>
            ) : (
              topVideos.map((v, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderTop: i === 0 ? "none" : "1px solid var(--hairline)" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "oklch(20% 0.01 264)" }}>
                    <PlatformIcon platform={v.platform} size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{v.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{v.name} · {formatNumber(v.views)} views</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{money(v.revenueCents)}</div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{v.sales} sales</div>
                  </div>
                </div>
              ))
            )}
          </Panel>
          <Panel title="Latest sales">
            {m.feed.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", borderTop: i === 0 ? "none" : "1px solid var(--hairline)" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{f.plan} · {f.minsAgo} min ago</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{money(f.amountCents)}</div>
                  <div style={{ fontSize: 11, color: "var(--green)" }}>{money(f.commissionCents)} commission</div>
                </div>
              </div>
            ))}
          </Panel>
        </div>

        {/* Timeline */}
        <Panel title="Campaign timeline">
          <div style={{ padding: "24px 20px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "28px 12px" }}>
            {milestones.map((ms) => (
              <div key={ms.label} style={{ textAlign: "center" }}>
                <div className={`milestone-dot ${ms.done ? "milestone-done" : "milestone-pending"}`}>{ms.done ? "✓" : "○"}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{ms.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-dimmer)", marginTop: 2 }}>{ms.date}</div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Tabs */}
        <CampaignTabs
          tabs={[
            { key: "submissions", label: "Submissions", content: submissionsTab },
            { key: "participants", label: "Participants", content: participantsTab },
            { key: "rules", label: "Rules", content: rulesTab },
          ]}
        />

        <div style={{ fontSize: 12.5, color: "var(--text-dim)" }}>
          Submissions that meet the campaign rules are approved automatically — companies can flag but can&apos;t reject
          a compliant submission. Revenue, sales and funnel figures are demo metrics while sales attribution is built
          (phase 2); views, spend, creators and submissions are real.
        </div>
      </div>
    </CompanyNav>
  );
}

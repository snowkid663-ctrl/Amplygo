import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import {
  getCompanyByUserId,
  getCampaignById,
  listParticipationsByCampaign,
  listSubmissionsByCampaign,
  getCreatorById,
  countParticipants,
  listInvitesByCampaign,
  campaignSalesSummary,
} from "@/lib/data";
import CampaignInviteManager from "@/components/CampaignInviteManager";
import JoinRequestActions from "@/components/JoinRequestActions";
import ShareResults from "@/components/ShareResults";
import { formatCents, convertCents } from "@/lib/money";
import { campaignMetrics } from "@/lib/demoMetrics";
import { campaignStatusTone, submissionStatusTone, formatDate, formatNumber } from "@/lib/format";
import { PLATFORM_LABEL, type Platform, type ProductMediaItem, type AttachmentItem } from "@/lib/types";
import PlatformIcon from "@/components/PlatformIcon";
import CompanyNav from "@/components/CompanyNav";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import CampaignStatusActions from "@/components/CampaignStatusActions";
import EmptyState from "@/components/ui/EmptyState";
import RangeAreaChart from "@/components/RangeAreaChart";
import ConversionFunnel from "@/components/ConversionFunnel";
import CampaignTabs from "@/components/CampaignTabs";
import CountUp from "@/components/CountUp";

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

function Metric({ label, value, delta, sub }: { label: string; value: React.ReactNode; delta?: number; sub?: string }) {
  return (
    <Card className="lift spot-card" style={{ padding: "14px 16px" }}>
      <div className="metric-label">{label}</div>
      <div className="metric-value tabular">{value}</div>
      {delta != null ? (
        <div className={`metric-delta ${delta >= 0 ? "kpi-up" : "kpi-down"}`}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
        </div>
      ) : sub ? (
        <div className="metric-delta" style={{ color: "var(--text-dimmer)" }}>{sub}</div>
      ) : null}
    </Card>
  );
}

function MetricSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="metric-section-head">{title}</div>
      <div className="metric-grid">{children}</div>
    </section>
  );
}

export default async function CompanyCampaignDetail({ params }: { params: { id: string } }) {
  const session = await requireRole("COMPANY");
  const company = (await getCompanyByUserId(session.user.id))!;
  const campaign = await getCampaignById(params.id);
  if (!campaign || campaign.companyId !== company.id) notFound();

  const cur = company.currency;
  const [participations, submissions, invites] = await Promise.all([
    listParticipationsByCampaign(campaign.id),
    listSubmissionsByCampaign(campaign.id),
    listInvitesByCampaign(campaign.id),
  ]);
  const pendingRequests = participations.filter((p) => p.status === "PENDING");
  const submissionByParticipation = new Map(submissions.map((s) => [s.participationId, s]));
  const rulesChecklist: string[] = JSON.parse(campaign.rulesChecklist || "[]");
  const pct = campaign.budgetCents > 0 ? Math.min(100, (campaign.spentCents / campaign.budgetCents) * 100) : 0;

  const platformList = (campaign.platforms ? campaign.platforms.split(",").filter(Boolean) : [campaign.platform]) as Platform[];
  const productMedia: ProductMediaItem[] = JSON.parse(campaign.productMedia || "[]");
  const attachments: AttachmentItem[] = JSON.parse(campaign.attachments || "[]");

  // Resolve every involved creator's name once, then look up synchronously.
  const creatorIds = Array.from(new Set([...participations, ...submissions].map((r) => r.creatorId)));
  const creatorEntries = await Promise.all(
    creatorIds.map(async (id) => [id, (await getCreatorById(id))?.displayName ?? "Unknown creator"] as const)
  );
  const creatorNames = new Map(creatorEntries);
  const nameOf = (id: string) => creatorNames.get(id) ?? "Unknown creator";
  const m = campaignMetrics(campaign, submissions, nameOf, cur, participations.length);
  const money = (c: number) => formatCents(c, cur);
  const kNum = (n: number) => formatNumber(n);

  // Real, Stripe-verified sales (Phase 3). Shown when tracking is set up.
  const realSales = await campaignSalesSummary(campaign.id, cur);
  const realByCreator = [...realSales.byCreator.entries()]
    .map(([id, v]) => ({ name: nameOf(id), ...v }))
    .sort((a, b) => b.revenueCents - a.revenueCents);
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
            <Link href={`/creators/${s.creatorId}`} style={{ fontSize: 14, fontWeight: 500, color: "var(--accent-text)" }}>{nameOf(s.creatorId)}</Link>
            <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{formatDate(s.publishedAt)}</div>
            <div style={{ fontSize: 14 }}>
              {s.viewsCount != null ? formatNumber(s.viewsCount) : "—"}
              {(s.likesCount != null || s.commentsCount != null) && (
                <div style={{ fontSize: 11, color: "var(--text-dimmer)", marginTop: 2 }}>
                  {s.likesCount != null ? `❤ ${formatNumber(s.likesCount)}` : ""}
                  {s.likesCount != null && s.commentsCount != null ? " · " : ""}
                  {s.commentsCount != null ? `💬 ${formatNumber(s.commentsCount)}` : ""}
                </div>
              )}
            </div>
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
                <Link href={`/creators/${p.creatorId}`} style={{ fontSize: 14, fontWeight: 500, color: "var(--accent-text)" }}>{nameOf(p.creatorId)}</Link>
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
      <div className="page-pad dense">
        {/* HERO — "Your campaign today" */}
        <Card hero style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <Badge tone={campaignStatusTone(campaign.status)}>{campaign.status}</Badge>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-dim)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                  {platformList.map((p) => (
                    <PlatformIcon key={p} platform={p} size={15} />
                  ))}
                </span>
                {platformList.map((p) => PLATFORM_LABEL[p]).join(", ")} · {campaign.language} · {campaign.country} ·{" "}
                {campaign.endDate ? `Ends ${formatDate(campaign.endDate)}` : "No end date"}
              </span>
            </div>
            <ShareResults
              campaignId={campaign.id}
              token={campaign.shareToken}
              compact
              preview={{
                companyName: company.companyName,
                campaignName: campaign.name,
                totalViews: m.totalViews,
                revenue: money(m.revenueCents),
                roas: `${m.roas.toFixed(1)}x`,
                series: m.seriesByRange["30D"],
              }}
            />
          </div>

          <div>
            <div className="hero-today-label">Your campaign today</div>
            <div className="hero-today-grid">
              {[
                { k: "Views", v: `+${kNum(m.today.views)}`, d: m.today.viewsPct },
                { k: "Creators", v: `+${m.today.creators}`, d: m.today.creatorsPct },
                { k: "Videos", v: `+${m.today.videos}`, d: m.today.videosPct },
                { k: "Revenue", v: `+${money(m.today.revenueCents)}`, d: m.today.revenuePct },
              ].map((t) => (
                <div key={t.k} className="hero-today-cell">
                  <div className="hero-today-k">{t.k}</div>
                  <div className="hero-today-v tabular">{t.v}</div>
                  <div className="kpi-up" style={{ fontSize: 12 }}>▲ {t.d}%</div>
                </div>
              ))}
            </div>
            <div className="hero-today-summary">
              {m.today.creators >= 3
                ? `Strong day — ${m.today.creators} new creators joined and published ${m.today.videos} videos, adding ${kNum(m.today.views)} views.`
                : `Steady day — ${m.today.videos} new videos added ${kNum(m.today.views)} views.`}
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>
              <span>Budget spent</span>
              <span>{money(campaign.spentCents)} / {money(campaign.budgetCents)} · {Math.round(pct)}%</span>
            </div>
            <div className="progress-track" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </Card>

        {/* AI Insights */}
        <Card className="grad-border" style={{ padding: "18px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span className="cp-ai-chip">AI</span>
            <span style={{ fontSize: 13, color: "var(--text-dim)" }}>Automatic insights from your campaign</span>
          </div>
          <div className="insight-grid">
            {m.insights.map((ins) => (
              <div key={ins.title} className="insight-card">
                <div className="insight-title"><span>{ins.icon}</span> {ins.title}</div>
                <div className="insight-body">{ins.body}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Verified sales (Stripe) — real Phase-3 data */}
        <Panel
          title="Verified sales"
          right={<Badge tone={realSales.count > 0 ? "green" : "neutral"} small>{realSales.count > 0 ? "Stripe · live" : "Stripe"}</Badge>}
        >
          {realSales.count === 0 ? (
            <div style={{ padding: "16px 20px", fontSize: 13, color: "var(--text-dim)" }}>
              {campaign.landingUrl
                ? "No tracked sales yet. Creators share their tracking link; sales come in through your Stripe webhook."
                : "Set a product/landing URL on this campaign and connect your Stripe webhook to attribute real sales to each creator. (Business metrics below are demo until then.)"}
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 28, padding: "16px 20px", borderBottom: "1px solid var(--hairline)" }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)" }}>Verified revenue</div>
                  <div className="tabular" style={{ fontSize: 22, fontWeight: 800 }}>{money(realSales.revenueCents)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)" }}>Sales</div>
                  <div className="tabular" style={{ fontSize: 22, fontWeight: 800 }}>{kNum(realSales.count)}</div>
                </div>
              </div>
              {realByCreator.map((c, i) => (
                <div key={c.name} className="table-grid table-row" style={{ gridTemplateColumns: "2fr 1fr 1fr", borderTop: i === 0 ? "none" : "1px solid var(--hairline)" }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 13 }}>{c.count} sale{c.count > 1 ? "s" : ""}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{money(c.revenueCents)}</div>
                </div>
              ))}
            </>
          )}
        </Panel>

        {/* Business metrics */}
        <MetricSection title="Business">
          <Metric label="Revenue" value={<CountUp to={m.revenueCents} currency={cur} />} delta={m.deltas.revenue} />
          <Metric label="Profit" value={`+${money(m.profitCents)}`} delta={m.deltas.profit} />
          <Metric label="ROI" value={`${m.roi.toFixed(1)}x`} sub="Target: 2.5x" />
          <Metric label="Sales" value={kNum(m.sales)} delta={m.deltas.sales} />
          <Metric label="CPA" value={m.cpaCents > 0 ? money(m.cpaCents) : "—"} sub="Cost per acquisition" />
          <Metric label="ROAS" value={`${m.roas.toFixed(1)}x`} sub="Return on ad spend" />
          <Metric label="Conversion" value={`${m.conversionRatePct.toFixed(1)}%`} sub="Click → sale" />
        </MetricSection>

        {/* Distribution metrics */}
        <MetricSection title="Distribution">
          <Metric label="Creators" value={kNum(m.creators)} />
          <Metric label="Videos" value={kNum(m.videos)} />
          <Metric label="Views" value={kNum(m.totalViews)} />
          <Metric label="Reach" value={kNum(m.reach)} />
          <Metric label="Shares" value={kNum(m.shares)} />
          <Metric label="Comments" value={kNum(m.comments)} />
        </MetricSection>

        {/* Content metrics */}
        <MetricSection title="Content">
          <Metric label="Videos published today" value={kNum(m.today.videos)} />
          <Metric label="Average views" value={kNum(m.avgViews)} />
          <Metric label="Best performing video" value={kNum(m.bestVideoViews)} />
          <Metric label="Top platform" value={PLATFORM_LABEL[m.topPlatform]} />
        </MetricSection>

        {/* Creator metrics */}
        <MetricSection title="Creators">
          <Metric label="New creators today" value={`+${m.creatorMetrics.newToday}`} />
          <Metric label="Active creators" value={kNum(m.creatorMetrics.active)} />
          <Metric label="Returning creators" value={`${m.creatorMetrics.returningPct}%`} />
          <Metric label="Creator growth" value={`+${m.creatorMetrics.growthPct}%`} delta={m.creatorMetrics.growthPct} />
        </MetricSection>

        {/* Product assets */}
        {(productMedia.length > 0 || attachments.length > 0) && (
          <Panel title="Product assets">
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
              {productMedia.length > 0 && (
                <div className="asset-grid">
                  {productMedia.map((m, i) =>
                    m.type === "video" ? (
                      <a key={i} href={m.url} target="_blank" rel="noreferrer" className="asset-tile">🎬</a>
                    ) : (
                      <a key={i} href={m.url} target="_blank" rel="noreferrer" className="asset-tile" style={{ backgroundImage: `url(${m.url})` }} />
                    )
                  )}
                </div>
              )}
              {attachments.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {attachments.map((a, i) => (
                    <a key={i} href={a.url} target="_blank" rel="noreferrer" className="file-row" style={{ textDecoration: "none", color: "var(--text)" }}>
                      <span>📎</span> {a.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Panel>
        )}

        {/* Invite creators */}
        <Panel title="Invite creators">
          <div style={{ padding: 16 }}>
            <CampaignInviteManager
              campaignId={campaign.id}
              invites={invites}
              preview={{
                companyName: company.companyName,
                brand: campaign.brand,
                campaignName: campaign.name,
                cpmLabel: money(campaign.cpmCents),
                platform: campaign.platform,
              }}
            />
          </div>
        </Panel>

        {/* Pending join requests (from approval-required invite links) */}
        {pendingRequests.length > 0 && (
          <Panel title={`Join requests (${pendingRequests.length})`}>
            {pendingRequests.map((p, i) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 20px",
                  borderTop: i === 0 ? "none" : "1px solid var(--hairline)",
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{nameOf(p.creatorId)}</div>
                  <div style={{ fontSize: 12, color: "var(--text-dimmer)" }}>
                    Requested {formatDate(p.joinedAt)}
                    {p.ref ? ` · via ${p.ref}` : ""}
                  </div>
                </div>
                <JoinRequestActions participationId={p.id} />
              </div>
            ))}
          </Panel>
        )}

        {/* Chart + funnel */}
        <div className="resp-collapse" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
          <Panel title="Revenue over time">
            <div style={{ padding: "16px 16px 10px" }}>
              <RangeAreaChart ranges={m.seriesByRange} currency={cur} height={180} />
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
            <div className="x-scroll">
              <div style={{ minWidth: 860 }}>
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
              </div>
            </div>
          )}
        </Panel>

        {/* Top videos + latest sales */}
        <div className="resp-collapse" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
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
          <div className="resp-2" style={{ padding: "24px 20px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "28px 12px" }}>
            {milestones.map((ms) => (
              <div key={ms.label} style={{ textAlign: "center" }}>
                <div className={`milestone-dot ${ms.done ? "milestone-done" : "milestone-pending"}`}>{ms.done ? "✓" : "○"}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{ms.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-dimmer)", marginTop: 2 }}>{ms.date}</div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Community metrics */}
        <MetricSection title="Community">
          <Metric label="Announcements read" value={`${m.community.announcementsReadPct}%`} />
          <Metric label="Challenge participants" value={kNum(m.community.challengeParticipants)} />
          <Metric label="Comments" value={kNum(m.community.comments)} />
          <Metric label="Messages" value={kNum(m.community.messages)} />
        </MetricSection>

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

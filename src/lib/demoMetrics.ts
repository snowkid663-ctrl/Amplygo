import type { CampaignRow, SubmissionRow, Currency } from "./types";
import { convertCents } from "./money";

/**
 * DEMO analytics for the company campaign dashboard. The MVP doesn't track
 * sales / revenue / clicks / funnel yet (that needs sales attribution — phase
 * 2), so these are plausible numbers derived DETERMINISTICALLY from the
 * campaign id + its real views/spend, so they stay stable and internally
 * consistent per campaign. Real values (views, spend, videos) are used where
 * they exist; the rest is modelled from them.
 */

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface CreatorMetric {
  name: string;
  videos: number;
  views: number;
  clicks: number;
  sales: number;
  revenueCents: number;
  roas: number;
  profitCents: number;
  trend: "up" | "down" | "pending";
}

export interface SaleFeedItem {
  name: string;
  plan: string;
  amountCents: number;
  commissionCents: number;
  minsAgo: number;
}

export function campaignMetrics(
  campaign: CampaignRow,
  submissions: SubmissionRow[],
  creatorName: (id: string) => string,
  currency: Currency,
  participantCount?: number
) {
  const rng = mulberry32(hashSeed(campaign.id));
  const ctr = 0.06 + rng() * 0.025; // 6.0–8.5%
  const cvr = 0.035 + rng() * 0.02; // 3.5–5.5%
  const aovCents = convertCents(4900, "USD", currency); // ~$49 order

  const realViews = submissions.reduce((a, s) => a + (s.viewsCount ?? 0), 0);
  const totalViews = realViews > 0 ? realViews : Math.round(18000 + rng() * 42000);

  const clicks = Math.round(totalViews * ctr);
  const sales = Math.max(1, Math.round(clicks * cvr));
  const revenueCents = sales * aovCents;
  const spentCents = campaign.spentCents > 0 ? campaign.spentCents : Math.round(campaign.budgetCents * (0.3 + rng() * 0.4));
  const profitCents = revenueCents - spentCents;
  const roi = spentCents > 0 ? revenueCents / spentCents : 0;

  // ---- Distribution / creator / content / community (AmplyGo-specific) ----
  const distinctCreators = new Set(submissions.map((s) => s.creatorId)).size;
  const creators = participantCount || distinctCreators || Math.round(40 + rng() * 140);
  const videos = submissions.length || Math.round(creators * (1.2 + rng() * 1));
  const reach = Math.round(totalViews * (0.6 + rng() * 0.2));
  const shares = Math.round(totalViews * (0.008 + rng() * 0.012));
  const comments = Math.round(totalViews * (0.004 + rng() * 0.005));
  const avgViews = videos > 0 ? Math.round(totalViews / videos) : 0;
  const realBest = submissions.reduce((m, s) => Math.max(m, s.viewsCount ?? 0), 0);
  const bestVideoViews = realBest > 0 ? realBest : Math.round(avgViews * (3 + rng() * 3));
  const cpaCents = sales > 0 ? Math.round(spentCents / sales) : 0;
  const roas = spentCents > 0 ? revenueCents / spentCents : 0;
  const conversionRatePct = cvr * 100;

  // "Today" pulse
  const pct = (lo: number, hi: number) => Math.round(lo + rng() * (hi - lo));
  const today = {
    views: Math.round(totalViews * (0.06 + rng() * 0.06)),
    creators: Math.max(1, Math.round(creators * (0.05 + rng() * 0.07))),
    videos: Math.max(1, Math.round(videos * (0.04 + rng() * 0.06))),
    revenueCents: Math.round(revenueCents * (0.05 + rng() * 0.06)),
    viewsPct: pct(6, 24),
    creatorsPct: pct(4, 16),
    videosPct: pct(10, 48),
    revenuePct: pct(6, 20),
  };
  const creatorMetrics = {
    newToday: today.creators,
    active: Math.max(1, Math.round(creators * (0.35 + rng() * 0.35))),
    returningPct: pct(64, 88),
    growthPct: pct(8, 28),
  };
  const community = {
    announcementsReadPct: pct(84, 97),
    challengeParticipants: Math.round(creators * (0.2 + rng() * 0.25)),
    comments: Math.round(comments * (0.008 + rng() * 0.01)) + pct(20, 90),
    messages: pct(8, 40),
  };

  // AI-style insights (deterministic; read like analysis)
  const topPlatformLabel = { TIKTOK: "TikTok", YOUTUBE_SHORTS: "YouTube", INSTAGRAM_REELS: "Instagram" }[campaign.platform];
  const insights = [
    {
      icon: "📈",
      title: today.creators >= 3 ? "Your campaign accelerated today." : "Your campaign is steady.",
      body: `${today.creators} new creator${today.creators > 1 ? "s" : ""} joined and published ${today.videos} video${today.videos > 1 ? "s" : ""} today.`,
    },
    {
      icon: "💡",
      title: "Suggestion",
      body: roi >= 2.5 ? "ROAS is above target — increasing budget ~15% could scale reach." : "Tighten creator rules to lift conversion before scaling budget.",
    },
    {
      icon: "🔥",
      title: "Trend",
      body: `${topPlatformLabel} is your strongest platform right now, with an average of ${avgViews >= 1000 ? Math.round(avgViews / 1000) + "k" : avgViews} views per video.`,
    },
  ];

  const funnel = [
    { label: "Views", value: totalViews },
    { label: "Clicks", value: clicks },
    { label: "Landing Visits", value: Math.round(clicks * 0.7) },
    { label: "Checkout", value: Math.round(sales * 2.2) },
    { label: "Purchases", value: sales },
  ];

  // Per-creator leaderboard, grouped from real submissions.
  const byCreator = new Map<string, { views: number; videos: number }>();
  for (const s of submissions) {
    const c = byCreator.get(s.creatorId) ?? { views: 0, videos: 0 };
    c.videos += 1;
    c.views += s.viewsCount ?? 0;
    byCreator.set(s.creatorId, c);
  }
  const leaderboard: CreatorMetric[] = [...byCreator.entries()]
    .map(([id, agg]) => {
      const pending = agg.views === 0;
      const cl = Math.round(agg.views * ctr);
      const sa = Math.round(cl * cvr);
      const rev = sa * aovCents;
      const spentShare = totalViews > 0 ? spentCents * (agg.views / totalViews) : 0;
      const roas = spentShare > 0 ? rev / spentShare : 0;
      return {
        name: creatorName(id),
        videos: agg.videos,
        views: agg.views,
        clicks: cl,
        sales: sa,
        revenueCents: rev,
        roas,
        profitCents: rev - spentShare,
        trend: pending ? "pending" : rev - spentShare >= 0 ? "up" : "down",
      } as CreatorMetric;
    })
    .sort((a, b) => b.revenueCents - a.revenueCents);

  // Revenue-over-time (cumulative, 14 points, ending at revenue).
  const raw: number[] = [];
  let acc = 0;
  for (let i = 0; i < 14; i++) {
    acc += (revenueCents / 14) * (0.55 + rng() * 0.9);
    raw.push(acc);
  }
  const scale = acc > 0 ? revenueCents / acc : 1;
  const series = raw.map((v) => Math.round(v * scale));

  // Daily series for the date-range filter (7 / 30 / 90 days), deterministic.
  const mkSeries = (n: number) => {
    const out: number[] = [];
    let base = Math.max(1, revenueCents / 30);
    for (let i = 0; i < n; i++) {
      base *= 0.9 + rng() * 0.28;
      out.push(Math.max(0, Math.round(base)));
    }
    return out;
  };
  const seriesByRange: Record<string, number[]> = { "7D": mkSeries(7), "30D": mkSeries(30), "90D": mkSeries(90) };

  // Fake latest-sales feed from the top creators.
  const plans: [string, number][] = [
    ["Pro Plan", 4900],
    ["Annual Plan", 9700],
    ["Monthly", 1900],
  ];
  const feed: SaleFeedItem[] = Array.from({ length: 4 }).map((_, i) => {
    const lb = leaderboard[i % Math.max(1, leaderboard.length)];
    const [plan, usd] = plans[i % plans.length];
    const amt = convertCents(usd, "USD", currency);
    return {
      name: lb?.name ?? "@creator",
      plan,
      amountCents: amt,
      commissionCents: Math.round(amt * 0.048),
      minsAgo: (i + 1) * 5 + Math.floor(rng() * 4),
    };
  });

  // Seeded deltas for the KPI up/down chips.
  const delta = () => Math.round(12 + rng() * 30);

  return {
    ctr,
    cvr,
    totalViews,
    clicks,
    sales,
    revenueCents,
    spentCents,
    profitCents,
    roi,
    funnel,
    leaderboard,
    series,
    seriesByRange,
    feed,
    deltas: { revenue: delta(), profit: delta(), sales: delta() },
    // AmplyGo-specific groups
    creators,
    videos,
    reach,
    shares,
    comments,
    avgViews,
    bestVideoViews,
    cpaCents,
    roas,
    conversionRatePct,
    topPlatform: campaign.platform,
    today,
    creatorMetrics,
    community,
    insights,
  };
}

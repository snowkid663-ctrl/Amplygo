import type { Platform } from "./types";

export type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export const RARITY: Record<Rarity, { label: string; color: string; bg: string; border: string }> = {
  common: { label: "Common", color: "oklch(80% 0.14 150)", bg: "oklch(70% 0.14 150 / 0.14)", border: "oklch(70% 0.14 150 / 0.4)" },
  rare: { label: "Rare", color: "oklch(78% 0.14 235)", bg: "oklch(65% 0.16 235 / 0.16)", border: "oklch(65% 0.16 235 / 0.45)" },
  epic: { label: "Epic", color: "oklch(75% 0.18 300)", bg: "oklch(62% 0.2 300 / 0.16)", border: "oklch(62% 0.2 300 / 0.45)" },
  legendary: { label: "Legendary", color: "oklch(84% 0.16 90)", bg: "oklch(78% 0.15 90 / 0.16)", border: "oklch(78% 0.15 90 / 0.5)" },
  mythic: { label: "Mythic", color: "oklch(72% 0.2 25)", bg: "oklch(68% 0.2 25 / 0.16)", border: "oklch(68% 0.2 25 / 0.5)" },
};

export interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  rarity: Rarity;
  category: string;
}

// Full catalog. Only a subset is computed today (see earnedBadgeIds); the rest
// are documented in docs/features/badges.md and unlock as we track more.
export const BADGES: BadgeDef[] = [
  { id: "viral", name: "Viral Creator", emoji: "🚀", rarity: "rare", category: "Performance", description: "100k+ average views — consistently reaches large audiences." },
  { id: "million", name: "Million View Club", emoji: "💥", rarity: "epic", category: "Performance", description: "One video surpassed 1M views." },
  { id: "trusted", name: "Trusted Creator", emoji: "✅", rarity: "rare", category: "Reliability", description: "Completed 10+ campaigns." },
  { id: "reliable", name: "Reliable", emoji: "🛡", rarity: "common", category: "Reliability", description: "95%+ campaign completion rate." },
  { id: "fast", name: "Fast Publisher", emoji: "⚡", rarity: "common", category: "Reliability", description: "Usually publishes within 24 hours." },
  { id: "rules", name: "Rule Follower", emoji: "🎯", rarity: "common", category: "Reliability", description: "98% of submitted videos approved." },
  { id: "revenue", name: "Revenue Driver", emoji: "💵", rarity: "epic", category: "Business", description: "Generated over $10,000 for brands." },
  { id: "diamond", name: "Diamond Creator", emoji: "💎", rarity: "legendary", category: "Exclusive", description: "Reached $100k earned on AmplyGo." },
  { id: "veteran", name: "Veteran", emoji: "🏅", rarity: "epic", category: "Experience", description: "Completed 100 campaigns." },
  { id: "early", name: "Early Creator", emoji: "🥇", rarity: "rare", category: "Experience", description: "Joined AmplyGo during its first year." },
  { id: "brandFav", name: "Brand Favorite", emoji: "🔥", rarity: "rare", category: "Exclusive", description: "Worked with 20+ different companies." },
  { id: "tiktokExpert", name: "TikTok Expert", emoji: "🎵", rarity: "rare", category: "Platform", description: "Outstanding TikTok performance." },
  { id: "reelsExpert", name: "Reels Expert", emoji: "📸", rarity: "rare", category: "Platform", description: "Outstanding Instagram Reels performance." },
  { id: "shortsExpert", name: "Shorts Expert", emoji: "▶", rarity: "rare", category: "Platform", description: "Outstanding YouTube Shorts performance." },
];

const BY_ID = new Map(BADGES.map((b) => [b.id, b]));
export const getBadge = (id: string) => BY_ID.get(id);

export interface CreatorBadgeStats {
  approvedCount: number;
  submittedCount: number; // approved + rejected
  participationCount: number;
  avgViews: number;
  maxViews: number;
  grossUsdCents: number; // generated for brands
  netUsdCents: number; // creator earned
  distinctCompanies: number;
  joinedAt: string | null;
  avgPublishGapHours: number | null;
  platform: Record<Platform, { n: number; avgViews: number }>;
}

const PLATFORM_BADGE: Record<Platform, string> = {
  TIKTOK: "tiktokExpert",
  INSTAGRAM_REELS: "reelsExpert",
  YOUTUBE_SHORTS: "shortsExpert",
};

/** Which badges a creator has earned, from real stats. Ordered by rarity. */
export function earnedBadgeIds(s: CreatorBadgeStats): string[] {
  const ids: string[] = [];
  const approvalRate = s.submittedCount > 0 ? s.approvedCount / s.submittedCount : 0;
  const completionRate = s.participationCount > 0 ? s.approvedCount / s.participationCount : 0;

  if (s.avgViews >= 100000) ids.push("viral");
  if (s.maxViews >= 1000000) ids.push("million");
  if (s.approvedCount >= 10) ids.push("trusted");
  if (s.approvedCount >= 100) ids.push("veteran");
  if (s.participationCount >= 3 && completionRate >= 0.95) ids.push("reliable");
  if (s.submittedCount >= 5 && approvalRate >= 0.98) ids.push("rules");
  if (s.avgPublishGapHours != null && s.avgPublishGapHours <= 24 && s.approvedCount >= 2) ids.push("fast");
  if (s.grossUsdCents >= 1_000_000) ids.push("revenue"); // $10k
  if (s.netUsdCents >= 10_000_000) ids.push("diamond"); // $100k
  if (s.distinctCompanies >= 20) ids.push("brandFav");
  if (s.joinedAt && new Date(s.joinedAt) < new Date("2027-01-01")) ids.push("early");

  for (const p of Object.keys(s.platform) as Platform[]) {
    const pd = s.platform[p];
    if (pd.n >= 3 && pd.avgViews >= 50000) ids.push(PLATFORM_BADGE[p]);
  }

  const order: Rarity[] = ["mythic", "legendary", "epic", "rare", "common"];
  return ids.sort((a, b) => order.indexOf(getBadge(a)!.rarity) - order.indexOf(getBadge(b)!.rarity));
}

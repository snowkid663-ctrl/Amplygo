import { requireRole } from "@/lib/session";
import { getCreatorByUserId, creatorProfile, creatorBadgeStats } from "@/lib/data";
import { earnedBadgeIds, getBadge, RARITY } from "@/lib/badges";
import { formatCents } from "@/lib/money";
import { formatNumber } from "@/lib/format";
import CreatorNav from "@/components/CreatorNav";
import CountUp from "@/components/CountUp";
import PlatformIcon from "@/components/PlatformIcon";
import { Card } from "@/components/ui/Card";

const FLAGS: Record<string, string> = {
  Brazil: "🇧🇷", Brasil: "🇧🇷", "United States": "🇺🇸", USA: "🇺🇸", US: "🇺🇸",
  "United Kingdom": "🇬🇧", UK: "🇬🇧", Canada: "🇨🇦", Germany: "🇩🇪", France: "🇫🇷",
  Spain: "🇪🇸", Portugal: "🇵🇹", Italy: "🇮🇹", Mexico: "🇲🇽", India: "🇮🇳",
  Japan: "🇯🇵", Australia: "🇦🇺", Global: "🌎", Worldwide: "🌎",
};

function sinceLabel(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  return (p.length === 1 ? p[0].slice(0, 2) : (p[0]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")).toUpperCase() || "?";
}

export default async function CreatorProfilePage() {
  const session = await requireRole("CREATOR");
  const creator = (await getCreatorByUserId(session.user.id))!;
  const cur = creator.displayCurrency;
  const [profile, badgeStats] = await Promise.all([
    creatorProfile(creator.id, cur),
    creatorBadgeStats(creator.id),
  ]);
  const badges = earnedBadgeIds(badgeStats).slice(0, 4);
  const since = sinceLabel(profile.joinedAt);
  const flag = profile.country ? FLAGS[profile.country] ?? "🌎" : null;

  const bigStats = [
    { k: "Videos", v: profile.overview.videos },
    { k: "Views Generated", v: profile.overview.views },
    { k: "Revenue Earned", v: profile.overview.revenueCents, money: true },
    { k: "Campaigns", v: profile.overview.campaigns },
  ];

  return (
    <CreatorNav title="Profile">
      <div className="page-narrow" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {/* Identity header */}
        <Card style={{ overflow: "hidden", padding: 0 }}>
          <div
            className="cp-banner"
            style={
              creator.bannerUrl
                ? { backgroundImage: `url(${creator.bannerUrl})`, backgroundPosition: `center ${creator.bannerPos}%` }
                : undefined
            }
          />
          <div className="cp-head">
            <div className="cp-avatar" style={creator.avatarUrl ? { backgroundImage: `url(${creator.avatarUrl})` } : undefined}>
              {!creator.avatarUrl && <span>{initials(creator.displayName)}</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>{creator.displayName}</h1>
                {badges.map((id) => {
                  const b = getBadge(id);
                  if (!b) return null;
                  const r = RARITY[b.rarity];
                  return (
                    <span key={id} title={`${b.name} · ${r.label}`} className="cp-badge" style={{ background: r.bg, border: `1px solid ${r.border}` }}>
                      {b.emoji}
                    </span>
                  );
                })}
              </div>
              <div className="cp-tags">
                {profile.tags.length > 0 ? (
                  profile.tags.map((t, i) => (
                    <span key={t}>
                      {i > 0 && <span className="cp-dot">•</span>}
                      {t}
                    </span>
                  ))
                ) : (
                  <span style={{ color: "var(--text-dimmer)" }}>New creator</span>
                )}
              </div>
              <div className="cp-meta">
                {flag && <span>{flag} {profile.country}</span>}
                {since && <span>Creator since {since}</span>}
              </div>
            </div>
          </div>
        </Card>

        {/* Creator Overview — four big numbers */}
        <section>
          <div className="section-label" style={{ marginBottom: 12 }}>Creator Overview</div>
          <div className="resp-2" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {bigStats.map((s, i) => (
              <Card key={s.k} className="lift spot-card" style={{ padding: "20px 18px" }}>
                <div className="cp-big">
                  {s.money ? (
                    <CountUp to={s.v} currency={cur} startOnView duration={1400} />
                  ) : (
                    <CountUp to={s.v} startOnView duration={1400} />
                  )}
                </div>
                <div className="cp-big-k">{s.k}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* Recent Performance */}
        <section>
          <div className="section-label" style={{ marginBottom: 12 }}>Recent Performance · Last 30 days</div>
          <Card style={{ padding: "18px 22px" }}>
            <div className="cp-recent">
              <div><div className="cp-recent-v">{formatNumber(profile.last30.videos)}</div><div className="cp-recent-k">Videos</div></div>
              <div><div className="cp-recent-v">{formatNumber(profile.last30.views)}</div><div className="cp-recent-k">Views</div></div>
              <div><div className="cp-recent-v">{formatCents(profile.last30.revenueCents, cur)}</div><div className="cp-recent-k">Revenue</div></div>
            </div>
          </Card>
        </section>

        {/* Brands / Creator Network */}
        {profile.brands.length > 0 && (
          <section>
            <div className="section-label" style={{ marginBottom: 12 }}>Creator Network</div>
            <Card style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {profile.brands.map((b) => (
                  <span key={b} className="cp-brand">{b}</span>
                ))}
              </div>
            </Card>
          </section>
        )}

        {/* Featured Videos */}
        {profile.featured.length > 0 && (
          <section>
            <div className="section-label" style={{ marginBottom: 12 }}>Featured Videos</div>
            <div className="cp-videos">
              {profile.featured.map((v, i) => (
                <a key={i} href={v.videoUrl} target="_blank" rel="noopener noreferrer" className={`cp-video cp-grad-${(i % 5) + 1}`}>
                  <div className="cp-video-play">▶</div>
                  <div className="cp-video-foot">
                    <PlatformIcon platform={v.platform} size={14} />
                    <span>{formatNumber(v.views)} views</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Insights */}
        {profile.insights.length > 0 && (
          <section>
            <div className="section-label" style={{ marginBottom: 12 }}>Creator Insights</div>
            <Card className="grad-border" style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span className="cp-ai-chip">AI</span>
                <span style={{ fontSize: 13, color: "var(--text-dim)" }}>Generated from this creator&apos;s performance</span>
              </div>
              <ul className="cp-insights">
                {profile.insights.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </Card>
          </section>
        )}
      </div>
    </CreatorNav>
  );
}

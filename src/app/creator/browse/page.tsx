import Link from "next/link";
import { requireRole } from "@/lib/session";
import { getCreatorByUserId, listOpenCampaignsForCreator, listSocialAccounts, getCompanyById } from "@/lib/data";
import { formatConverted } from "@/lib/money";
import { PLATFORM_LABEL, type Platform } from "@/lib/types";
import PlatformIcon from "@/components/PlatformIcon";
import CreatorNav from "@/components/CreatorNav";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import PillFilterLinks from "@/components/ui/PillFilterLinks";
import EmptyState from "@/components/ui/EmptyState";

export default async function BrowseCampaignsPage({ searchParams }: { searchParams: { platform?: string } }) {
  const session = await requireRole("CREATOR");
  const creator = getCreatorByUserId(session.user.id)!;
  const cur = creator.displayCurrency;
  const accounts = listSocialAccounts(creator.id);
  const connectedPlatforms = new Set(accounts.map((a) => a.platform));

  const filter = (searchParams.platform ?? "all") as Platform | "all";
  const all = listOpenCampaignsForCreator();
  const campaigns = filter === "all" ? all : all.filter((c) => c.platform === filter);

  return (
    <CreatorNav
      title="Browse campaigns"
      headerRight={
        connectedPlatforms.size > 0 ? (
          <Badge tone="green">{[...connectedPlatforms].map((p) => PLATFORM_LABEL[p]).join(", ")} connected</Badge>
        ) : (
          <Badge tone="amber">No account connected</Badge>
        )
      }
    >
      <div className="page-pad">
        <PillFilterLinks
          basePath="/creator/browse"
          paramName="platform"
          current={filter}
          options={[
            { value: "all", label: "All platforms" },
            { value: "TIKTOK", label: "TikTok" },
            { value: "YOUTUBE_SHORTS", label: "YouTube" },
            { value: "INSTAGRAM_REELS", label: "Instagram" },
          ]}
        />

        {campaigns.length === 0 ? (
          <EmptyState title="No open campaigns right now" subtitle="Check back soon — new campaigns are added regularly." />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
            {campaigns.map((c) => {
              const budgetLeft = Math.max(0, c.budgetCents - c.spentCents);
              const canJoin = connectedPlatforms.has(c.platform);
              const companyCur = getCompanyById(c.companyId)?.currency ?? "USD";
              return (
                <Link
                  key={c.id}
                  href={`/creator/campaigns/${c.id}`}
                  className="card"
                  style={{ overflow: "hidden", display: "flex", flexDirection: "column", color: "inherit" }}
                >
                  <div
                    style={{
                      height: 64,
                      background: "linear-gradient(135deg, oklch(55% 0.16 264), oklch(45% 0.16 300))",
                    }}
                  />
                  <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, background: "oklch(100% 0 0 / 0.08)", color: "oklch(80% 0.01 264)", padding: "3px 9px 3px 7px", borderRadius: 100 }}>
                        <PlatformIcon platform={c.platform} size={14} />
                        {PLATFORM_LABEL[c.platform]}
                      </span>
                      {!canJoin && <Badge tone="amber" small>Connect account</Badge>}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                      {c.brand} · {c.category}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, paddingTop: 8, borderTop: "1px solid var(--hairline)" }}>
                      <span style={{ color: "var(--text-dim)" }}>CPM</span>
                      <span style={{ fontWeight: 600 }}>{formatConverted(c.cpmCents, companyCur, cur)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "var(--text-dim)" }}>Budget left</span>
                      <span style={{ fontWeight: 600 }}>{formatConverted(budgetLeft, companyCur, cur)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </CreatorNav>
  );
}

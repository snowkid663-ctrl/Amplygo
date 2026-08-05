import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { getCreatorById, creatorProfile, creatorBadgeStats } from "@/lib/data";
import { earnedBadgeIds } from "@/lib/badges";
import BrandLogo from "@/components/BrandLogo";
import CreatorProfileView from "@/components/CreatorProfileView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const creator = await getCreatorById(params.id);
  return { title: creator ? `${creator.displayName} — Creator on AmplyGo` : "Creator — AmplyGo" };
}

export default async function PublicCreatorProfile({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user) redirect(`/auth?callbackUrl=/creators/${params.id}`);

  const creator = await getCreatorById(params.id);
  if (!creator) notFound();

  // Currency shown is the viewer's own where available, else the creator's.
  const cur = (session.user.currency as typeof creator.displayCurrency) ?? creator.displayCurrency;
  const [profile, badgeStats] = await Promise.all([
    creatorProfile(creator.id, cur),
    creatorBadgeStats(creator.id),
  ]);
  const badges = earnedBadgeIds(badgeStats).slice(0, 4);
  const viewerCreator = { ...creator, displayCurrency: cur };

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", borderBottom: "1px solid var(--card-border)" }}>
        <Link href="/" style={{ display: "inline-block" }}>
          <BrandLogo height={26} />
        </Link>
        <Link href={session.user.role === "COMPANY" ? "/company/dashboard" : "/creator/dashboard"} className="btn btn-secondary btn-sm glass" style={{ borderRadius: 100 }}>
          ← Back to dashboard
        </Link>
      </div>
      <div style={{ padding: "24px 0" }}>
        <CreatorProfileView creator={viewerCreator} profile={profile} badges={badges} />
      </div>
    </div>
  );
}

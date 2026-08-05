import { requireRole } from "@/lib/session";
import { getCreatorByUserId, creatorProfile, creatorBadgeStats } from "@/lib/data";
import { earnedBadgeIds } from "@/lib/badges";
import CreatorNav from "@/components/CreatorNav";
import CreatorProfileView from "@/components/CreatorProfileView";

export default async function CreatorProfilePage() {
  const session = await requireRole("CREATOR");
  const creator = (await getCreatorByUserId(session.user.id))!;
  const [profile, badgeStats] = await Promise.all([
    creatorProfile(creator.id, creator.displayCurrency),
    creatorBadgeStats(creator.id),
  ]);
  const badges = earnedBadgeIds(badgeStats).slice(0, 4);

  return (
    <CreatorNav title="Profile">
      <CreatorProfileView creator={creator} profile={profile} badges={badges} />
    </CreatorNav>
  );
}

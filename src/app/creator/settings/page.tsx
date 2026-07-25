import { requireRole } from "@/lib/session";
import { getCreatorByUserId, listSocialAccounts, creatorBadgeStats } from "@/lib/data";
import { connectStatus } from "@/lib/oauth";
import { badgeProgress } from "@/lib/badges";
import CreatorNav from "@/components/CreatorNav";
import { Card } from "@/components/ui/Card";
import SocialAccountsPanel from "@/components/SocialAccountsPanel";
import CreatorProfileForm from "@/components/CreatorProfileForm";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import ProfileMediaEditor from "@/components/ProfileMediaEditor";
import BadgeGallery from "@/components/BadgeGallery";
import BadgeList from "@/components/BadgeList";

const CONNECT_ERRORS: Record<string, string> = {
  state: "Connection expired or was tampered with. Please try again.",
  token: "Could not complete the connection with the provider.",
  identity:
    "Signed in, but we couldn't read your channel. Make sure this Google account has a YouTube channel, and that the “YouTube Data API v3” is enabled in the Google Cloud project (APIs & Services → Library).",
  denied: "You declined the permission request.",
};

export default async function CreatorSettingsPage({
  searchParams,
}: {
  searchParams: { connected?: string; connect_error?: string };
}) {
  const session = await requireRole("CREATOR");
  const creator = (await getCreatorByUserId(session.user.id))!;
  const accounts = await listSocialAccounts(creator.id);
  const status = connectStatus();
  const badges = badgeProgress(await creatorBadgeStats(creator.id));
  const earnedBadges = badges.filter((b) => b.earned).map((b) => b.def.id);

  const connected = searchParams.connected;
  const connectError = searchParams.connect_error;

  return (
    <CreatorNav title="Settings">
      <div className="page-narrow">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="section-label">Profile</div>
          <Card className="lift" style={{ padding: "20px" }}>
            <ProfileMediaEditor
              name={creator.displayName}
              avatarUrl={creator.avatarUrl}
              bannerUrl={creator.bannerUrl}
              bannerPos={creator.bannerPos}
              avatarShape="circle"
            />
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 16 }}>
              Signed in as {session.user.email}
            </div>
            <CreatorProfileForm
              displayName={creator.displayName}
              bio={creator.bio}
              displayCurrency={creator.displayCurrency}
            />
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="section-label">Badges</div>
          <Card className="lift" style={{ padding: "14px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <BadgeList ids={earnedBadges} />
              <span className="tabular" style={{ fontSize: 12, color: "var(--text-dim)", whiteSpace: "nowrap" }}>
                {earnedBadges.length} / {badges.length} unlocked
              </span>
            </div>
            <details className="badge-details">
              <summary>See all badges &amp; progress</summary>
              <div style={{ marginTop: 14 }}>
                <BadgeGallery items={badges} />
              </div>
            </details>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="section-label">Password</div>
          <Card className="lift" style={{ padding: "20px" }}>
            <ChangePasswordForm />
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="section-label">Connected accounts</div>
          <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: -6 }}>
            Connect the account you post from so AmplyGo can track views. Required before joining a campaign on that
            platform. YouTube and Instagram connect through the real provider API; TikTok is still a manual handle
            until its developer app is approved.
          </div>
          {connected && <div className="alert-success fu">Connected your {connected} account successfully.</div>}
          {connectError && (
            <div className="alert-error fu">{CONNECT_ERRORS[connectError] ?? "Could not connect the account."}</div>
          )}
          <SocialAccountsPanel accounts={accounts} connectStatus={status} />
        </div>
      </div>
    </CreatorNav>
  );
}

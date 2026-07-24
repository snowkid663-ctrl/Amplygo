import { requireRole } from "@/lib/session";
import { getCreatorByUserId, listSocialAccounts } from "@/lib/data";
import { connectStatus } from "@/lib/oauth";
import CreatorNav from "@/components/CreatorNav";
import { Card } from "@/components/ui/Card";
import SocialAccountsPanel from "@/components/SocialAccountsPanel";
import CreatorProfileForm from "@/components/CreatorProfileForm";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import ProfileMediaEditor from "@/components/ProfileMediaEditor";

const CONNECT_ERRORS: Record<string, string> = {
  state: "Connection expired or was tampered with. Please try again.",
  token: "Could not complete the connection with the provider.",
  identity: "Connected, but we couldn't read your account details.",
  denied: "You declined the permission request.",
};

export default async function CreatorSettingsPage({
  searchParams,
}: {
  searchParams: { connected?: string; connect_error?: string };
}) {
  const session = await requireRole("CREATOR");
  const creator = getCreatorByUserId(session.user.id)!;
  const accounts = listSocialAccounts(creator.id);
  const status = connectStatus();

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

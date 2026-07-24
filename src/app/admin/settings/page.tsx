import { requireRole } from "@/lib/session";
import AdminNav from "@/components/AdminNav";
import { Card } from "@/components/ui/Card";
import AdminProfileForm from "@/components/AdminProfileForm";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export default async function AdminSettingsPage() {
  const session = await requireRole("ADMIN");

  return (
    <AdminNav title="Settings">
      <div className="page-narrow">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="section-label">Profile</div>
          <Card className="lift" style={{ padding: "20px" }}>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 16 }}>
              Signed in as {session.user.email}
            </div>
            <AdminProfileForm name={session.user.name} />
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="section-label">Password</div>
          <Card className="lift" style={{ padding: "20px" }}>
            <ChangePasswordForm />
          </Card>
        </div>
      </div>
    </AdminNav>
  );
}

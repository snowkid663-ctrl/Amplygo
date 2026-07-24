import { requireRole } from "@/lib/session";
import { listUsers } from "@/lib/data";
import { formatDate } from "@/lib/format";
import AdminNav from "@/components/AdminNav";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import PillFilterLinks from "@/components/ui/PillFilterLinks";
import UserSuspendAction from "@/components/UserSuspendAction";
import TableSearch from "@/components/TableSearch";
import type { Role } from "@/lib/types";

export default async function AdminUsersPage({ searchParams }: { searchParams: { role?: string } }) {
  await requireRole("ADMIN");
  const filter = (searchParams.role ?? "all") as Role | "all";
  const all = await listUsers();
  const users = filter === "all" ? all : all.filter((u) => u.role === filter);

  return (
    <AdminNav title="Users">
      <div className="page-pad">
        <TableSearch
          placeholder="Search users"
          right={
            <PillFilterLinks
              basePath="/admin/users"
              paramName="role"
              current={filter}
              options={[
                { value: "all", label: "All" },
                { value: "CREATOR", label: "Creators" },
                { value: "COMPANY", label: "Companies" },
                { value: "ADMIN", label: "Admins" },
              ]}
            />
          }
        >
        <Card style={{ overflow: "hidden" }}>
          <div className="table-grid table-head" style={{ gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr" }}>
            <div>Name</div>
            <div>Role</div>
            <div>Joined</div>
            <div>Status</div>
            <div />
          </div>
          {users.map((u) => (
            <div key={u.id} data-search={`${u.name} ${u.email} ${u.role}`} className="table-grid table-row" style={{ gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{u.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{u.email}</div>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{u.role}</div>
              <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{formatDate(u.createdAt)}</div>
              <div>
                <Badge tone={u.suspended ? "red" : "green"}>{u.suspended ? "Suspended" : "Active"}</Badge>
              </div>
              {u.role !== "ADMIN" && <UserSuspendAction userId={u.id} suspended={!!u.suspended} />}
            </div>
          ))}
        </Card>
        </TableSearch>
      </div>
    </AdminNav>
  );
}

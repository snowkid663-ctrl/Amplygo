import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";
import type { Role } from "./types";

export async function getSession() {
  return getServerSession(authOptions);
}

/** Server-side guard for pages. Redirects to /auth if not logged in,
 *  or to the user's own home if logged in with a different role. */
export async function requireRole(role: Role) {
  const session = await getSession();
  if (!session?.user) redirect("/auth");
  if (session.user.role !== role) {
    const home =
      session.user.role === "COMPANY"
        ? "/company/dashboard"
        : session.user.role === "CREATOR"
        ? "/creator/dashboard"
        : "/admin/dashboard";
    redirect(home);
  }
  return session;
}

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

/**
 * Bridge after "Continue with YouTube": once the user is signed in with Google,
 * send them straight into the YouTube connect OAuth so their channel is linked
 * automatically — no separate "connect" click in Settings.
 */
export default async function ConnectYouTubeBridge() {
  const session = await getSession();
  if (!session?.user) redirect("/auth");

  // New Google users still need to pick a role first; come back here after.
  if (!session.user.role) redirect("/onboarding?next=connect-youtube");

  if (session.user.role === "CREATOR") redirect("/api/connect/youtube");

  // Companies don't link YouTube channels.
  redirect(session.user.role === "ADMIN" ? "/admin/dashboard" : "/company/dashboard");
}

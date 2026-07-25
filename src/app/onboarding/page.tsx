import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import OnboardingForm from "@/components/OnboardingForm";

export default async function OnboardingPage({ searchParams }: { searchParams: { next?: string } }) {
  const session = await getSession();
  if (!session?.user) redirect("/auth");
  const next = searchParams.next;

  // Already has an account type — send them home (or into YouTube linking).
  if (session.user.role) {
    if (session.user.role === "CREATOR" && next === "connect-youtube") redirect("/api/connect/youtube");
    const home =
      session.user.role === "COMPANY"
        ? "/company/dashboard"
        : session.user.role === "CREATOR"
        ? "/creator/dashboard"
        : "/admin/dashboard";
    redirect(home);
  }

  return <OnboardingForm email={session.user.email} name={session.user.name ?? ""} next={next} />;
}

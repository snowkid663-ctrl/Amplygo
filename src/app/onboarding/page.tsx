import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import OnboardingForm from "@/components/OnboardingForm";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session?.user) redirect("/auth");

  // Already has an account type — send them home.
  if (session.user.role) {
    const home =
      session.user.role === "COMPANY"
        ? "/company/dashboard"
        : session.user.role === "CREATOR"
        ? "/creator/dashboard"
        : "/admin/dashboard";
    redirect(home);
  }

  return <OnboardingForm email={session.user.email} name={session.user.name ?? ""} />;
}

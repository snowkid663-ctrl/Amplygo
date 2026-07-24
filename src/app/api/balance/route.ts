import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getCompanyByUserId, addCompanyBalance } from "@/lib/data";

// MOCK/PLACEHOLDER: no real payment processor is wired up in the MVP.
// This simulates a deposit so the end-to-end campaign flow can be tested.
// Phase 2: replace with a real payment provider (Stripe, etc).
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const company = await getCompanyByUserId(session.user.id);
  if (!company) return NextResponse.json({ error: "Company profile not found" }, { status: 404 });

  const { amount } = (await req.json().catch(() => ({}))) as { amount: number };
  const amountCents = Math.round(Number(amount) * 100);
  if (!amountCents || amountCents <= 0) {
    return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
  }

  await addCompanyBalance(company.id, amountCents, "Manual deposit (mock)");
  return NextResponse.json({ ok: true });
}

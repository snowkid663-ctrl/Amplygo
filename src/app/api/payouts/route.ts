import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getCreatorByUserId, availableBalance, requestPayout } from "@/lib/data";
import { convertCents, formatCents } from "@/lib/money";
import type { PayoutMethod } from "@/lib/types";

const MIN_PAYOUT_USD_CENTS = 2000; // $20.00 minimum - Perguntas e questionamentos, pergunta 8

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "CREATOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const creator = getCreatorByUserId(session.user.id)!;
  const currency = creator.displayCurrency ?? "USD";
  const { amount, method } = (await req.json().catch(() => ({}))) as { amount: number; method: PayoutMethod };
  const amountCents = Math.round(Number(amount) * 100);

  // The $20 minimum is defined in USD; convert it to the creator's currency.
  const minCents = convertCents(MIN_PAYOUT_USD_CENTS, "USD", currency);
  if (!amountCents || amountCents < minCents) {
    return NextResponse.json({ error: `Minimum withdrawal is ${formatCents(minCents, currency)}` }, { status: 400 });
  }
  if (!method) return NextResponse.json({ error: "Choose a payout method" }, { status: 400 });

  const available = availableBalance(creator.id, currency);
  if (amountCents > available) {
    return NextResponse.json({ error: "Amount exceeds your available balance" }, { status: 400 });
  }

  const payout = requestPayout(creator.id, amountCents, method, currency);
  return NextResponse.json({ payout });
}

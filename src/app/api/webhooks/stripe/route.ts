import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getTrackingLinkByCode, recordSale } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Verifies Stripe's `Stripe-Signature` header (v1 scheme) without the SDK.
 * signed_payload = `${timestamp}.${rawBody}`, HMAC-SHA256 with the endpoint
 * secret; compared in constant time. 5-minute timestamp tolerance.
 */
function verifyStripeSignature(raw: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((kv) => kv.split("=") as [string, string]));
  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false; // replay protection
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${raw}`).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET not configured" }, { status: 503 });

  const raw = await req.text();
  if (!verifyStripeSignature(raw, req.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // A completed checkout carries our tracking code (attribution).
  if (event?.type === "checkout.session.completed") {
    const s = event.data?.object ?? {};
    const code: string | null = s.client_reference_id || s.metadata?.amplygo_ref || null;
    if (code) {
      const link = await getTrackingLinkByCode(code);
      if (link) {
        await recordSale({
          campaignId: link.campaignId,
          creatorId: link.creatorId,
          code,
          amountCents: Number(s.amount_total ?? 0),
          currency: String(s.currency ?? "usd").toUpperCase(),
          externalId: String(s.id), // idempotency
        });
      }
    }
  }

  // Always 200 so Stripe doesn't retry on events we ignore.
  return NextResponse.json({ received: true });
}

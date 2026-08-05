# Sales tracking (Phase 3)

**Status:** shipped (Fluxo A — tracking link + Stripe `client_reference_id`)
**Last updated:** 2026-07-25

## Goal
Attribute each real sale back to the creator/video that drove it, to validate
that organic creator content converts (starting with NovaVision + Stripe).

## Flow (A — precise, needs a small checkout change)
```
Creator's video → amplygo.com/r/<code>  (unique per campaign+creator)
   → 302 to campaign.landingUrl?ref=<code>   (click counted)
   → company checkout stores ref → Stripe Checkout Session.client_reference_id
   → Stripe webhook → /api/webhooks/stripe (signature verified)
   → look up <code> → creator/campaign → record sale (idempotent by session id)
   → company campaign page → "Verified sales" panel (real revenue per creator)
```

## What AmplyGo provides
- **Landing URL** on the campaign (set at creation).
- **`/r/[code]`** — records a click and redirects to the landing URL with `?ref`.
- **Tracking link** shown to each creator on their campaign page (once joined).
- **`/api/webhooks/stripe`** — verifies `Stripe-Signature` (v1 HMAC, no SDK),
  handles `checkout.session.completed`, records the sale.
- **`sales` + `tracking_links`** tables; `campaignSalesSummary()` aggregates.

## What the company (NovaVision) does
1. Set the campaign's **Product / landing URL**.
2. In the checkout, read the `ref` (from URL/cookie) and pass it to Stripe:
   ```js
   // when creating the Checkout Session server-side
   const session = await stripe.checkout.sessions.create({
     // ...line items, success_url, etc.
     client_reference_id: ref,                 // the ?ref=<code> from AmplyGo
     // or: metadata: { amplygo_ref: ref },
   });
   ```
   (Cookie the `ref` on landing so it survives until checkout — last-touch, ~30d.)
3. Add a Stripe webhook → `https://amplygo.com/api/webhooks/stripe`, event
   `checkout.session.completed`; put its signing secret in
   `STRIPE_WEBHOOK_SECRET` (Render env).

## Config
- `STRIPE_WEBHOOK_SECRET` — Stripe Dashboard → Developers → Webhooks → endpoint
  signing secret. Without it the webhook returns 503 (never open).

## Later
- Fluxo B (per-creator coupon codes) for companies without a custom checkout.
- Refunds/disputes (`charge.refunded`) to subtract sales.
- Replace the demo Business metrics with real ROAS once enough campaigns track.

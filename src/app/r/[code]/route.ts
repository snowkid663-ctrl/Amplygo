import { NextResponse } from "next/server";
import { getTrackingLinkByCode, getCampaignById, incrementTrackingClicks } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * Per-creator tracking link: amplygo.com/r/<code>. Records a click and
 * redirects to the campaign's landing URL with ?ref=<code> so the company's
 * checkout can pass it to Stripe (client_reference_id) for sale attribution.
 */
export async function GET(req: Request, { params }: { params: { code: string } }) {
  const home = new URL("/", req.url);
  const link = await getTrackingLinkByCode(params.code);
  if (!link) return NextResponse.redirect(home);

  incrementTrackingClicks(params.code).catch(() => {});

  const campaign = await getCampaignById(link.campaignId);
  if (!campaign?.landingUrl) return NextResponse.redirect(home);

  let dest: URL;
  try {
    dest = new URL(campaign.landingUrl);
  } catch {
    return NextResponse.redirect(home);
  }
  dest.searchParams.set("ref", params.code);
  return NextResponse.redirect(dest.toString(), 302);
}

import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getSession } from "@/lib/session";
import { getCompanyByUserId, getInviteById, getCampaignById } from "@/lib/data";

// Returns an SVG QR code for an invite link (company must own the campaign).
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const invite = await getInviteById(params.id);
  if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  const [company, campaign] = await Promise.all([getCompanyByUserId(session.user.id), getCampaignById(invite.campaignId)]);
  if (!company || !campaign || campaign.companyId !== company.id) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const origin = new URL(req.url).origin;
  const link = `${origin}/invite/${invite.token}`;
  const svg = await QRCode.toString(link, {
    type: "svg",
    margin: 1,
    color: { dark: "#0d1117", light: "#ffffff" },
  });

  return new NextResponse(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
  });
}

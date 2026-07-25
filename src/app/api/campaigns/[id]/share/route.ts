import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getCompanyByUserId, getCampaignById, ensureCampaignShareToken } from "@/lib/data";

// Enables (or returns) the public results share link for a campaign.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [company, campaign] = await Promise.all([getCompanyByUserId(session.user.id), getCampaignById(params.id)]);
  if (!company || !campaign || campaign.companyId !== company.id) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }
  const token = await ensureCampaignShareToken(campaign.id);
  return NextResponse.json({ token });
}

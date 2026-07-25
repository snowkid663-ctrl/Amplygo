import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getCampaignById, setCampaignStatus } from "@/lib/data";

// Admin reviews a PENDING campaign: approve -> ACTIVE, reject -> back to DRAFT.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const campaign = await getCampaignById(params.id);
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  if (campaign.status !== "PENDING") {
    return NextResponse.json({ error: "This campaign is not awaiting review." }, { status: 400 });
  }

  const { action } = (await req.json().catch(() => ({}))) as { action: "approve" | "reject" };
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  await setCampaignStatus(campaign.id, action === "approve" ? "ACTIVE" : "DRAFT");
  return NextResponse.json({ ok: true });
}

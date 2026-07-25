import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  getCompanyByUserId,
  getParticipationById,
  getCampaignById,
  setParticipationStatus,
} from "@/lib/data";

// Company approves/rejects a pending join request on its own campaign.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const participation = await getParticipationById(params.id);
  if (!participation) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  const [company, campaign] = await Promise.all([
    getCompanyByUserId(session.user.id),
    getCampaignById(participation.campaignId),
  ]);
  if (!company || !campaign || campaign.companyId !== company.id) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { action } = (await req.json().catch(() => ({}))) as { action: "approve" | "reject" };
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  await setParticipationStatus(participation.id, action === "approve" ? "APPROVED" : "REJECTED");
  return NextResponse.json({ ok: true });
}

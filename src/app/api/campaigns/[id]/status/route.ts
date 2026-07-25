import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getCampaignById, getCompanyByUserId, setCampaignStatus } from "@/lib/data";
import type { CampaignStatus } from "@/lib/types";

const ALLOWED: Record<CampaignStatus, CampaignStatus[]> = {
  DRAFT: ["PENDING"], // submit for admin review
  PENDING: ["DRAFT"], // withdraw from review
  ACTIVE: ["PAUSED", "ENDED"],
  PAUSED: ["ACTIVE", "ENDED"],
  ENDED: [],
};

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const company = await getCompanyByUserId(session.user.id);
  const campaign = await getCampaignById(params.id);
  if (!company || !campaign || campaign.companyId !== company.id) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const { status } = (await req.json().catch(() => ({}))) as { status: CampaignStatus };
  if (!status || !ALLOWED[campaign.status]?.includes(status)) {
    return NextResponse.json({ error: `Cannot move campaign from ${campaign.status} to ${status}` }, { status: 400 });
  }

  await setCampaignStatus(campaign.id, status);
  return NextResponse.json({ ok: true });
}

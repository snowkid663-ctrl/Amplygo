import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getCompanyByUserId, getInviteById, getCampaignById, revokeInvite } from "@/lib/data";

// Revoke an invite link (company must own the campaign it belongs to).
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
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
  await revokeInvite(invite.id);
  return NextResponse.json({ ok: true });
}

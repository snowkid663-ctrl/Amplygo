import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  getInviteByToken,
  getCampaignById,
  getCreatorByUserId,
  getParticipation,
  countParticipants,
  joinCampaign,
  incrementInviteUses,
} from "@/lib/data";

function inviteUsable(invite: { active: number; expiresAt: string | null; maxUses: number | null; uses: number }) {
  if (!invite.active) return "This invite link has been revoked.";
  if (invite.expiresAt && new Date(invite.expiresAt).getTime() < Date.now()) return "This invite link has expired.";
  if (invite.maxUses != null && invite.uses >= invite.maxUses) return "This invite link has reached its limit.";
  return null;
}

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (session.user.role !== "CREATOR") {
    return NextResponse.json({ error: "Only creator accounts can join campaigns." }, { status: 403 });
  }

  const invite = await getInviteByToken(params.token);
  if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  const invalid = inviteUsable(invite);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  const campaign = await getCampaignById(invite.campaignId);
  if (!campaign || campaign.status !== "ACTIVE") {
    return NextResponse.json({ error: "This campaign is not open right now." }, { status: 400 });
  }

  const creator = (await getCreatorByUserId(session.user.id))!;
  if (await getParticipation(campaign.id, creator.id)) {
    return NextResponse.json({ error: "You already joined this campaign.", already: true }, { status: 400 });
  }
  if (campaign.maxCreators && (await countParticipants(campaign.id)) >= campaign.maxCreators) {
    return NextResponse.json({ error: "This campaign has reached its creator limit." }, { status: 400 });
  }

  const { ref } = (await req.json().catch(() => ({}))) as { ref?: string };
  const status = invite.requireApproval ? "PENDING" : "APPROVED";
  await joinCampaign(campaign.id, creator.id, { inviteId: invite.id, ref: ref || null, status });
  await incrementInviteUses(invite.id);

  return NextResponse.json({ ok: true, status, campaignId: campaign.id });
}

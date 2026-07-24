import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  getCreatorByUserId,
  getCampaignById,
  getParticipation,
  joinCampaign,
  countParticipants,
  listSocialAccounts,
} from "@/lib/data";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "CREATOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const creator = (await getCreatorByUserId(session.user.id))!;
  const campaign = await getCampaignById(params.id);
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  if (campaign.status !== "ACTIVE") {
    return NextResponse.json({ error: "This campaign is not open to new creators right now." }, { status: 400 });
  }

  const { rulesAccepted } = (await req.json().catch(() => ({}))) as { rulesAccepted: boolean };
  if (!rulesAccepted) {
    return NextResponse.json({ error: "You must accept the campaign rules to join." }, { status: 400 });
  }

  const accounts = await listSocialAccounts(creator.id);
  const hasMatchingAccount = accounts.some((a) => a.platform === campaign.platform);
  if (!hasMatchingAccount) {
    return NextResponse.json(
      { error: `Connect your ${campaign.platform.replace("_", " ")} account in Settings before joining this campaign.` },
      { status: 400 }
    );
  }

  if (await getParticipation(campaign.id, creator.id)) {
    return NextResponse.json({ error: "You already joined this campaign." }, { status: 400 });
  }

  if (campaign.maxCreators && (await countParticipants(campaign.id)) >= campaign.maxCreators) {
    return NextResponse.json({ error: "This campaign has reached its creator limit." }, { status: 400 });
  }

  const participation = await joinCampaign(campaign.id, creator.id);
  return NextResponse.json({ participation });
}

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  getCreatorByUserId,
  getCampaignById,
  getParticipation,
  getSubmissionByParticipation,
  createSubmission,
  listSocialAccounts,
} from "@/lib/data";
import type { Platform } from "@/lib/types";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "CREATOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const creator = (await getCreatorByUserId(session.user.id))!;
  const campaign = await getCampaignById(params.id);
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  const participation = await getParticipation(campaign.id, creator.id);
  if (!participation) {
    return NextResponse.json({ error: "Join this campaign before submitting content." }, { status: 400 });
  }
  if (participation.status !== "APPROVED") {
    return NextResponse.json({ error: "Your request to join is still pending the company's approval." }, { status: 400 });
  }
  const accounts = await listSocialAccounts(creator.id);
  if (!accounts.some((a) => a.platform === campaign.platform)) {
    return NextResponse.json(
      { error: `Connect your ${campaign.platform.replace("_", " ")} account in Settings before submitting.` },
      { status: 400 }
    );
  }
  if (await getSubmissionByParticipation(participation.id)) {
    return NextResponse.json({ error: "You already submitted content for this campaign." }, { status: 400 });
  }

  const { videoUrl, platform, publishedAt } = (await req.json().catch(() => ({}))) as {
    videoUrl: string;
    platform: Platform;
    publishedAt: string;
  };
  if (!videoUrl?.trim()) return NextResponse.json({ error: "A video link is required." }, { status: 400 });
  if (!publishedAt) return NextResponse.json({ error: "Publish date is required." }, { status: 400 });

  const submission = await createSubmission({
    campaignId: campaign.id,
    creatorId: creator.id,
    participationId: participation.id,
    videoUrl: videoUrl.trim(),
    platform: platform || campaign.platform,
    publishedAt,
  });

  return NextResponse.json({ submission });
}

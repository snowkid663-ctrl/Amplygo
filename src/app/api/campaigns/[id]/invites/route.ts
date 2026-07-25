import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getCompanyByUserId, getCampaignById, createInvite } from "@/lib/data";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const company = await getCompanyByUserId(session.user.id);
  const campaign = await getCampaignById(params.id);
  if (!company || !campaign || campaign.companyId !== company.id) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    label?: string;
    requireApproval?: boolean;
    maxUses?: number | null;
    expiresDays?: number | null; // null/0 = never
    themeColor?: string | null;
    themeBgUrl?: string | null;
  };

  const maxUses = body.maxUses && Number(body.maxUses) > 0 ? Math.floor(Number(body.maxUses)) : null;
  const days = body.expiresDays && Number(body.expiresDays) > 0 ? Number(body.expiresDays) : null;
  const expiresAt = days ? new Date(Date.now() + days * 86400000).toISOString() : null;

  // Only accept a #rrggbb hex color and an uploaded /uploads/... path (or https URL).
  const themeColor = typeof body.themeColor === "string" && /^#[0-9a-fA-F]{6}$/.test(body.themeColor) ? body.themeColor : null;
  const bg = typeof body.themeBgUrl === "string" ? body.themeBgUrl.trim() : "";
  const themeBgUrl = /^\/uploads\/[\w.-]+$/.test(bg) || /^https:\/\/\S+$/.test(bg) ? bg : null;

  const invite = await createInvite(campaign.id, session.user.id, {
    label: body.label?.trim() || null,
    requireApproval: !!body.requireApproval,
    maxUses,
    expiresAt,
    themeColor,
    themeBgUrl,
  });

  return NextResponse.json({ invite });
}

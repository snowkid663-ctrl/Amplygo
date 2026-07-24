import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getCreatorByUserId, connectSocialAccount, disconnectSocialAccount, listSocialAccounts } from "@/lib/data";
import type { Platform } from "@/lib/types";

// MOCK/PLACEHOLDER: no real OAuth. The creator just types the handle they
// post from. Phase 2: real OAuth + periodic API reads (see README).
export async function GET() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "CREATOR") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const creator = (await getCreatorByUserId(session.user.id))!;
  return NextResponse.json({ accounts: await listSocialAccounts(creator.id) });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "CREATOR") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const creator = (await getCreatorByUserId(session.user.id))!;

  const { platform, handle } = (await req.json().catch(() => ({}))) as { platform: Platform; handle: string };
  if (!platform || !handle?.trim()) return NextResponse.json({ error: "Platform and handle are required" }, { status: 400 });

  await connectSocialAccount(creator.id, platform, handle.trim());
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "CREATOR") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const creator = (await getCreatorByUserId(session.user.id))!;

  const { platform } = (await req.json().catch(() => ({}))) as { platform: Platform };
  if (!platform) return NextResponse.json({ error: "Platform is required" }, { status: 400 });

  await disconnectSocialAccount(creator.id, platform);
  return NextResponse.json({ ok: true });
}

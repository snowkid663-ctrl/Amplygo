import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  getCompanyByUserId,
  getCreatorByUserId,
  updateCompanyImage,
  updateCreatorImage,
  updateCompanyBannerPos,
  updateCreatorBannerPos,
  saveMedia,
} from "@/lib/data";

const ALLOWED_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

type Kind = "avatar" | "banner";

function columnFor(role: string, kind: Kind): "logoUrl" | "bannerUrl" | "avatarUrl" {
  if (role === "COMPANY") return kind === "avatar" ? "logoUrl" : "bannerUrl";
  return kind === "avatar" ? "avatarUrl" : "bannerUrl";
}

function persist(role: string, ownerId: string, kind: Kind, url: string | null) {
  const field = columnFor(role, kind);
  if (role === "COMPANY") return updateCompanyImage(ownerId, field as "logoUrl" | "bannerUrl", url);
  return updateCreatorImage(ownerId, field as "avatarUrl" | "bannerUrl", url);
}

async function resolveOwner(role: string, userId: string) {
  if (role === "COMPANY") {
    const c = await getCompanyByUserId(userId);
    return c?.id ?? null;
  }
  if (role === "CREATOR") {
    const c = await getCreatorByUserId(userId);
    return c?.id ?? null;
  }
  return null; // admins have no profile media
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const role = session.user.role;
  if (role !== "COMPANY" && role !== "CREATOR") {
    return NextResponse.json({ error: "Profile images are only available for companies and creators" }, { status: 400 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid upload" }, { status: 400 });

  const file = form.get("file");
  const kind = String(form.get("kind") ?? "");
  if (kind !== "avatar" && kind !== "banner") {
    return NextResponse.json({ error: "kind must be 'avatar' or 'banner'" }, { status: 400 });
  }
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (!ALLOWED_EXT[file.type]) return NextResponse.json({ error: "Unsupported image type (use PNG, JPEG, WebP or GIF)" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image too large (max 4 MB)" }, { status: 400 });

  const ownerId = await resolveOwner(role, session.user.id);
  if (!ownerId) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const id = await saveMedia(file.type, bytes);
  const url = `/api/media/${id}`;

  await persist(role, ownerId, kind as Kind, url);
  return NextResponse.json({ ok: true, url });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const role = session.user.role;
  if (role !== "COMPANY" && role !== "CREATOR") {
    return NextResponse.json({ error: "Profile images are only available for companies and creators" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const posRaw = Number(body?.bannerPos);
  if (!Number.isFinite(posRaw)) return NextResponse.json({ error: "bannerPos must be a number" }, { status: 400 });
  const pos = Math.max(0, Math.min(100, Math.round(posRaw)));

  const ownerId = await resolveOwner(role, session.user.id);
  if (!ownerId) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  if (role === "COMPANY") await updateCompanyBannerPos(ownerId, pos);
  else await updateCreatorBannerPos(ownerId, pos);
  return NextResponse.json({ ok: true, bannerPos: pos });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const role = session.user.role;
  if (role !== "COMPANY" && role !== "CREATOR") {
    return NextResponse.json({ error: "Profile images are only available for companies and creators" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const kind = String(body?.kind ?? "");
  if (kind !== "avatar" && kind !== "banner") {
    return NextResponse.json({ error: "kind must be 'avatar' or 'banner'" }, { status: 400 });
  }

  const ownerId = await resolveOwner(role, session.user.id);
  if (!ownerId) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  // We only unset the reference; leftover files are harmless for this MVP.
  await persist(role, ownerId, kind as Kind, null);
  return NextResponse.json({ ok: true });
}

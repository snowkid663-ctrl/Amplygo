import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { saveMedia } from "@/lib/data";

const ALLOWED_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/** Generic authenticated image upload → returns a public /uploads/... path. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid upload" }, { status: 400 });

  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (!ALLOWED_EXT[file.type]) return NextResponse.json({ error: "Unsupported image type (use PNG, JPEG, WebP or GIF)" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image too large (max 5 MB)" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const id = await saveMedia(file.type, bytes);
  return NextResponse.json({ ok: true, url: `/api/media/${id}` });
}

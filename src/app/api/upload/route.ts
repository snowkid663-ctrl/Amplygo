import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { saveMedia } from "@/lib/data";

const ALLOWED: Record<string, true> = {
  "image/png": true,
  "image/jpeg": true,
  "image/webp": true,
  "image/gif": true,
  "video/mp4": true,
  "video/webm": true,
  "video/quicktime": true,
  "application/pdf": true,
  "application/msword": true,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
  "application/vnd.ms-excel": true,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": true,
  "text/plain": true,
  "text/csv": true,
  "application/zip": true,
};
const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

/** Generic authenticated upload (images, video, docs) → returns /api/media/<id>. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid upload" }, { status: 400 });

  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (!ALLOWED[file.type]) return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const id = await saveMedia(file.type, bytes);
  return NextResponse.json({ ok: true, url: `/api/media/${id}` });
}

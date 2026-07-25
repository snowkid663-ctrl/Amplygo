import { NextResponse } from "next/server";
import { getMedia } from "@/lib/data";

// Serves an uploaded image stored in Postgres. Immutable content (UUID name),
// so it can be cached hard.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const media = await getMedia(params.id);
  if (!media) return new NextResponse("Not found", { status: 404 });
  const bytes = media.data instanceof Uint8Array ? media.data : new Uint8Array(media.data as any);
  return new NextResponse(bytes as any, {
    status: 200,
    headers: {
      "Content-Type": media.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

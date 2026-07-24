import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserById, setUserSuspended } from "@/lib/data";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await getUserById(params.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { suspended } = (await req.json().catch(() => ({}))) as { suspended: boolean };
  await setUserSuspended(user.id, !!suspended);
  return NextResponse.json({ ok: true });
}

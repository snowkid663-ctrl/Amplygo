import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getCompanyById, setCompanyStatus } from "@/lib/data";
import type { CompanyStatus } from "@/lib/types";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const company = getCompanyById(params.id);
  if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  const { status } = (await req.json().catch(() => ({}))) as { status: CompanyStatus };
  if (!["APPROVED", "REJECTED", "SUSPENDED", "PENDING"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  setCompanyStatus(company.id, status);
  return NextResponse.json({ ok: true });
}

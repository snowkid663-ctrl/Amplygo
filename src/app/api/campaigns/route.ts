import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  getCompanyByUserId,
  createCampaign,
  listCampaignsByCompany,
} from "@/lib/data";
import type { Platform, CampaignStatus } from "@/lib/types";

export async function GET() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const company = await getCompanyByUserId(session.user.id);
  if (!company) return NextResponse.json({ error: "Company profile not found" }, { status: 404 });
  return NextResponse.json({ campaigns: await listCampaignsByCompany(company.id) });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const company = await getCompanyByUserId(session.user.id);
  if (!company) return NextResponse.json({ error: "Company profile not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const {
    name,
    description,
    brand,
    category,
    platform,
    language,
    country,
    cpm,
    budget,
    maxCreators,
    endDate,
    rulesChecklist,
    rulesExtra,
    publish,
  } = body as {
    name: string;
    description: string;
    brand: string;
    category: string;
    platform: Platform;
    language: string;
    country: string;
    cpm: number;
    budget: number;
    maxCreators: number | null;
    endDate: string | null;
    rulesChecklist: string[];
    rulesExtra: string | null;
    publish: boolean;
  };

  if (!name?.trim() || !description?.trim() || !brand?.trim() || !category || !platform) {
    return NextResponse.json({ error: "Please fill in all required fields" }, { status: 400 });
  }
  const cpmCents = Math.round(Number(cpm) * 100);
  const budgetCents = Math.round(Number(budget) * 100);
  if (!cpmCents || cpmCents <= 0) return NextResponse.json({ error: "CPM must be greater than 0" }, { status: 400 });
  if (!budgetCents || budgetCents <= 0) return NextResponse.json({ error: "Budget must be greater than 0" }, { status: 400 });

  const status: CampaignStatus = publish ? "ACTIVE" : "DRAFT";

  if (publish) {
    if (company.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Your company must be approved by an admin before publishing campaigns." },
        { status: 403 }
      );
    }
    if (company.balanceCents < budgetCents) {
      return NextResponse.json(
        { error: "Insufficient balance. Add funds before publishing a campaign with this budget." },
        { status: 400 }
      );
    }
  }

  const campaign = await createCampaign({
    companyId: company.id,
    name: name.trim(),
    description: description.trim(),
    brand: brand.trim(),
    category,
    platform,
    language: language || "English",
    country: country || "Worldwide",
    cpmCents,
    budgetCents,
    maxCreators: maxCreators ? Number(maxCreators) : null,
    endDate: endDate || null,
    rulesChecklist: rulesChecklist ?? [],
    rulesExtra: rulesExtra?.trim() || null,
    status,
  });

  return NextResponse.json({ campaign });
}

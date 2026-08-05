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
    platforms,
    languages,
    countries,
    cpm,
    budget,
    maxCreators,
    endDate,
    rulesChecklist,
    rulesExtra,
    productMedia,
    attachments,
    landingUrl,
    publish,
  } = body as {
    name: string;
    description: string;
    brand: string;
    category: string;
    platforms: Platform[];
    languages: string[];
    countries: string[];
    cpm: number;
    budget: number;
    maxCreators: number | null;
    endDate: string | null;
    rulesChecklist: string[];
    rulesExtra: string | null;
    productMedia: { url: string; type: string }[];
    attachments: { url: string; name: string }[];
    landingUrl: string | null;
    publish: boolean;
  };

  const cleanLandingUrl = typeof landingUrl === "string" && /^https?:\/\/\S+$/.test(landingUrl.trim()) ? landingUrl.trim() : null;

  const VALID_PLATFORMS: Platform[] = ["TIKTOK", "YOUTUBE_SHORTS", "INSTAGRAM_REELS"];
  const platformList = (Array.isArray(platforms) ? platforms : []).filter((p) => VALID_PLATFORMS.includes(p));
  const primaryPlatform = platformList[0];

  if (!name?.trim() || !description?.trim() || !brand?.trim() || !category || !primaryPlatform) {
    return NextResponse.json({ error: "Please fill in all required fields (and pick at least one platform)" }, { status: 400 });
  }

  const langList = (Array.isArray(languages) ? languages : []).map((s) => String(s).trim()).filter(Boolean);
  const countryList = (Array.isArray(countries) ? countries : []).map((s) => String(s).trim()).filter(Boolean);

  // Only accept media/attachment URLs we produced (/api/media/<id>) or https.
  const okUrl = (u: unknown) => typeof u === "string" && (/^\/api\/media\/[\w-]+$/.test(u) || /^https:\/\/\S+$/.test(u));
  const cleanMedia = (Array.isArray(productMedia) ? productMedia : [])
    .filter((m) => m && okUrl(m.url) && ["image", "video", "gif"].includes(m.type))
    .slice(0, 12);
  const cleanAttachments = (Array.isArray(attachments) ? attachments : [])
    .filter((a) => a && okUrl(a.url) && typeof a.name === "string")
    .map((a) => ({ url: a.url, name: String(a.name).slice(0, 120) }))
    .slice(0, 12);
  const cpmCents = Math.round(Number(cpm) * 100);
  const budgetCents = Math.round(Number(budget) * 100);
  if (!cpmCents || cpmCents <= 0) return NextResponse.json({ error: "CPM must be greater than 0" }, { status: 400 });
  if (!budgetCents || budgetCents <= 0) return NextResponse.json({ error: "Budget must be greater than 0" }, { status: 400 });

  // Publishing submits the campaign for admin review (PENDING). Only after an
  // admin approves does it go ACTIVE and become visible to creators.
  const status: CampaignStatus = publish ? "PENDING" : "DRAFT";

  if (publish && company.balanceCents < budgetCents) {
    return NextResponse.json(
      { error: "Insufficient balance. Add funds before submitting a campaign with this budget." },
      { status: 400 }
    );
  }

  const campaign = await createCampaign({
    companyId: company.id,
    name: name.trim(),
    description: description.trim(),
    brand: brand.trim(),
    category,
    platform: primaryPlatform,
    platforms: platformList.join(","),
    language: langList.length ? langList.join(", ") : "English",
    country: countryList.length ? countryList.join(", ") : "Worldwide",
    cpmCents,
    budgetCents,
    maxCreators: maxCreators ? Number(maxCreators) : null,
    endDate: endDate || null,
    rulesChecklist: rulesChecklist ?? [],
    rulesExtra: rulesExtra?.trim() || null,
    productMedia: cleanMedia.length ? JSON.stringify(cleanMedia) : null,
    attachments: cleanAttachments.length ? JSON.stringify(cleanAttachments) : null,
    landingUrl: cleanLandingUrl,
    status,
  });

  return NextResponse.json({ campaign });
}

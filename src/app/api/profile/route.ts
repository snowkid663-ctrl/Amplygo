import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import type { Currency } from "@/lib/types";
import { CURRENCIES } from "@/lib/money";
import {
  getUserById,
  updateUserName,
  updateUserPassword,
  getCompanyByUserId,
  updateCompanyProfile,
  getCreatorByUserId,
  updateCreatorProfile,
} from "@/lib/data";

function normalizeCurrency(value: unknown, fallback: Currency): Currency {
  return CURRENCIES.includes(value as Currency) ? (value as Currency) : fallback;
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const user = getUserById(session.user.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // ---- Password change (handled on its own; verifies the current password) ----
  if (body.currentPassword !== undefined || body.newPassword !== undefined) {
    const { currentPassword, newPassword } = body as { currentPassword?: string; newPassword?: string };
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new password are both required" }, { status: 400 });
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
    }
    updateUserPassword(user.id, await bcrypt.hash(newPassword, 10));
    return NextResponse.json({ ok: true });
  }

  // ---- Profile update (fields depend on the role) ----
  if (user.role === "COMPANY") {
    const company = getCompanyByUserId(user.id);
    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });
    const companyName = String(body.companyName ?? "").trim();
    if (!companyName) return NextResponse.json({ error: "Company name is required" }, { status: 400 });
    updateCompanyProfile(company.id, {
      companyName,
      website: String(body.website ?? "").trim() || null,
      about: String(body.about ?? "").trim() || null,
      currency: normalizeCurrency(body.currency, company.currency),
    });
    return NextResponse.json({ ok: true });
  }

  if (user.role === "CREATOR") {
    const creator = getCreatorByUserId(user.id);
    if (!creator) return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    const displayName = String(body.displayName ?? "").trim();
    if (!displayName) return NextResponse.json({ error: "Display name is required" }, { status: 400 });
    updateCreatorProfile(creator.id, {
      displayName,
      bio: String(body.bio ?? "").trim() || null,
      displayCurrency: normalizeCurrency(body.displayCurrency, creator.displayCurrency),
    });
    // Keep the user's name in sync with the public display name.
    updateUserName(user.id, displayName);
    return NextResponse.json({ ok: true });
  }

  // ADMIN — only has a name on the user record.
  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  updateUserName(user.id, name);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { getSession } from "@/lib/session";
import { getUserByEmail, createUser, createCompany, createCreator } from "@/lib/data";
import type { Role } from "@/lib/types";

/**
 * Completes account creation for a user who authenticated via an OAuth
 * provider (Google) but had no AmplyGo account yet, so they pick their
 * account type here. Email/name come from the authenticated session.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // If an account already exists for this email, there is nothing to do.
  if (await getUserByEmail(session.user.email.toLowerCase())) {
    return NextResponse.json({ ok: true, alreadyExists: true });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const role = String(body.role ?? "").toUpperCase() as Role;
  if (role !== "COMPANY" && role !== "CREATOR") {
    return NextResponse.json({ error: "Choose Company or Creator" }, { status: 400 });
  }
  const displayName = String(body.name ?? session.user.name ?? "").trim();
  if (!displayName) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (role === "COMPANY" && !String(body.companyName ?? "").trim()) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  // OAuth users have no password; store a random unusable hash so the
  // credentials provider can never match, while satisfying the schema.
  const passwordHash = await bcrypt.hash(randomUUID(), 10);
  const user = await createUser({
    email: session.user.email.toLowerCase().trim(),
    passwordHash,
    role,
    name: displayName,
  });

  if (role === "COMPANY") {
    await createCompany({ userId: user.id, companyName: String(body.companyName).trim() });
  } else {
    await createCreator({ userId: user.id, displayName });
  }

  return NextResponse.json({ ok: true });
}

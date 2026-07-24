import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, getUserByEmail, createCompany, createCreator } from "@/lib/data";
import type { Role } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const { role, email, password, name, companyName } = body as {
    role: Role;
    email: string;
    password: string;
    name: string;
    companyName?: string;
  };

  if (!role || (role !== "COMPANY" && role !== "CREATOR")) {
    return NextResponse.json({ error: "Role must be COMPANY or CREATOR" }, { status: 400 });
  }
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (role === "COMPANY" && !companyName?.trim()) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (getUserByEmail(normalizedEmail)) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = createUser({ email: normalizedEmail, passwordHash, role, name: name.trim() });

  if (role === "COMPANY") {
    // Empresas comecam como PENDING - precisam de aprovacao manual do admin
    // antes de poder gastar (Product Spec: "Regras do MVP > Empresas").
    createCompany({ userId: user.id, companyName: companyName!.trim() });
  } else {
    createCreator({ userId: user.id, displayName: name.trim() });
  }

  return NextResponse.json({ ok: true });
}

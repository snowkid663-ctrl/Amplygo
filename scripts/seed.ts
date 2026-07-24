import bcrypt from "bcryptjs";
import { ensureSchema, sql } from "../src/lib/db";
import { getUserByEmail, createUser, createCompany, createCreator, setCompanyStatus } from "../src/lib/data";

async function main() {
  await ensureSchema();
  const passwordHash = await bcrypt.hash("password123", 10);

  // Admin credentials are configurable via env for production (set a strong
  // ADMIN_PASSWORD in Render). Falls back to the demo login locally.
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@amplygo.com").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "password123";
  if (!(await getUserByEmail(adminEmail))) {
    await createUser({ email: adminEmail, passwordHash: await bcrypt.hash(adminPassword, 10), role: "ADMIN", name: "AmplyGo Admin" });
    console.log(`Created admin ${adminEmail}`);
  }

  if (!(await getUserByEmail("acme@amplygo.com"))) {
    const user = await createUser({ email: "acme@amplygo.com", passwordHash, role: "COMPANY", name: "Alex (Acme)" });
    const company = await createCompany({ userId: user.id, companyName: "Acme Inc." });
    await setCompanyStatus(company.id, "APPROVED");
    console.log("Created acme@amplygo.com / password123 (approved company, $0 balance)");
  }

  if (!(await getUserByEmail("jane@amplygo.com"))) {
    const user = await createUser({ email: "jane@amplygo.com", passwordHash, role: "CREATOR", name: "Jane Doe" });
    await createCreator({ userId: user.id, displayName: "Jane Doe" });
    console.log("Created jane@amplygo.com / password123 (creator)");
  }

  console.log("Seed complete.");
  await sql().end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

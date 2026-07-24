import bcrypt from "bcryptjs";
import { getUserByEmail, createUser, createCompany, createCreator, setCompanyStatus, getCompanyByUserId } from "../src/lib/data";

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  if (!getUserByEmail("admin@amplygo.com")) {
    createUser({ email: "admin@amplygo.com", passwordHash, role: "ADMIN", name: "AmplyGo Admin" });
    console.log("Created admin@amplygo.com / password123");
  }

  if (!getUserByEmail("acme@amplygo.com")) {
    const user = createUser({ email: "acme@amplygo.com", passwordHash, role: "COMPANY", name: "Alex (Acme)" });
    const company = createCompany({ userId: user.id, companyName: "Acme Inc." });
    setCompanyStatus(company.id, "APPROVED");
    console.log("Created acme@amplygo.com / password123 (approved company, $0 balance)");
  }

  if (!getUserByEmail("jane@amplygo.com")) {
    const user = createUser({ email: "jane@amplygo.com", passwordHash, role: "CREATOR", name: "Jane Doe" });
    createCreator({ userId: user.id, displayName: "Jane Doe" });
    console.log("Created jane@amplygo.com / password123 (creator)");
  }

  console.log("Seed complete.");
}

main();

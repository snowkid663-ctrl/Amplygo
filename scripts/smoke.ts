import bcrypt from "bcryptjs";
import * as data from "../src/lib/data";
import { ensureSchema, sql } from "../src/lib/db";
import { formatCents } from "../src/lib/money";

function assert(cond: any, msg: string) {
  if (!cond) throw new Error("FAILED: " + msg);
  console.log("OK: " + msg);
}

async function main() {
  await ensureSchema();
  // Make the run repeatable — clear any leftover smoke fixtures (cascades).
  await sql().unsafe("DELETE FROM users WHERE email LIKE 'smoke-%'");

  const pw = await bcrypt.hash("password123", 10);

  const companyUser = await data.createUser({ email: "smoke-company@test.com", passwordHash: pw, role: "COMPANY", name: "Owner" });
  const company = await data.createCompany({ userId: companyUser.id, companyName: "Smoke Co" });
  assert(company.status === "PENDING", "new company starts PENDING");
  assert(company.balanceCents === 0, "new company starts with $0 balance");

  await data.setCompanyStatus(company.id, "APPROVED");
  const approved = (await data.getCompanyById(company.id))!;
  assert(approved.status === "APPROVED", "admin can approve company");

  await data.addCompanyBalance(company.id, 100000, "Manual deposit (mock)"); // $1000
  const funded = (await data.getCompanyById(company.id))!;
  assert(funded.balanceCents === 100000, "balance reflects deposit ($1000.00)");

  const campaign = await data.createCampaign({
    companyId: company.id,
    name: "Smoke Test Campaign",
    description: "desc",
    brand: "Smoke Co",
    category: "SaaS / Tech",
    platform: "TIKTOK",
    language: "English",
    country: "Worldwide",
    cpmCents: 200,
    budgetCents: 100000,
    maxCreators: 5,
    endDate: null,
    rulesChecklist: ["Show the product for at least 5 seconds"],
    rulesExtra: null,
    status: "ACTIVE",
  });
  assert(campaign.status === "ACTIVE", "campaign published as ACTIVE");

  const creatorUser = await data.createUser({ email: "smoke-creator@test.com", passwordHash: pw, role: "CREATOR", name: "Jane" });
  const creator = await data.createCreator({ userId: creatorUser.id, displayName: "Jane" });
  assert((await data.listSocialAccounts(creator.id)).length === 0, "creator starts with no connected accounts");
  await data.connectSocialAccount(creator.id, "TIKTOK", "@janesmoke");
  assert((await data.listSocialAccounts(creator.id)).some((a) => a.platform === "TIKTOK"), "creator connected TikTok account");

  const participation = await data.joinCampaign(campaign.id, creator.id);
  assert((await data.getParticipation(campaign.id, creator.id))?.id === participation.id, "creator joined campaign");
  let threw = false;
  try {
    await data.joinCampaign(campaign.id, creator.id); // should violate UNIQUE(campaignId, creatorId)
  } catch {
    threw = true;
  }
  assert(threw, "joining the same campaign twice is rejected by the DB constraint");

  const submission = await data.createSubmission({
    campaignId: campaign.id,
    creatorId: creator.id,
    participationId: participation.id,
    videoUrl: "https://tiktok.com/@janesmoke/video/123",
    platform: "TIKTOK",
    publishedAt: new Date().toISOString(),
  });
  assert(submission.status === "PENDING", "submission starts PENDING");

  // 50,000 views @ CPM $2.00 => gross $100.00, creator net $90.00, fee $10.00
  const approvedSubmission = await data.approveSubmission(submission.id, 50000, "Looks good");
  assert(approvedSubmission.status === "APPROVED", "submission approved");
  assert(approvedSubmission.grossCents === 10000, `gross cost is $100.00 (got ${formatCents(approvedSubmission.grossCents)})`);
  assert(approvedSubmission.creatorNetCents === 9000, `creator net is $90.00 (got ${formatCents(approvedSubmission.creatorNetCents)})`);
  assert(approvedSubmission.platformFeeCents === 1000, `platform fee is $10.00 (got ${formatCents(approvedSubmission.platformFeeCents)})`);

  const companyAfter = (await data.getCompanyById(company.id))!;
  assert(companyAfter.balanceCents === 100000 - 10000, `company balance decreased by gross cost (now ${formatCents(companyAfter.balanceCents)})`);
  const campaignAfter = (await data.getCampaignById(campaign.id))!;
  assert(campaignAfter.spentCents === 10000, `campaign spent updated (now ${formatCents(campaignAfter.spentCents)})`);

  const available = await data.availableBalance(creator.id);
  assert(available === 9000, `creator available balance is $90.00 (got ${formatCents(available)})`);

  const payout = await data.requestPayout(creator.id, 2000, "PIX"); // $20 minimum
  assert(payout.status === "PENDING", "payout starts PENDING");
  assert((await data.availableBalance(creator.id)) === 9000 - 2000, "available balance drops after requesting payout");

  const stats = await data.platformStats();
  assert(stats.platformFeeCents >= 1000, "platform stats include the new fee revenue");
  assert(stats.gmvCents >= 10000, "platform stats include the new GMV");

  console.log("\nAll smoke checks passed.");
  await sql().end();
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});

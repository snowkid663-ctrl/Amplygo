import bcrypt from "bcryptjs";
import * as data from "../src/lib/data";
import { formatCents } from "../src/lib/money";

function assert(cond: any, msg: string) {
  if (!cond) throw new Error("FAILED: " + msg);
  console.log("OK: " + msg);
}

async function main() {
  const pw = await bcrypt.hash("password123", 10);

  // 1. Register company (starts PENDING)
  const companyUser = data.createUser({ email: "smoke-company@test.com", passwordHash: pw, role: "COMPANY", name: "Owner" });
  const company = data.createCompany({ userId: companyUser.id, companyName: "Smoke Co" });
  assert(company.status === "PENDING", "new company starts PENDING");

  // 2. Company tries to publish without approval -> business rule enforced at API layer,
  // but let's directly validate the data layer building blocks here.
  assert(company.balanceCents === 0, "new company starts with $0 balance");

  // 3. Admin approves company
  data.setCompanyStatus(company.id, "APPROVED");
  const approved = data.getCompanyById(company.id)!;
  assert(approved.status === "APPROVED", "admin can approve company");

  // 4. Company adds balance
  data.addCompanyBalance(company.id, 100000, "Manual deposit (mock)"); // $1000
  const funded = data.getCompanyById(company.id)!;
  assert(funded.balanceCents === 100000, "balance reflects deposit ($1000.00)");

  // 5. Company creates + publishes a campaign: CPM $2.00, budget $1000
  const campaign = data.createCampaign({
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

  // 6. Register creator + connect matching social account
  const creatorUser = data.createUser({ email: "smoke-creator@test.com", passwordHash: pw, role: "CREATOR", name: "Jane" });
  const creator = data.createCreator({ userId: creatorUser.id, displayName: "Jane" });
  assert(data.listSocialAccounts(creator.id).length === 0, "creator starts with no connected accounts");
  data.connectSocialAccount(creator.id, "TIKTOK", "@janesmoke");
  assert(data.listSocialAccounts(creator.id).some((a) => a.platform === "TIKTOK"), "creator connected TikTok account");

  // 7. Creator joins campaign (one participation per campaign, enforced by UNIQUE constraint)
  const participation = data.joinCampaign(campaign.id, creator.id);
  assert(data.getParticipation(campaign.id, creator.id)?.id === participation.id, "creator joined campaign");
  let threw = false;
  try {
    data.joinCampaign(campaign.id, creator.id); // should violate UNIQUE(campaignId, creatorId)
  } catch {
    threw = true;
  }
  assert(threw, "joining the same campaign twice is rejected by the DB constraint");

  // 8. Creator submits content
  const submission = data.createSubmission({
    campaignId: campaign.id,
    creatorId: creator.id,
    participationId: participation.id,
    videoUrl: "https://tiktok.com/@janesmoke/video/123",
    platform: "TIKTOK",
    publishedAt: new Date().toISOString(),
  });
  assert(submission.status === "PENDING", "submission starts PENDING");

  // 9. Admin approves submission with 50,000 views -> CPM $2.00 => gross $100.00,
  //    creator net (90%) = $90.00, platform fee (10%) = $10.00
  const approvedSubmission = data.approveSubmission(submission.id, 50000, "Looks good");
  assert(approvedSubmission.status === "APPROVED", "submission approved");
  assert(approvedSubmission.grossCents === 10000, `gross cost is $100.00 (got ${formatCents(approvedSubmission.grossCents)})`);
  assert(approvedSubmission.creatorNetCents === 9000, `creator net is $90.00 (got ${formatCents(approvedSubmission.creatorNetCents)})`);
  assert(approvedSubmission.platformFeeCents === 1000, `platform fee is $10.00 (got ${formatCents(approvedSubmission.platformFeeCents)})`);

  // 10. Ledger updates: company balance decreases, campaign spend increases
  const companyAfter = data.getCompanyById(company.id)!;
  assert(companyAfter.balanceCents === 100000 - 10000, `company balance decreased by gross cost (now ${formatCents(companyAfter.balanceCents)})`);
  const campaignAfter = data.getCampaignById(campaign.id)!;
  assert(campaignAfter.spentCents === 10000, `campaign spent updated (now ${formatCents(campaignAfter.spentCents)})`);

  // 11. Creator available balance reflects net earnings
  const available = data.availableBalance(creator.id);
  assert(available === 9000, `creator available balance is $90.00 (got ${formatCents(available)})`);

  // 12. Creator requests a payout under the available balance
  const payout = data.requestPayout(creator.id, 2000, "PIX"); // $20 minimum
  assert(payout.status === "PENDING", "payout starts PENDING");
  assert(data.availableBalance(creator.id) === 9000 - 2000, "available balance drops after requesting payout");

  // 13. Platform aggregate stats pick up the fee
  const stats = data.platformStats();
  assert(stats.platformFeeCents >= 1000, "platform stats include the new fee revenue");
  assert(stats.gmvCents >= 10000, "platform stats include the new GMV");

  console.log("\nAll smoke checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

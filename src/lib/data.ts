import { db, run, get, all, newId, nowIso } from "./db";
import { splitPayment, convertCents } from "./money";
import type {
  UserRow,
  CompanyRow,
  CreatorRow,
  SocialAccountRow,
  CampaignRow,
  ParticipationRow,
  SubmissionRow,
  PayoutRow,
  Role,
  CompanyStatus,
  Platform,
  CampaignStatus,
  SubmissionStatus,
  PayoutMethod,
  Currency,
} from "./types";

// ---------- Users ----------

export function createUser(input: { email: string; passwordHash: string; role: Role; name: string }): UserRow {
  const id = newId();
  run(
    `INSERT INTO users (id, email, passwordHash, role, name) VALUES ($id, $email, $passwordHash, $role, $name)`,
    { id, ...input }
  );
  return get<UserRow>(`SELECT * FROM users WHERE id = $id`, { id })!;
}

export function getUserByEmail(email: string): UserRow | undefined {
  return get<UserRow>(`SELECT * FROM users WHERE email = $email`, { email });
}

export function getUserById(id: string): UserRow | undefined {
  return get<UserRow>(`SELECT * FROM users WHERE id = $id`, { id });
}

export function listUsers(): UserRow[] {
  return all<UserRow>(`SELECT * FROM users ORDER BY createdAt DESC`);
}

export function setUserSuspended(id: string, suspended: boolean) {
  run(`UPDATE users SET suspended = $suspended WHERE id = $id`, { id, suspended: suspended ? 1 : 0 });
}

export function updateUserName(id: string, name: string) {
  run(`UPDATE users SET name = $name WHERE id = $id`, { id, name });
}

export function updateUserPassword(id: string, passwordHash: string) {
  run(`UPDATE users SET passwordHash = $passwordHash WHERE id = $id`, { id, passwordHash });
}

// ---------- Companies ----------

export function createCompany(input: { userId: string; companyName: string }): CompanyRow {
  const id = newId();
  run(`INSERT INTO companies (id, userId, companyName) VALUES ($id, $userId, $companyName)`, {
    id,
    ...input,
  });
  return get<CompanyRow>(`SELECT * FROM companies WHERE id = $id`, { id })!;
}

export function getCompanyByUserId(userId: string): CompanyRow | undefined {
  return get<CompanyRow>(`SELECT * FROM companies WHERE userId = $userId`, { userId });
}

export function getCompanyById(id: string): CompanyRow | undefined {
  return get<CompanyRow>(`SELECT * FROM companies WHERE id = $id`, { id });
}

export function listCompanies(status?: CompanyStatus): CompanyRow[] {
  if (status) return all<CompanyRow>(`SELECT * FROM companies WHERE status = $status ORDER BY createdAt DESC`, { status });
  return all<CompanyRow>(`SELECT * FROM companies ORDER BY createdAt DESC`);
}

export function setCompanyStatus(id: string, status: CompanyStatus) {
  run(`UPDATE companies SET status = $status WHERE id = $id`, { id, status });
}

export function updateCompanyProfile(
  id: string,
  input: { companyName: string; website: string | null; about: string | null; currency: Currency }
) {
  run(
    `UPDATE companies SET companyName = $companyName, website = $website, about = $about, currency = $currency WHERE id = $id`,
    { id, ...input }
  );
}

export function updateCompanyImage(id: string, field: "logoUrl" | "bannerUrl", url: string | null) {
  // `field` is never user input - it is mapped server-side from a fixed set.
  run(`UPDATE companies SET ${field} = $url WHERE id = $id`, { id, url });
}

export function addCompanyBalance(companyId: string, amountCents: number, reason: string) {
  run(`UPDATE companies SET balanceCents = balanceCents + $amountCents WHERE id = $companyId`, {
    companyId,
    amountCents,
  });
  run(`INSERT INTO balance_transactions (id, companyId, amountCents, reason) VALUES ($id, $companyId, $amountCents, $reason)`, {
    id: newId(),
    companyId,
    amountCents,
    reason,
  });
}

export function listBalanceTransactions(companyId: string) {
  return all(`SELECT * FROM balance_transactions WHERE companyId = $companyId ORDER BY createdAt DESC`, { companyId });
}

// ---------- Creators ----------

export function createCreator(input: { userId: string; displayName: string }): CreatorRow {
  const id = newId();
  run(`INSERT INTO creators (id, userId, displayName) VALUES ($id, $userId, $displayName)`, {
    id,
    ...input,
  });
  return get<CreatorRow>(`SELECT * FROM creators WHERE id = $id`, { id })!;
}

export function getCreatorByUserId(userId: string): CreatorRow | undefined {
  return get<CreatorRow>(`SELECT * FROM creators WHERE userId = $userId`, { userId });
}

export function updateCreatorProfile(
  id: string,
  input: { displayName: string; bio: string | null; displayCurrency: Currency }
) {
  run(`UPDATE creators SET displayName = $displayName, bio = $bio, displayCurrency = $displayCurrency WHERE id = $id`, {
    id,
    ...input,
  });
}

export function updateCreatorImage(id: string, field: "avatarUrl" | "bannerUrl", url: string | null) {
  // `field` is never user input - it is mapped server-side from a fixed set.
  run(`UPDATE creators SET ${field} = $url WHERE id = $id`, { id, url });
}

export function getCreatorById(id: string): CreatorRow | undefined {
  return get<CreatorRow>(`SELECT * FROM creators WHERE id = $id`, { id });
}

export function listSocialAccounts(creatorId: string): SocialAccountRow[] {
  return all<SocialAccountRow>(`SELECT * FROM social_accounts WHERE creatorId = $creatorId`, { creatorId });
}

export function connectSocialAccount(creatorId: string, platform: Platform, handle: string) {
  const existing = get<SocialAccountRow>(
    `SELECT * FROM social_accounts WHERE creatorId = $creatorId AND platform = $platform`,
    { creatorId, platform }
  );
  if (existing) {
    run(`UPDATE social_accounts SET handle = $handle, connectedAt = datetime('now') WHERE id = $id`, {
      id: existing.id,
      handle,
    });
    return;
  }
  run(
    `INSERT INTO social_accounts (id, creatorId, platform, handle) VALUES ($id, $creatorId, $platform, $handle)`,
    { id: newId(), creatorId, platform, handle }
  );
}

/** Upsert a social account connected through a real OAuth flow (not a manual handle). */
export function connectSocialAccountOAuth(
  creatorId: string,
  platform: Platform,
  input: { handle: string; externalId: string | null }
) {
  const existing = get<SocialAccountRow>(
    `SELECT * FROM social_accounts WHERE creatorId = $creatorId AND platform = $platform`,
    { creatorId, platform }
  );
  if (existing) {
    run(
      `UPDATE social_accounts SET handle = $handle, externalId = $externalId, connectedVia = 'OAUTH', connectedAt = datetime('now') WHERE id = $id`,
      { id: existing.id, handle: input.handle, externalId: input.externalId }
    );
    return;
  }
  run(
    `INSERT INTO social_accounts (id, creatorId, platform, handle, externalId, connectedVia)
     VALUES ($id, $creatorId, $platform, $handle, $externalId, 'OAUTH')`,
    { id: newId(), creatorId, platform, handle: input.handle, externalId: input.externalId }
  );
}

export function disconnectSocialAccount(creatorId: string, platform: Platform) {
  run(`DELETE FROM social_accounts WHERE creatorId = $creatorId AND platform = $platform`, { creatorId, platform });
}

// ---------- Campaigns ----------

export interface NewCampaignInput {
  companyId: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  platform: Platform;
  language: string;
  country: string;
  cpmCents: number;
  budgetCents: number;
  maxCreators: number | null;
  endDate: string | null;
  rulesChecklist: string[];
  rulesExtra: string | null;
  status: CampaignStatus;
}

export function createCampaign(input: NewCampaignInput): CampaignRow {
  const id = newId();
  run(
    `INSERT INTO campaigns
      (id, companyId, name, description, brand, category, platform, language, country,
       cpmCents, budgetCents, maxCreators, endDate, rulesChecklist, rulesExtra, status)
     VALUES
      ($id, $companyId, $name, $description, $brand, $category, $platform, $language, $country,
       $cpmCents, $budgetCents, $maxCreators, $endDate, $rulesChecklist, $rulesExtra, $status)`,
    { id, ...input, rulesChecklist: JSON.stringify(input.rulesChecklist) }
  );
  return getCampaignById(id)!;
}

export function getCampaignById(id: string): CampaignRow | undefined {
  return get<CampaignRow>(`SELECT * FROM campaigns WHERE id = $id`, { id });
}

export function listCampaignsByCompany(companyId: string): CampaignRow[] {
  return all<CampaignRow>(`SELECT * FROM campaigns WHERE companyId = $companyId ORDER BY createdAt DESC`, {
    companyId,
  });
}

export function listOpenCampaignsForCreator(): CampaignRow[] {
  // Somente campanhas ativas sao navegaveis (regras de idioma/pais sao
  // filtradas na camada de apresentacao para permitir busca livre no futuro).
  return all<CampaignRow>(`SELECT * FROM campaigns WHERE status = 'ACTIVE' ORDER BY createdAt DESC`);
}

export function setCampaignStatus(id: string, status: CampaignStatus) {
  run(`UPDATE campaigns SET status = $status, updatedAt = datetime('now') WHERE id = $id`, { id, status });
}

export function incrementCampaignSpent(id: string, amountCents: number) {
  run(`UPDATE campaigns SET spentCents = spentCents + $amountCents, updatedAt = datetime('now') WHERE id = $id`, {
    id,
    amountCents,
  });
}

// ---------- Participations ----------

export function countParticipants(campaignId: string): number {
  const row = get<{ n: number }>(`SELECT COUNT(*) as n FROM participations WHERE campaignId = $campaignId`, {
    campaignId,
  });
  return row?.n ?? 0;
}

export function getParticipation(campaignId: string, creatorId: string): ParticipationRow | undefined {
  return get<ParticipationRow>(`SELECT * FROM participations WHERE campaignId = $campaignId AND creatorId = $creatorId`, {
    campaignId,
    creatorId,
  });
}

export function getParticipationById(id: string): ParticipationRow | undefined {
  return get<ParticipationRow>(`SELECT * FROM participations WHERE id = $id`, { id });
}

export function joinCampaign(campaignId: string, creatorId: string): ParticipationRow {
  const id = newId();
  run(
    `INSERT INTO participations (id, campaignId, creatorId, rulesAccepted) VALUES ($id, $campaignId, $creatorId, 1)`,
    { id, campaignId, creatorId }
  );
  return getParticipationById(id)!;
}

export function listParticipationsByCreator(creatorId: string): ParticipationRow[] {
  return all<ParticipationRow>(`SELECT * FROM participations WHERE creatorId = $creatorId ORDER BY joinedAt DESC`, {
    creatorId,
  });
}

export function listParticipationsByCampaign(campaignId: string): ParticipationRow[] {
  return all<ParticipationRow>(`SELECT * FROM participations WHERE campaignId = $campaignId ORDER BY joinedAt DESC`, {
    campaignId,
  });
}

// ---------- Submissions ----------

export interface NewSubmissionInput {
  campaignId: string;
  creatorId: string;
  participationId: string;
  videoUrl: string;
  platform: Platform;
  publishedAt: string;
}

export function createSubmission(input: NewSubmissionInput): SubmissionRow {
  const id = newId();
  run(
    `INSERT INTO submissions (id, campaignId, creatorId, participationId, videoUrl, platform, publishedAt)
     VALUES ($id, $campaignId, $creatorId, $participationId, $videoUrl, $platform, $publishedAt)`,
    { id, ...input }
  );
  return getSubmissionById(id)!;
}

export function getSubmissionById(id: string): SubmissionRow | undefined {
  return get<SubmissionRow>(`SELECT * FROM submissions WHERE id = $id`, { id });
}

export function getSubmissionByParticipation(participationId: string): SubmissionRow | undefined {
  return get<SubmissionRow>(`SELECT * FROM submissions WHERE participationId = $participationId`, { participationId });
}

export function listSubmissions(status?: SubmissionStatus): SubmissionRow[] {
  if (status) return all<SubmissionRow>(`SELECT * FROM submissions WHERE status = $status ORDER BY createdAt DESC`, { status });
  return all<SubmissionRow>(`SELECT * FROM submissions ORDER BY createdAt DESC`);
}

export function listSubmissionsByCampaign(campaignId: string): SubmissionRow[] {
  return all<SubmissionRow>(`SELECT * FROM submissions WHERE campaignId = $campaignId ORDER BY createdAt DESC`, {
    campaignId,
  });
}

export function listSubmissionsByCreator(creatorId: string): SubmissionRow[] {
  return all<SubmissionRow>(`SELECT * FROM submissions WHERE creatorId = $creatorId ORDER BY createdAt DESC`, {
    creatorId,
  });
}

/**
 * Admin approves a submission. viewsCount is entered manually in the MVP -
 * this stands in for the automatic API read described in
 * "Perguntas e questionamentos" (pergunta 1), which is phase 2 work.
 * Deducts the gross CPM cost from the company balance + campaign spend,
 * and credits the creator's net earnings (90%) - AmplyGo keeps 10%.
 */
export function approveSubmission(id: string, viewsCount: number, reviewNote?: string) {
  const submission = getSubmissionById(id);
  if (!submission) throw new Error("Submission not found");
  const campaign = getCampaignById(submission.campaignId);
  if (!campaign) throw new Error("Campaign not found");

  const { grossCents, creatorNetCents, platformFeeCents } = splitPayment(viewsCount, campaign.cpmCents);

  run(
    `UPDATE submissions SET status = 'APPROVED', viewsCount = $viewsCount, grossCents = $grossCents,
       creatorNetCents = $creatorNetCents, platformFeeCents = $platformFeeCents,
       reviewedAt = datetime('now'), reviewNote = $reviewNote
     WHERE id = $id`,
    { id, viewsCount, grossCents, creatorNetCents, platformFeeCents, reviewNote: reviewNote ?? null }
  );

  incrementCampaignSpent(campaign.id, grossCents);
  addCompanyBalance(campaign.companyId, -grossCents, `Submission approved - ${campaign.name}`);

  return getSubmissionById(id)!;
}

export function rejectSubmission(id: string, reviewNote?: string) {
  run(
    `UPDATE submissions SET status = 'REJECTED', reviewedAt = datetime('now'), reviewNote = $reviewNote WHERE id = $id`,
    { id, reviewNote: reviewNote ?? null }
  );
  return getSubmissionById(id)!;
}

export function flagSubmission(id: string, flagReason: string) {
  run(`UPDATE submissions SET flagged = 1, flagReason = $flagReason WHERE id = $id`, { id, flagReason });
  return getSubmissionById(id)!;
}

// ---------- Payouts ----------

// Creator earnings are stored in the paying company's currency, so totals are
// converted per-submission into a target currency (defaults to USD, which keeps
// existing single-currency behaviour identical).
export function totalApprovedEarnings(creatorId: string, target: Currency = "USD"): number {
  const rows = all<{ net: number; currency: Currency }>(
    `SELECT s.creatorNetCents as net, co.currency as currency
       FROM submissions s
       JOIN campaigns c ON c.id = s.campaignId
       JOIN companies co ON co.id = c.companyId
      WHERE s.creatorId = $creatorId AND s.status = 'APPROVED'`,
    { creatorId }
  );
  return rows.reduce((sum, r) => sum + convertCents(r.net ?? 0, r.currency ?? "USD", target), 0);
}

export function totalPayouts(creatorId: string, target: Currency = "USD"): number {
  const rows = all<{ amountCents: number; currency: Currency }>(
    `SELECT amountCents, currency FROM payouts WHERE creatorId = $creatorId`,
    { creatorId }
  );
  return rows.reduce((sum, r) => sum + convertCents(r.amountCents, r.currency ?? "USD", target), 0);
}

export function availableBalance(creatorId: string, target: Currency = "USD"): number {
  return totalApprovedEarnings(creatorId, target) - totalPayouts(creatorId, target);
}

export function listPayouts(creatorId: string): PayoutRow[] {
  return all<PayoutRow>(`SELECT * FROM payouts WHERE creatorId = $creatorId ORDER BY createdAt DESC`, { creatorId });
}

export function requestPayout(
  creatorId: string,
  amountCents: number,
  method: PayoutMethod,
  currency: Currency = "USD"
): PayoutRow {
  const id = newId();
  run(
    `INSERT INTO payouts (id, creatorId, amountCents, currency, method) VALUES ($id, $creatorId, $amountCents, $currency, $method)`,
    { id, creatorId, amountCents, currency, method }
  );
  return get<PayoutRow>(`SELECT * FROM payouts WHERE id = $id`, { id })!;
}

// ---------- Admin aggregates ----------

// GMV and fees span companies in different currencies, so each approved
// submission is converted to USD before summing (admin sees a USD baseline).
export function platformStats() {
  const rows = all<{ gross: number; fee: number; currency: Currency }>(
    `SELECT s.grossCents as gross, s.platformFeeCents as fee, co.currency as currency
       FROM submissions s
       JOIN campaigns c ON c.id = s.campaignId
       JOIN companies co ON co.id = c.companyId
      WHERE s.status = 'APPROVED'`
  );
  const gmvCents = rows.reduce((sum, r) => sum + convertCents(r.gross ?? 0, r.currency ?? "USD", "USD"), 0);
  const platformFeeCents = rows.reduce((sum, r) => sum + convertCents(r.fee ?? 0, r.currency ?? "USD", "USD"), 0);
  const companiesCount = get<{ n: number }>(`SELECT COUNT(*) as n FROM companies`);
  const pendingCompanies = get<{ n: number }>(`SELECT COUNT(*) as n FROM companies WHERE status = 'PENDING'`);
  const pendingSubmissions = get<{ n: number }>(`SELECT COUNT(*) as n FROM submissions WHERE status IN ('PENDING','FLAGGED')`);
  return {
    gmvCents,
    platformFeeCents,
    companiesCount: companiesCount?.n ?? 0,
    pendingCompanies: pendingCompanies?.n ?? 0,
    pendingSubmissions: pendingSubmissions?.n ?? 0,
  };
}

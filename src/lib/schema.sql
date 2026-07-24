-- AmplyGo MVP schema (SQLite via node:sqlite, no ORM/native binary needed)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('COMPANY','CREATOR','ADMIN')),
  name TEXT NOT NULL,
  suspended INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  userId TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  companyName TEXT NOT NULL,
  website TEXT,
  about TEXT,
  logoUrl TEXT,
  bannerUrl TEXT,
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD','EUR','BRL')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','SUSPENDED','REJECTED')),
  balanceCents INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS creators (
  id TEXT PRIMARY KEY,
  userId TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  displayName TEXT NOT NULL,
  bio TEXT,
  avatarUrl TEXT,
  bannerUrl TEXT,
  displayCurrency TEXT NOT NULL DEFAULT 'USD' CHECK (displayCurrency IN ('USD','EUR','BRL')),
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- MOCK/PLACEHOLDER: no real OAuth in the MVP. See README "Phase 2" notes.
CREATE TABLE IF NOT EXISTS social_accounts (
  id TEXT PRIMARY KEY,
  creatorId TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('TIKTOK','YOUTUBE_SHORTS','INSTAGRAM_REELS')),
  handle TEXT NOT NULL,
  externalId TEXT,
  connectedVia TEXT NOT NULL DEFAULT 'MANUAL' CHECK (connectedVia IN ('MANUAL','OAUTH')),
  connectedAt TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (creatorId, platform)
);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('TIKTOK','YOUTUBE_SHORTS','INSTAGRAM_REELS')),
  language TEXT NOT NULL DEFAULT 'English',
  country TEXT NOT NULL DEFAULT 'Worldwide',
  cpmCents INTEGER NOT NULL,
  budgetCents INTEGER NOT NULL,
  spentCents INTEGER NOT NULL DEFAULT 0,
  maxCreators INTEGER,
  endDate TEXT,
  rulesChecklist TEXT NOT NULL,
  rulesExtra TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','ACTIVE','PAUSED','ENDED')),
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_targeting ON campaigns(platform, language, country);

CREATE TABLE IF NOT EXISTS participations (
  id TEXT PRIMARY KEY,
  campaignId TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  creatorId TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  rulesAccepted INTEGER NOT NULL DEFAULT 0,
  joinedAt TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (campaignId, creatorId)
);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  campaignId TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  creatorId TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  participationId TEXT UNIQUE NOT NULL REFERENCES participations(id) ON DELETE CASCADE,
  videoUrl TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('TIKTOK','YOUTUBE_SHORTS','INSTAGRAM_REELS')),
  publishedAt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED','FLAGGED')),
  flagged INTEGER NOT NULL DEFAULT 0,
  flagReason TEXT,
  viewsCount INTEGER,
  grossCents INTEGER,
  creatorNetCents INTEGER,
  platformFeeCents INTEGER,
  reviewedAt TEXT,
  reviewNote TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

CREATE TABLE IF NOT EXISTS balance_transactions (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  amountCents INTEGER NOT NULL,
  reason TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payouts (
  id TEXT PRIMARY KEY,
  creatorId TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  amountCents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD','EUR','BRL')),
  method TEXT NOT NULL CHECK (method IN ('PIX','PAYPAL')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PAID')),
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  paidAt TEXT
);

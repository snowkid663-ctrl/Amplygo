-- AmplyGo schema (Postgres / Supabase). camelCase identifiers are quoted so
-- Postgres preserves their case (unquoted identifiers fold to lowercase).

CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  email text UNIQUE NOT NULL,
  "passwordHash" text NOT NULL,
  role text NOT NULL CHECK (role IN ('COMPANY','CREATOR','ADMIN')),
  name text NOT NULL,
  suspended integer NOT NULL DEFAULT 0,
  "createdAt" text NOT NULL DEFAULT (now()::text)
);

CREATE TABLE IF NOT EXISTS companies (
  id text PRIMARY KEY,
  "userId" text UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "companyName" text NOT NULL,
  website text,
  about text,
  "logoUrl" text,
  "bannerUrl" text,
  currency text NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD','EUR','BRL')),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','SUSPENDED','REJECTED')),
  "balanceCents" integer NOT NULL DEFAULT 0,
  "createdAt" text NOT NULL DEFAULT (now()::text)
);

CREATE TABLE IF NOT EXISTS creators (
  id text PRIMARY KEY,
  "userId" text UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "displayName" text NOT NULL,
  bio text,
  "avatarUrl" text,
  "bannerUrl" text,
  "displayCurrency" text NOT NULL DEFAULT 'USD' CHECK ("displayCurrency" IN ('USD','EUR','BRL')),
  "createdAt" text NOT NULL DEFAULT (now()::text)
);

CREATE TABLE IF NOT EXISTS social_accounts (
  id text PRIMARY KEY,
  "creatorId" text NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('TIKTOK','YOUTUBE_SHORTS','INSTAGRAM_REELS')),
  handle text NOT NULL,
  "externalId" text,
  "connectedVia" text NOT NULL DEFAULT 'MANUAL' CHECK ("connectedVia" IN ('MANUAL','OAUTH')),
  "connectedAt" text NOT NULL DEFAULT (now()::text),
  UNIQUE ("creatorId", platform)
);

CREATE TABLE IF NOT EXISTS campaigns (
  id text PRIMARY KEY,
  "companyId" text NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  brand text NOT NULL,
  category text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('TIKTOK','YOUTUBE_SHORTS','INSTAGRAM_REELS')),
  language text NOT NULL DEFAULT 'English',
  country text NOT NULL DEFAULT 'Worldwide',
  "cpmCents" integer NOT NULL,
  "budgetCents" integer NOT NULL,
  "spentCents" integer NOT NULL DEFAULT 0,
  "maxCreators" integer,
  "endDate" text,
  "rulesChecklist" text NOT NULL,
  "rulesExtra" text,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PENDING','ACTIVE','PAUSED','ENDED')),
  "createdAt" text NOT NULL DEFAULT (now()::text),
  "updatedAt" text NOT NULL DEFAULT (now()::text)
);
-- Allow the PENDING (awaiting admin review) status on existing databases.
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check CHECK (status IN ('DRAFT','PENDING','ACTIVE','PAUSED','ENDED'));
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_targeting ON campaigns(platform, language, country);

CREATE TABLE IF NOT EXISTS participations (
  id text PRIMARY KEY,
  "campaignId" text NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  "creatorId" text NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  "rulesAccepted" integer NOT NULL DEFAULT 0,
  "joinedAt" text NOT NULL DEFAULT (now()::text),
  UNIQUE ("campaignId", "creatorId")
);

CREATE TABLE IF NOT EXISTS submissions (
  id text PRIMARY KEY,
  "campaignId" text NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  "creatorId" text NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  "participationId" text UNIQUE NOT NULL REFERENCES participations(id) ON DELETE CASCADE,
  "videoUrl" text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('TIKTOK','YOUTUBE_SHORTS','INSTAGRAM_REELS')),
  "publishedAt" text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED','FLAGGED')),
  flagged integer NOT NULL DEFAULT 0,
  "flagReason" text,
  "viewsCount" integer,
  "grossCents" integer,
  "creatorNetCents" integer,
  "platformFeeCents" integer,
  "reviewedAt" text,
  "reviewNote" text,
  "createdAt" text NOT NULL DEFAULT (now()::text)
);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

CREATE TABLE IF NOT EXISTS balance_transactions (
  id text PRIMARY KEY,
  "companyId" text NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  "amountCents" integer NOT NULL,
  reason text NOT NULL,
  "createdAt" text NOT NULL DEFAULT (now()::text)
);

CREATE TABLE IF NOT EXISTS campaign_invites (
  id text PRIMARY KEY,
  "campaignId" text NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  label text,
  "requireApproval" integer NOT NULL DEFAULT 0,
  "maxUses" integer,
  uses integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  "expiresAt" text,
  "createdBy" text REFERENCES users(id) ON DELETE SET NULL,
  active integer NOT NULL DEFAULT 1,
  "createdAt" text NOT NULL DEFAULT (now()::text)
);
CREATE INDEX IF NOT EXISTS idx_invites_campaign ON campaign_invites("campaignId");

-- Public "share results" token per campaign (nullable until enabled).
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS "shareToken" text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_share ON campaigns("shareToken");

-- Attribution + approval columns on participations (added for existing dbs too).
ALTER TABLE participations ADD COLUMN IF NOT EXISTS "inviteId" text;
ALTER TABLE participations ADD COLUMN IF NOT EXISTS ref text;
ALTER TABLE participations ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'APPROVED';

CREATE TABLE IF NOT EXISTS payouts (
  id text PRIMARY KEY,
  "creatorId" text NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  "amountCents" integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD','EUR','BRL')),
  method text NOT NULL CHECK (method IN ('PIX','PAYPAL')),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PAID')),
  "createdAt" text NOT NULL DEFAULT (now()::text),
  "paidAt" text
);

-- Banner vertical focal point (0 = top .. 100 = bottom), so users can reposition.
ALTER TABLE companies ADD COLUMN IF NOT EXISTS "bannerPos" integer NOT NULL DEFAULT 50;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS "bannerPos" integer NOT NULL DEFAULT 50;

-- Invite page theming (companies can brand their invite links).
ALTER TABLE campaign_invites ADD COLUMN IF NOT EXISTS "themeColor" text;
ALTER TABLE campaign_invites ADD COLUMN IF NOT EXISTS "themeBgUrl" text;

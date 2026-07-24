export type Role = "COMPANY" | "CREATOR" | "ADMIN";
export type Currency = "USD" | "EUR" | "BRL";
export type CompanyStatus = "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";
export type Platform = "TIKTOK" | "YOUTUBE_SHORTS" | "INSTAGRAM_REELS";
export type CampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "ENDED";
export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED";
export type PayoutMethod = "PIX" | "PAYPAL";
export type PayoutStatus = "PENDING" | "PAID";

export const PLATFORM_LABEL: Record<Platform, string> = {
  TIKTOK: "TikTok",
  YOUTUBE_SHORTS: "YouTube",
  INSTAGRAM_REELS: "Instagram",
};

export interface UserRow {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  name: string;
  suspended: number;
  createdAt: string;
}

export interface CompanyRow {
  id: string;
  userId: string;
  companyName: string;
  website: string | null;
  about: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  currency: Currency;
  status: CompanyStatus;
  balanceCents: number;
  createdAt: string;
}

export interface CreatorRow {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  displayCurrency: Currency;
  createdAt: string;
}

export interface SocialAccountRow {
  id: string;
  creatorId: string;
  platform: Platform;
  handle: string;
  externalId: string | null;
  connectedVia: "MANUAL" | "OAUTH";
  connectedAt: string;
}

export interface CampaignRow {
  id: string;
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
  spentCents: number;
  maxCreators: number | null;
  endDate: string | null;
  rulesChecklist: string;
  rulesExtra: string | null;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipationRow {
  id: string;
  campaignId: string;
  creatorId: string;
  rulesAccepted: number;
  joinedAt: string;
}

export interface SubmissionRow {
  id: string;
  campaignId: string;
  creatorId: string;
  participationId: string;
  videoUrl: string;
  platform: Platform;
  publishedAt: string;
  status: SubmissionStatus;
  flagged: number;
  flagReason: string | null;
  viewsCount: number | null;
  grossCents: number | null;
  creatorNetCents: number | null;
  platformFeeCents: number | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
}

export interface PayoutRow {
  id: string;
  creatorId: string;
  amountCents: number;
  currency: Currency;
  method: PayoutMethod;
  status: PayoutStatus;
  createdAt: string;
  paidAt: string | null;
}

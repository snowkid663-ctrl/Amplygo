import type { CampaignStatus, SubmissionStatus, CompanyStatus, PayoutStatus } from "./types";

export function campaignStatusTone(status: CampaignStatus) {
  switch (status) {
    case "ACTIVE": return "green" as const;
    case "PAUSED": return "amber" as const;
    case "ENDED": return "neutral" as const;
    default: return "neutral" as const;
  }
}

export function submissionStatusTone(status: SubmissionStatus) {
  switch (status) {
    case "APPROVED": return "green" as const;
    case "PENDING": return "amber" as const;
    case "FLAGGED": return "red" as const;
    case "REJECTED": return "red" as const;
    default: return "neutral" as const;
  }
}

export function companyStatusTone(status: CompanyStatus) {
  switch (status) {
    case "APPROVED": return "green" as const;
    case "PENDING": return "amber" as const;
    case "SUSPENDED": return "red" as const;
    case "REJECTED": return "red" as const;
    default: return "neutral" as const;
  }
}

export function payoutStatusTone(status: PayoutStatus) {
  return status === "PAID" ? ("neutral" as const) : ("amber" as const);
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatNumber(n: number | null | undefined) {
  return (n ?? 0).toLocaleString("en-US");
}

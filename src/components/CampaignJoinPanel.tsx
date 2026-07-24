"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { Input } from "./ui/Field";
import Badge from "./ui/Badge";
import { formatConverted } from "@/lib/money";
import { submissionStatusTone } from "@/lib/format";
import type { Platform, SubmissionRow, Currency } from "@/lib/types";

export default function CampaignJoinPanel({
  campaignId,
  hasMatchingAccount,
  platform,
  joined,
  submission,
  companyCurrency = "USD",
  displayCurrency = "USD",
}: {
  campaignId: string;
  hasMatchingAccount: boolean;
  platform: Platform;
  joined: boolean;
  submission: SubmissionRow | null;
  companyCurrency?: Currency;
  displayCurrency?: Currency;
}) {
  const router = useRouter();
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function join() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/campaigns/${campaignId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rulesAccepted }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.refresh();
  }

  async function submit() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/campaigns/${campaignId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoUrl, platform, publishedAt }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.refresh();
  }

  if (submission) {
    return (
      <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Your submission</div>
          <Badge tone={submissionStatusTone(submission.status)}>{submission.status}</Badge>
        </div>
        <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{submission.videoUrl}</div>
        {submission.status === "APPROVED" && (
          <div style={{ fontSize: 13 }}>
            {submission.viewsCount?.toLocaleString("en-US")} views · you earned{" "}
            <b>{formatConverted(submission.creatorNetCents, companyCurrency, displayCurrency)}</b>
          </div>
        )}
        {submission.status === "REJECTED" && submission.reviewNote && (
          <div style={{ fontSize: 13, color: "var(--red)" }}>Reason: {submission.reviewNote}</div>
        )}
        {submission.status === "PENDING" && (
          <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
            Views will be entered by the AmplyGo team on review while automatic tracking is being built.
          </div>
        )}
      </div>
    );
  }

  if (joined) {
    return (
      <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Submit your content</div>
        {error && <div className="alert-error">{error}</div>}
        <div className="field">
          <label>Video link</label>
          <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://tiktok.com/@you/video/..." />
        </div>
        <div className="field">
          <label>Publish date</label>
          <Input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
        </div>
        <Button onClick={submit} disabled={loading || !videoUrl || !publishedAt}>
          {loading ? "Submitting..." : "Submit for review"}
        </Button>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      {error && <div className="alert-error">{error}</div>}
      {!hasMatchingAccount && (
        <div className="alert-error">Connect your matching social account in Settings before joining this campaign.</div>
      )}
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "oklch(80% 0.005 264)" }}>
        <input type="checkbox" checked={rulesAccepted} onChange={(e) => setRulesAccepted(e.target.checked)} />
        I&apos;ve read the rules and agree to follow them
      </label>
      <Button onClick={join} disabled={loading || !rulesAccepted || !hasMatchingAccount}>
        {loading ? "Joining..." : "Accept and join campaign"}
      </Button>
    </div>
  );
}

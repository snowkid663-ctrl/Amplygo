"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import type { CampaignStatus } from "@/lib/types";

export default function CampaignStatusActions({ campaignId, status }: { campaignId: string; status: CampaignStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(next: CampaignStatus) {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/campaigns/${campaignId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.refresh();
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {error && <span style={{ fontSize: 12, color: "var(--red)" }}>{error}</span>}
      {status === "DRAFT" && (
        <Button small onClick={() => setStatus("PENDING")} disabled={loading}>
          Submit for review
        </Button>
      )}
      {status === "PENDING" && (
        <>
          <span style={{ fontSize: 12, color: "var(--amber)" }}>Awaiting admin review</span>
          <Button small variant="secondary" onClick={() => setStatus("DRAFT")} disabled={loading}>
            Withdraw
          </Button>
        </>
      )}
      {status === "ACTIVE" && (
        <Button small variant="secondary" onClick={() => setStatus("PAUSED")} disabled={loading}>
          Pause campaign
        </Button>
      )}
      {status === "PAUSED" && (
        <Button small onClick={() => setStatus("ACTIVE")} disabled={loading}>
          Resume campaign
        </Button>
      )}
      {(status === "ACTIVE" || status === "PAUSED") && (
        <Button small variant="danger" onClick={() => setStatus("ENDED")} disabled={loading}>
          End campaign
        </Button>
      )}
    </div>
  );
}

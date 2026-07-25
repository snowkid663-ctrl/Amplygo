"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";

export default function CampaignReviewActions({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function act(action: "approve" | "reject") {
    setLoading(true);
    await fetch(`/api/campaigns/${campaignId}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <Button small onClick={() => act("approve")} disabled={loading}>
        Approve
      </Button>
      <Button small variant="danger" onClick={() => act("reject")} disabled={loading}>
        Reject
      </Button>
    </div>
  );
}

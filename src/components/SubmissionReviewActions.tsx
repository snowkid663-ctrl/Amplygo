"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { Input } from "./ui/Field";

export default function SubmissionReviewActions({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [views, setViews] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "approve" | "reject") {
    setError(null);
    if (action === "approve" && !views) {
      setError("Enter a view count first");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/submissions/${submissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, viewsCount: views ? Number(views) : undefined }),
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
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
      {error && <span style={{ fontSize: 11, color: "var(--red)" }}>{error}</span>}
      <div style={{ display: "flex", gap: 8 }}>
        <Input
          type="number"
          min={0}
          placeholder="Views"
          value={views}
          onChange={(e) => setViews(e.target.value)}
          style={{ width: 100 }}
        />
        <Button small onClick={() => act("approve")} disabled={loading}>Approve</Button>
        <Button small variant="danger" onClick={() => act("reject")} disabled={loading}>Reject</Button>
      </div>
    </div>
  );
}

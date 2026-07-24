"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import type { CompanyStatus } from "@/lib/types";

export default function CompanyActions({ companyId, status }: { companyId: string; status: CompanyStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(next: CompanyStatus) {
    setLoading(true);
    await fetch(`/api/companies/${companyId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(false);
    router.refresh();
  }

  if (status === "PENDING") {
    return (
      <div style={{ display: "flex", gap: 8, justifySelf: "end" }}>
        <Button small onClick={() => setStatus("APPROVED")} disabled={loading}>Approve</Button>
        <Button small variant="danger" onClick={() => setStatus("REJECTED")} disabled={loading}>Reject</Button>
      </div>
    );
  }
  if (status === "APPROVED") {
    return (
      <div style={{ justifySelf: "end" }}>
        <Button small variant="danger" onClick={() => setStatus("SUSPENDED")} disabled={loading}>Suspend</Button>
      </div>
    );
  }
  if (status === "SUSPENDED") {
    return (
      <div style={{ justifySelf: "end" }}>
        <Button small onClick={() => setStatus("APPROVED")} disabled={loading}>Reinstate</Button>
      </div>
    );
  }
  return <div style={{ justifySelf: "end", fontSize: 12, color: "var(--text-dimmer)" }}>—</div>;
}

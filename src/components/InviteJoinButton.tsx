"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";

export default function InviteJoinButton({ token, refCode }: { token: string; refCode?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function join() {
    setLoading(true);
    setMsg(null);
    const res = await fetch(`/api/invite/${token}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref: refCode }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      if (data.already && data.campaignId) {
        router.push(`/creator/campaigns/${data.campaignId}`);
        return;
      }
      setMsg({ type: "err", text: data.error ?? "Could not join. Try again." });
      return;
    }
    if (data.status === "PENDING") {
      setMsg({ type: "ok", text: "Request sent! The company will review it shortly." });
      return;
    }
    router.push(`/creator/campaigns/${data.campaignId}`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", width: "100%" }}>
      {msg && <div className={msg.type === "ok" ? "alert-success fu" : "alert-error fu"} style={{ width: "100%" }}>{msg.text}</div>}
      {!(msg && msg.type === "ok") && (
        <Button onClick={join} disabled={loading} className="glow-primary" style={{ borderRadius: 100, width: "100%" }}>
          {loading ? "Joining…" : "Join Campaign"}
        </Button>
      )}
    </div>
  );
}

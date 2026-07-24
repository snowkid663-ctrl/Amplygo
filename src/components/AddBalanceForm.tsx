"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { Input } from "./ui/Field";
import type { Currency } from "@/lib/types";

export default function AddBalanceForm({ currency = "USD" }: { currency?: Currency }) {
  const router = useRouter();
  const [amount, setAmount] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/balance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
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
    <form onSubmit={submit} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
      <div style={{ flex: 1 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: "oklch(85% 0.005 264)", display: "block", marginBottom: 6 }}>
          Amount ({currency})
        </label>
        <Input type="number" min={1} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add balance"}
      </Button>
      {error && <span style={{ fontSize: 12, color: "var(--red)" }}>{error}</span>}
    </form>
  );
}

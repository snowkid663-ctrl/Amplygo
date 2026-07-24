"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { Input, Select } from "./ui/Field";
import { formatCents, convertCents } from "@/lib/money";
import type { PayoutMethod, Currency } from "@/lib/types";

export default function RequestPayoutForm({
  availableCents,
  currency = "USD",
}: {
  availableCents: number;
  currency?: Currency;
}) {
  const router = useRouter();
  const minCents = convertCents(2000, "USD", currency);
  const [amount, setAmount] = useState(Math.max(minCents / 100, availableCents / 100));
  const [method, setMethod] = useState<PayoutMethod>("PIX");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const res = await fetch("/api/payouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, method }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">Withdrawal requested — AmplyGo processes payouts manually for now.</div>}
      <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
        Available: {formatCents(availableCents, currency)} · Minimum {formatCents(minCents, currency)}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Input type="number" min={minCents / 100} step={1} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        <Select value={method} onChange={(e) => setMethod(e.target.value as PayoutMethod)} style={{ maxWidth: 140 }}>
          <option value="PIX">PIX</option>
          <option value="PAYPAL">PayPal</option>
        </Select>
      </div>
      <Button type="submit" disabled={loading || availableCents < minCents}>
        {loading ? "Requesting..." : "Withdraw"}
      </Button>
    </form>
  );
}

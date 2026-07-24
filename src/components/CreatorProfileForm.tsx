"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { Field, Input, Textarea, Select } from "./ui/Field";
import { CURRENCIES, CURRENCY_LABEL } from "@/lib/money";
import type { Currency } from "@/lib/types";

export default function CreatorProfileForm({
  displayName,
  bio,
  displayCurrency,
}: {
  displayName: string;
  bio: string | null;
  displayCurrency: Currency;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ displayName, bio: bio ?? "", displayCurrency });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!form.displayName.trim()) {
      setMsg({ type: "err", text: "Display name is required" });
      return;
    }
    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMsg({ type: "err", text: data.error ?? "Something went wrong" });
      return;
    }
    setMsg({ type: "ok", text: "Profile saved." });
    router.refresh();
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label="Display name">
        <Input value={form.displayName} onChange={(e) => set("displayName", e.target.value)} />
      </Field>
      <Field label="Bio">
        <Textarea
          rows={3}
          placeholder="Tell companies about your content and audience."
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
        />
      </Field>
      <Field label="Display currency">
        <Select value={form.displayCurrency} onChange={(e) => set("displayCurrency", e.target.value as Currency)}>
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {CURRENCY_LABEL[c]}
            </option>
          ))}
        </Select>
        <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
          Earnings and campaign amounts are converted to this currency for you.
        </div>
      </Field>
      {msg && <div className={msg.type === "ok" ? "alert-success fu" : "alert-error fu"}>{msg.text}</div>}
      <div>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

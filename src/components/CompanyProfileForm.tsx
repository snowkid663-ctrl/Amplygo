"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { Field, Input, Textarea, Select } from "./ui/Field";
import { CURRENCIES, CURRENCY_LABEL } from "@/lib/money";
import type { Currency } from "@/lib/types";

export default function CompanyProfileForm({
  companyName,
  website,
  about,
  currency,
}: {
  companyName: string;
  website: string | null;
  about: string | null;
  currency: Currency;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    companyName,
    website: website ?? "",
    about: about ?? "",
    currency,
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!form.companyName.trim()) {
      setMsg({ type: "err", text: "Company name is required" });
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
      <Field label="Company name">
        <Input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
      </Field>
      <Field label="Website">
        <Input placeholder="https://example.com" value={form.website} onChange={(e) => set("website", e.target.value)} />
      </Field>
      <Field label="About">
        <Textarea
          rows={3}
          placeholder="What does your company do?"
          value={form.about}
          onChange={(e) => set("about", e.target.value)}
        />
      </Field>
      <Field label="Currency">
        <Select value={form.currency} onChange={(e) => set("currency", e.target.value as Currency)}>
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {CURRENCY_LABEL[c]}
            </option>
          ))}
        </Select>
        <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
          Campaign budgets, CPM and your balance are shown in this currency.
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

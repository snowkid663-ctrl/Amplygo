"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { Field, Input } from "./ui/Field";

export default function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (next.length < 8) {
      setMsg({ type: "err", text: "New password must be at least 8 characters" });
      return;
    }
    if (next !== confirm) {
      setMsg({ type: "err", text: "New passwords do not match" });
      return;
    }
    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMsg({ type: "err", text: data.error ?? "Something went wrong" });
      return;
    }
    setCurrent("");
    setNext("");
    setConfirm("");
    setMsg({ type: "ok", text: "Password updated." });
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label="Current password">
        <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
      </Field>
      <Field label="New password">
        <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
      </Field>
      <Field label="Confirm new password">
        <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
      </Field>
      {msg && <div className={msg.type === "ok" ? "alert-success fu" : "alert-error fu"}>{msg.text}</div>}
      <div>
        <Button type="submit" disabled={loading || !current || !next || !confirm}>
          {loading ? "Updating..." : "Update password"}
        </Button>
      </div>
    </form>
  );
}

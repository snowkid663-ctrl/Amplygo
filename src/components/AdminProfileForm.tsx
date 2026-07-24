"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { Field, Input } from "./ui/Field";

export default function AdminProfileForm({ name }: { name: string }) {
  const router = useRouter();
  const [value, setValue] = useState(name);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!value.trim()) {
      setMsg({ type: "err", text: "Name is required" });
      return;
    }
    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: value }),
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
      <Field label="Name">
        <Input value={value} onChange={(e) => setValue(e.target.value)} />
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

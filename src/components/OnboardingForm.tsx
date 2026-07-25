"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Field, Input } from "@/components/ui/Field";
import BrandLogo from "@/components/BrandLogo";
import NetworkBackground from "@/components/NetworkBackground";

export default function OnboardingForm({ email, name, next }: { email: string; name: string; next?: string }) {
  const router = useRouter();
  const { update } = useSession();
  const [role, setRole] = useState<"company" | "creator">("creator");
  const [fullName, setFullName] = useState(name);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: role.toUpperCase(),
        name: fullName,
        companyName: role === "company" ? companyName : undefined,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }
    // Refresh the JWT so it now carries the new id + role, then route on.
    await update();
    // Came from "Continue with YouTube" → link the channel right away.
    if (role === "creator" && next === "connect-youtube") {
      window.location.href = "/api/connect/youtube";
      return;
    }
    router.replace(role === "company" ? "/company/dashboard" : "/creator/dashboard");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NetworkBackground />
      <div style={{ padding: "20px 32px" }}>
        <BrandLogo height={30} />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <form
          onSubmit={submit}
          className="fu glass-strong glass-hi"
          style={{
            width: 460,
            display: "flex",
            flexDirection: "column",
            gap: 22,
            padding: 28,
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Welcome to AmplyGo</div>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 4 }}>
              Signed in as {email}. Choose how you&apos;ll use AmplyGo to finish setting up.
            </div>
          </div>

          {error && <div className="alert-error">{error}</div>}

          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8 }}>I am a...</div>
            <div style={{ display: "flex", gap: 10 }}>
              {(["company", "creator"] as const).map((r) => (
                <div
                  key={r}
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1,
                    border: `1.5px solid ${role === r ? "var(--accent-1)" : "var(--input-border)"}`,
                    background: role === r ? "oklch(72% 0.18 264 / 0.12)" : "oklch(100% 0 0 / 0.03)",
                    borderRadius: 10,
                    padding: 14,
                    cursor: "pointer",
                    transition: "all .15s",
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, color: role === r ? "oklch(85% 0.1 264)" : "white" }}>
                    {r === "company" ? "Company" : "Creator"}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                    {r === "company" ? "I want to launch campaigns" : "I want to join campaigns"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {role === "company" && (
            <Field label="Company name">
              <Input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Inc." />
            </Field>
          )}
          <Field label={role === "company" ? "Your name" : "Display name"}>
            <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
          </Field>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Setting up..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getProviders } from "next-auth/react";
import Link from "next/link";
import { Field, Input } from "@/components/ui/Field";
import BrandLogo from "@/components/BrandLogo";
import NetworkBackground from "@/components/NetworkBackground";
import PlatformIcon from "@/components/PlatformIcon";
import VideoTile from "@/components/VideoTile";

function GoogleIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.43.35-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [googleReady, setGoogleReady] = useState(false);
  const [mode, setMode] = useState<"login" | "register">(params.get("mode") === "register" ? "register" : "login");
  const [role, setRole] = useState<"company" | "creator">(params.get("role") === "creator" ? "creator" : "company");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const suspended = params.get("suspended") === "1";

  useEffect(() => {
    getProviders().then((p) => setGoogleReady(Boolean(p?.google))).catch(() => setGoogleReady(false));
  }, []);

  function social() {
    if (!googleReady) {
      setError("Social login isn't configured yet — add your Google credentials to .env (see SETUP-OAUTH.md).");
      return;
    }
    signIn("google", { callbackUrl: "/onboarding" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "register") {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: role.toUpperCase(),
            email,
            password,
            name,
            companyName: role === "company" ? companyName : undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Something went wrong");
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError(result.error === "SUSPENDED" ? "This account has been suspended." : "Invalid email or password.");
        setLoading(false);
        return;
      }

      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const userRole = session?.user?.role;
      // Return to where the user came from (e.g. an /invite link) if provided.
      const callbackUrl = params.get("callbackUrl");
      if (callbackUrl && callbackUrl.startsWith("/")) {
        router.push(callbackUrl);
      } else if (userRole === "COMPANY") router.push("/company/dashboard");
      else if (userRole === "CREATOR") router.push("/creator/dashboard");
      else if (userRole === "ADMIN") router.push("/admin/dashboard");
      else router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NetworkBackground />
      <div style={{ padding: "20px 32px" }}>
        <Link href="/" style={{ display: "inline-block" }}>
          <BrandLogo height={30} />
        </Link>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
        <div className="auth-float auth-float-l floaty" aria-hidden="true">
          <VideoTile grad={1} views="1.2M" platform="TIKTOK" />
        </div>
        <div className="auth-float auth-float-r floaty" aria-hidden="true" style={{ animationDelay: "1.4s" }}>
          <VideoTile grad={3} views="840K" platform="YOUTUBE_SHORTS" />
        </div>
        <div className="auth-float auth-float-r2 floaty" aria-hidden="true" style={{ animationDelay: "0.7s" }}>
          <VideoTile grad={5} views="2.4M" platform="INSTAGRAM_REELS" />
        </div>
        <form
          onSubmit={handleSubmit}
          className="fu glass-strong glass-hi auth-card"
          style={{ width: 410, display: "flex", flexDirection: "column", gap: 18, padding: "34px 30px", zIndex: 1 }}
        >
          <div className="auth-logo">
            <svg width={20} height={20} viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>

          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p style={{ fontSize: 13.5, color: "var(--text-dim)", margin: "6px 0 0" }}>
              {isLogin ? "Please enter your details to sign in." : "Join AmplyGo in a few seconds."}
            </p>
          </div>

          {suspended && <div className="alert-error">Your account has been suspended. Contact support for help.</div>}
          {error && <div className="alert-error">{error}</div>}

          {!isLogin && (
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
                      padding: 12,
                      cursor: "pointer",
                      transition: "all .15s",
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 600, color: role === r ? "oklch(85% 0.1 264)" : "white" }}>
                      {r === "company" ? "Company" : "Creator"}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-dim)" }}>
                      {r === "company" ? "Launch campaigns" : "Join campaigns"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {!isLogin && (
              <Field label={role === "company" ? "Company name" : "Full name"}>
                <Input
                  required
                  value={role === "company" ? companyName : name}
                  onChange={(e) => (role === "company" ? setCompanyName(e.target.value) : setName(e.target.value))}
                  placeholder={role === "company" ? "Acme Inc." : "Jane Doe"}
                />
              </Field>
            )}
            {!isLogin && role === "company" && (
              <Field label="Your name">
                <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
              </Field>
            )}
            <Field label="Email">
              <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
            </Field>
            <Field label="Password">
              <Input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </Field>
          </div>

          {isLogin && (
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-dim)", cursor: "pointer" }}>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ accentColor: "var(--accent-1)", width: 15, height: 15 }} />
              Remember me
            </label>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary glow-primary" style={{ borderRadius: 10 }}>
            {loading ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
            {!loading && <span style={{ marginLeft: 2 }}>→</span>}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-dimmer)", fontSize: 12 }}>
            <div style={{ flex: 1, height: 1, background: "var(--input-border)" }} />OR
            <div style={{ flex: 1, height: 1, background: "var(--input-border)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button type="button" className="auth-social" onClick={social}>
              <GoogleIcon />
              Continue with Google
              <span className="arrow">→</span>
            </button>
            <button type="button" className="auth-social" onClick={social}>
              <PlatformIcon platform="YOUTUBE_SHORTS" size={18} />
              Continue with YouTube
              <span className="arrow">→</span>
            </button>
          </div>

          <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-dim)" }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setMode(isLogin ? "register" : "login");
                setError(null);
              }}
              style={{ border: "none", background: "none", padding: 0, cursor: "pointer", color: "var(--accent-text)", fontWeight: 600, fontSize: 13 }}
            >
              {isLogin ? "Create account" : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm />
    </Suspense>
  );
}

import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSession } from "@/lib/session";
import { providerConfig, isConnectProvider, connectCallbackUrl } from "@/lib/oauth";

/** Starts the OAuth flow: redirects the creator to the provider's consent screen. */
export async function GET(req: Request, { params }: { params: { provider: string } }) {
  const provider = params.provider;
  if (!isConnectProvider(provider)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  }

  const session = await getSession();
  if (session?.user?.role !== "CREATOR") {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  const cfg = providerConfig(provider);
  if (!cfg.enabled) {
    return NextResponse.json(
      { error: `${cfg.label} connection is not configured. Add its credentials to .env — see SETUP-OAUTH.md` },
      { status: 501 }
    );
  }

  const state = randomUUID();
  const authUrl = new URL(cfg.authUrl);
  authUrl.searchParams.set("client_id", cfg.clientId!);
  authUrl.searchParams.set("redirect_uri", connectCallbackUrl(provider));
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", cfg.scope);
  authUrl.searchParams.set("state", state);
  for (const [k, v] of Object.entries(cfg.extraAuthParams ?? {})) authUrl.searchParams.set(k, v);

  const res = NextResponse.redirect(authUrl.toString());
  // CSRF guard: the callback verifies this matches the returned state.
  res.cookies.set(`connect_state_${provider}`, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });
  return res;
}

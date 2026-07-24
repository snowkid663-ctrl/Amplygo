import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { getCreatorByUserId, connectSocialAccountOAuth } from "@/lib/data";
import { providerConfig, isConnectProvider, connectCallbackUrl, type ConnectProvider } from "@/lib/oauth";

const SETTINGS = "/creator/settings";

function fail(req: Request, reason: string) {
  return NextResponse.redirect(new URL(`${SETTINGS}?connect_error=${reason}`, req.url));
}

async function exchangeCode(provider: ConnectProvider, code: string) {
  const cfg = providerConfig(provider);
  const res = await fetch(cfg.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: cfg.clientId!,
      client_secret: cfg.clientSecret!,
      code,
      grant_type: "authorization_code",
      redirect_uri: connectCallbackUrl(provider),
    }),
  });
  if (!res.ok) return null;
  return (await res.json()) as { access_token?: string };
}

/** Fetches the connected identity (handle + external id) from the provider. */
async function fetchIdentity(
  provider: ConnectProvider,
  accessToken: string
): Promise<{ handle: string; externalId: string } | null> {
  if (provider === "youtube") {
    const r = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!r.ok) return null;
    const j = await r.json();
    const ch = j.items?.[0];
    if (!ch) return null;
    const handle = ch.snippet?.customUrl || ch.snippet?.title || ch.id;
    return { handle, externalId: ch.id };
  }
  // instagram
  const r = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
  if (!r.ok) return null;
  const j = await r.json();
  if (!j.username) return null;
  return { handle: `@${j.username}`, externalId: String(j.id) };
}

export async function GET(req: Request, { params }: { params: { provider: string } }) {
  const provider = params.provider;
  if (!isConnectProvider(provider)) return NextResponse.json({ error: "Unknown provider" }, { status: 404 });

  const session = await getSession();
  if (session?.user?.role !== "CREATOR") return NextResponse.redirect(new URL("/auth", req.url));
  const creator = await getCreatorByUserId(session.user.id);
  if (!creator) return NextResponse.redirect(new URL("/auth", req.url));

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieName = `connect_state_${provider}`;
  const cookieState = cookies().get(cookieName)?.value;

  if (searchParams.get("error")) return fail(req, "denied");
  if (!code || !state || !cookieState || state !== cookieState) return fail(req, "state");

  const token = await exchangeCode(provider, code);
  if (!token?.access_token) return fail(req, "token");

  const identity = await fetchIdentity(provider, token.access_token);
  if (!identity) return fail(req, "identity");

  const cfg = providerConfig(provider);
  await connectSocialAccountOAuth(creator.id, cfg.platform, identity);

  const res = NextResponse.redirect(new URL(`${SETTINGS}?connected=${provider}`, req.url));
  res.cookies.delete(cookieName);
  return res;
}

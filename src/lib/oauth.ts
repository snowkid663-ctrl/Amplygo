import type { Platform } from "./types";

/**
 * OAuth "connect a social account" providers. This is separate from login
 * (NextAuth) — here a logged-in creator authorises AmplyGo to read their
 * channel/profile so we can track views for real (phase 2 uses the tokens).
 *
 * Everything is gated on env credentials, so the app runs fine without them.
 */

export type ConnectProvider = "youtube" | "instagram";

export interface ProviderConfig {
  platform: Platform;
  label: string;
  enabled: boolean;
  authUrl: string;
  tokenUrl: string;
  scope: string;
  clientId?: string;
  clientSecret?: string;
  extraAuthParams?: Record<string, string>;
}

function youtubeConfig(): ProviderConfig {
  // Reuses the same Google OAuth app as login. The Google Cloud project must
  // have the "YouTube Data API v3" enabled and the youtube.readonly scope
  // added to the OAuth consent screen.
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return {
    platform: "YOUTUBE_SHORTS",
    label: "YouTube",
    enabled: Boolean(clientId && clientSecret),
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope: "https://www.googleapis.com/auth/youtube.readonly",
    clientId,
    clientSecret,
    extraAuthParams: { access_type: "offline", include_granted_scopes: "true", prompt: "consent" },
  };
}

function instagramConfig(): ProviderConfig {
  // Requires a Meta app. Endpoints/scopes here follow the Instagram Login
  // (Business) flow and may need adjusting to your app's configuration — see
  // SETUP-OAUTH.md. Business verification is required before it works.
  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
  return {
    platform: "INSTAGRAM_REELS",
    label: "Instagram",
    enabled: Boolean(clientId && clientSecret),
    authUrl: "https://www.instagram.com/oauth/authorize",
    tokenUrl: "https://api.instagram.com/oauth/access_token",
    scope: "instagram_business_basic",
    clientId,
    clientSecret,
  };
}

export function providerConfig(provider: ConnectProvider): ProviderConfig {
  return provider === "youtube" ? youtubeConfig() : instagramConfig();
}

export function isConnectProvider(value: string): value is ConnectProvider {
  return value === "youtube" || value === "instagram";
}

export function connectCallbackUrl(provider: ConnectProvider): string {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/api/connect/${provider}/callback`;
}

/** Enabled flags for the UI, computed server-side. */
export function connectStatus() {
  return {
    youtube: youtubeConfig().enabled,
    instagram: instagramConfig().enabled,
  };
}

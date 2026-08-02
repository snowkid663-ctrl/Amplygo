import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { getUserByEmail, getCompanyByUserId, getCreatorByUserId } from "./data";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

/** True when Google OAuth credentials are present in the environment. */
export const googleEnabled = Boolean(googleClientId && googleClientSecret);

const providers: AuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      const user = await getUserByEmail(credentials.email.toLowerCase().trim());
      if (!user) return null;
      const valid = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!valid) return null;
      if (user.suspended) throw new Error("SUSPENDED");
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        suspended: !!user.suspended,
      } as any;
    },
  }),
];

// Registered only when credentials exist, so the app runs fine without them.
if (googleEnabled) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId!,
      clientSecret: googleClientSecret!,
      authorization: { params: { prompt: "select_account" } },
    })
  );
}

/** Populate a JWT from the current DB row for a given email (or flag onboarding). */
async function hydrateFromEmail(token: any, email?: string | null) {
  const normalized = email?.toLowerCase().trim();
  if (!normalized) return token;
  const existing = await getUserByEmail(normalized);
  if (existing) {
    token.id = existing.id;
    token.role = existing.role;
    token.suspended = !!existing.suspended;
    token.needsRole = false;
  } else {
    // Authenticated via Google but no account yet — needs to pick a type.
    token.needsRole = true;
    token.email = normalized;
  }
  return token;
}

/**
 * Resolves the profile image + display currency into the token ONCE (at sign-in
 * and on session.update()), so the per-request `session` callback needs no DB
 * query. Profile edits call update() to refresh these.
 */
async function attachProfile(token: any) {
  token.image = null;
  token.currency = "USD";
  if (!token.id) return;
  if (token.role === "COMPANY") {
    const c = await getCompanyByUserId(token.id);
    token.image = c?.logoUrl ?? null;
    token.currency = c?.currency ?? "USD";
  } else if (token.role === "CREATOR") {
    const c = await getCreatorByUserId(token.id);
    token.image = c?.avatarUrl ?? null;
    token.currency = c?.displayCurrency ?? "USD";
  }
}

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth",
  },
  providers,
  callbacks: {
    async jwt({ token, user, account, profile, trigger }) {
      // Email/password sign-in: the authorize() return carries everything.
      if (user && account?.provider === "credentials") {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.suspended = (user as any).suspended;
        token.needsRole = false;
        await attachProfile(token);
        return token;
      }
      // Google sign-in (first pass carries account + profile).
      if (account?.provider === "google") {
        await hydrateFromEmail(token, (profile as any)?.email ?? token.email);
        await attachProfile(token);
        return token;
      }
      // Client called update() — after onboarding, or a profile/currency edit.
      if (trigger === "update") {
        if (token.needsRole) await hydrateFromEmail(token, token.email);
        await attachProfile(token);
        return token;
      }
      return token;
    },
    async session({ session, token }) {
      // No DB here — everything was resolved into the token at sign-in/update.
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.suspended = !!token.suspended;
        session.user.needsRole = !!token.needsRole;
        session.user.image = (token.image as string | null) ?? null;
        session.user.currency = (token.currency as any) ?? "USD";
      }
      return session;
    },
  },
};

# OAuth setup — Google login, YouTube & Instagram connect

The app runs **without any of this**. These steps unlock three optional
features, each gated on environment variables in `.env`:

| Feature | Needs |
|---|---|
| "Continue with Google" login | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Connect a **YouTube** channel (real API) | same Google credentials + YouTube Data API enabled |
| Connect an **Instagram** account (real API) | `INSTAGRAM_CLIENT_ID`, `INSTAGRAM_CLIENT_SECRET` (a Meta app) |

After editing `.env`, **restart `npm run dev`** — env vars are read at startup.

---

## 1. Google (login + YouTube connect)

One Google Cloud project powers both the Google login button and the
"Connect YouTube" button.

1. Go to <https://console.cloud.google.com/> and create a project (or pick one).
2. **APIs & Services → Library →** enable **"YouTube Data API v3"** (needed for
   the YouTube channel connect; login alone doesn't require it).
3. **APIs & Services → OAuth consent screen:**
   - User type: **External**.
   - Add your Google account under **Test users** (while the app is in
     "Testing" mode only test users can sign in — that's fine for local dev).
   - Under **Scopes**, add `.../auth/youtube.readonly` if you want the YouTube
     connect (login only needs the default email/profile scopes).
4. **APIs & Services → Credentials → Create credentials → OAuth client ID:**
   - Application type: **Web application**.
   - **Authorized redirect URIs** — add BOTH:
     - `http://localhost:3000/api/auth/callback/google`  (login)
     - `http://localhost:3000/api/connect/youtube/callback`  (YouTube connect)
5. Copy the **Client ID** and **Client secret** into `.env`:
   ```
   GOOGLE_CLIENT_ID="....apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="...."
   ```
6. Restart the dev server. The Google button appears on `/auth`, and the
   "Connect with YouTube" button lights up in creator **Settings → Connected
   accounts**.

New people who sign in with Google are sent to `/onboarding` to pick
Company or Creator before their account is created. Existing accounts with a
matching email are linked automatically.

---

## 2. Instagram connect

Instagram requires a **Meta app**, and going live requires **business
verification + app review** — so unlike Google it can't be fully exercised on
a fresh personal account. The plumbing is ready; you supply the app.

1. Go to <https://developers.facebook.com/apps/> → **Create app**.
2. Add the **Instagram** product (Instagram API with Instagram Login).
3. Configure the OAuth redirect URI:
   - `http://localhost:3000/api/connect/instagram/callback`
4. Copy the app's client id/secret into `.env`:
   ```
   INSTAGRAM_CLIENT_ID="...."
   INSTAGRAM_CLIENT_SECRET="...."
   ```
5. Restart the dev server.

> The scope and endpoints in `src/lib/oauth.ts` (`instagramConfig`) follow the
> Instagram Login (Business) flow. Depending on how your Meta app is set up you
> may need to adjust the `scope`, `authUrl`/`tokenUrl`, or the identity fetch in
> `src/app/api/connect/[provider]/callback/route.ts`. This is expected — Meta's
> flow varies by app type and review status.

---

## TikTok

Not wired to OAuth. TikTok for Developers requires an approved app; until then
TikTok stays a manual `@handle` in Connected accounts. When you have an
approved app, add a `tiktokConfig()` in `src/lib/oauth.ts` and a
`"tiktok"` case in the connect callback, mirroring YouTube.

---

## Where the code lives

- `src/lib/auth.ts` — NextAuth config; Google provider registered only when
  its env vars exist (`googleEnabled`).
- `src/app/onboarding/` + `src/app/api/onboarding/route.ts` — account-type
  picker for first-time OAuth users.
- `src/lib/oauth.ts` — connect-provider configs + `connectStatus()`.
- `src/app/api/connect/[provider]/route.ts` — starts the connect OAuth flow.
- `src/app/api/connect/[provider]/callback/route.ts` — exchanges the code and
  saves the real handle/channel id to `social_accounts` (`connectedVia='OAUTH'`).

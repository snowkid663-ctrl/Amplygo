# Social login & YouTube auto-link

**Status:** shipped
**Last updated:** 2026-07-25

## Summary
Login uses one Google Cloud OAuth app (see `SETUP-OAUTH.md`). The auth screen has
two social buttons:

- **Continue with Google** — standard Google sign-in → `/onboarding` (new users
  pick Company/Creator) → dashboard.
- **Continue with YouTube** — same Google sign-in, but chained so the creator's
  **YouTube channel is linked automatically** afterward, with no separate
  "connect" click in Settings.

## How the auto-link works
The YouTube button signs in with `callbackUrl: "/connect-youtube"`.

`/connect-youtube` (server bridge):
- not signed in → `/auth`
- no role yet (new Google user) → `/onboarding?next=connect-youtube`
- role `CREATOR` → `/api/connect/youtube` (starts the tested YouTube OAuth that
  reads the channel with `youtube.readonly` and stores it)
- role `COMPANY`/`ADMIN` → their dashboard (companies don't link channels)

`/onboarding` honors `next=connect-youtube`: right after a **creator** row is
created it forwards to `/api/connect/youtube`.

This reuses the existing, tested connect flow (`src/app/api/connect/[provider]/*`)
instead of storing OAuth tokens in the NextAuth JWT — lower risk, same result.
Google still shows its consent screen for the YouTube scope (unavoidable).

## Gotcha
While the Google app is in **Testing**, only accounts added under
**OAuth consent screen → Test users** can sign in (`Error 403: access_denied`
otherwise). Publishing + verification is required for public YouTube access.

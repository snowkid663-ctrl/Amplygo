# Deploying AmplyGo to Render

This repo ships a `render.yaml` blueprint, so the fastest path is a Render
Blueprint deploy.

## 1. Push the code to GitHub (or GitLab)

Render deploys from a Git repo. From the project folder:

```bash
git init
git add -A
git commit -m "AmplyGo MVP"
git branch -M main
git remote add origin https://github.com/<you>/amplygo.git
git push -u origin main
```

## 2. Create the service on Render

1. Go to <https://dashboard.render.com> → **New → Blueprint**.
2. Connect the GitHub repo. Render reads `render.yaml` and proposes a web
   service named **amplygo**.
3. Click **Apply**. First build takes a few minutes.

That's it — the blueprint already sets:

- **Node 22.16** (`node:sqlite` needs ≥ 22.5).
- Build: `npm install --include=dev && npm run build`.
- Start: exports `NEXTAUTH_URL` from Render's URL, seeds the demo accounts,
  then runs `next start`.
- A generated `NEXTAUTH_SECRET`.

When it's live you can log in with the seeded accounts (password
`password123`): `admin@amplygo.com`, `acme@amplygo.com`, `jane@amplygo.com`.

## 3. (Optional) Enable Google / YouTube / Instagram login

In the Render service → **Environment**, fill `GOOGLE_CLIENT_ID` /
`GOOGLE_CLIENT_SECRET` (and Instagram if wanted). Then add your production
callback URLs in the provider console, e.g.:

- `https://<your-app>.onrender.com/api/auth/callback/google`
- `https://<your-app>.onrender.com/api/connect/youtube/callback`

See `SETUP-OAUTH.md` for the full setup.

## Database — Supabase (Postgres)

The app uses **Supabase Postgres** via `DATABASE_URL`, so data **persists**
across deploys (unlike the old local SQLite). Set it up once:

1. Create a project at <https://supabase.com>.
2. **Project Settings → Database → Connection string → URI** — copy it
   (looks like `postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres`).
3. Paste it as the **`DATABASE_URL`** env var in the Render service (and in your
   local `.env` for dev).

On boot the start command runs `npm run seed`, which **creates the schema** and
the demo accounts (idempotent — safe to run every deploy).

> **Uploaded images** (`public/uploads`) still live on Render's ephemeral disk,
> so they reset on redeploy. Moving them to Supabase Storage is a phase-2 item;
> the database itself is fully persistent.

## Notes

- Free services **spin down** after inactivity; the first request afterwards is
  slow while it wakes up.
- `.env` in the repo only holds dev defaults; Render's environment variables
  take precedence in production.
- Local dev also needs `DATABASE_URL` set (it hits the same Supabase database).

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

## ⚠️ Data persistence (important)

The **free plan has an ephemeral filesystem** — the SQLite database and any
uploaded images (`public/uploads`) are **wiped on every deploy/restart**. The
seeded demo accounts are recreated on boot (`SEED_ON_START=true`), but campaigns,
balances and uploads created at runtime do **not** survive a redeploy.

To make data persistent, upgrade to a paid instance and attach a **Render Disk**:

1. Service → **Disks → Add Disk**, mount path e.g. `/var/data`, size 1 GB.
2. Add env var `SQLITE_PATH=/var/data/amplygo.db` (the app reads this).
3. Set `SEED_ON_START=false` (seed once via the shell instead: `npm run seed`).

> Uploaded images would still need object storage (e.g. S3/R2) for real
> persistence — the disk only covers the database. That's a phase-2 item.

## Notes

- Keep the service on a **single instance** — SQLite is a local file and
  doesn't share across instances.
- Free services **spin down** after inactivity; the first request afterwards
  is slow while it wakes up.
- `.env` in the repo only holds dev defaults; Render's environment variables
  take precedence in production.

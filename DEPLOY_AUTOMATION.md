# Backend deploy automation (AWS)

Render gave you push-to-deploy for free. On the self-hosted EC2 box you own the
pipeline. This sets it up in two stages — a safe **deploy script** first, then
**push-button automation** via a self-hosted runner — without opening your
firewall or building unsafely on the small box.

Files:
- **`deploy.sh`** — the safe deploy (pull → build → migrate → reload → health-check + rollback).
- **`.github/workflows/deploy.yml`** — runs `deploy.sh` automatically on a version tag.

---

## Stage 1 — the deploy script (use this today)

One safe command instead of remembering the steps. It's memory-capped (so a build
can't OOM the 1 GB box again), backs up the DB first, health-checks after reload,
and **auto-rolls-back the code** if the new build is unhealthy.

### Install (once, on the box)
```
cd ~/reality-wallet-backend
git pull                       # get deploy.sh
chmod +x deploy.sh
```

### Deploy (any time)
```
~/reality-wallet-backend/deploy.sh
```
That's it — it pulls `origin/main`, builds, migrates, reloads pm2, and verifies
`/api/v1/health`. If health fails it reverts to the previous commit and tells you.

> ⚠️ `deploy.sh` does `git reset --hard origin/main` — it deploys *exactly* what's
> on `main` and **discards any uncommitted local edits on the box**. That's
> intended (the box shouldn't carry local changes), but don't hand-edit files on
> the server and expect them to survive a deploy — commit them instead.

> DB migrations are forward-only and are **not** auto-reverted on rollback. After
> any failed deploy that added a migration, check the DB state.

---

## Stage 2 — push-button automation (self-hosted runner)

A GitHub Actions **self-hosted runner** installed on the EC2 box connects
*outbound* to GitHub, so **no inbound SSH and no Security Group changes** are
needed. On a version tag it runs `deploy.sh` for you — restoring the Render-style
"push → deploy" flow, securely.

### A. Install the runner on the box
1. GitHub → your repo → **Settings → Actions → Runners → New self-hosted runner**
   → **Linux / x64**. GitHub shows a `download` + `config` snippet with a token.
2. On the box, run their snippet (it looks like):
   ```
   mkdir -p ~/actions-runner && cd ~/actions-runner
   curl -o actions-runner-linux-x64.tar.gz -L <URL_FROM_GITHUB>
   tar xzf actions-runner-linux-x64.tar.gz
   ./config.sh --url https://github.com/<you>/reality-wallet-backend \
               --token <TOKEN_FROM_GITHUB> \
               --labels affora-prod \
               --name affora-ec2 --unattended
   ```
   The **`--labels affora-prod`** must match `runs-on: [self-hosted, affora-prod]`
   in `deploy.yml`.
3. Run it as a service so it survives reboots:
   ```
   sudo ./svc.sh install
   sudo ./svc.sh start
   sudo ./svc.sh status
   ```
   In GitHub → Settings → Actions → Runners you should now see **affora-ec2 · Idle**.

### B. Commit the workflow
`.github/workflows/deploy.yml` is already in this repo. Once the runner is online,
the workflow is live.

### C. Deploy by tagging a release
```
git tag v1.0.3
git push origin v1.0.3
```
The runner picks it up and runs `deploy.sh` on the box. Watch it in the repo's
**Actions** tab. You can also hit **Run workflow** (manual `workflow_dispatch`) to
deploy current `main` on demand.

> Why tags, not every push? So work-in-progress commits don't auto-hit
> production. Tagging is a deliberate "ship it." Change the trigger in
> `deploy.yml` to `push: branches: [main]` if you'd rather deploy every merge.

---

## Runner environment notes (avoid the common gotchas)

The runner runs as the `ubuntu` user with a minimal shell env. If a deploy fails
with "command not found":
- **PATH:** `deploy.yml` exports `/usr/bin:/usr/local/bin:/snap/bin`. Ensure
  `node`, `npm`, `pm2`, `git`, `curl` resolve there (`which pm2` on the box).
- **pm2:** the runner shares the `ubuntu` pm2 daemon — `pm2 list` as `ubuntu`
  should show `affora-api`.
- **Pre-deploy backup uses `sudo -u postgres`:** if the runner can't sudo
  non-interactively, the backup step just warns and continues (it's best-effort).
  To keep backups working in automated deploys, allow it:
  `echo 'ubuntu ALL=(postgres) NOPASSWD: /usr/bin/pg_dump' | sudo tee /etc/sudoers.d/affora-backup`

---

## Safety checklist (already built in or recommended)
- [x] Memory-capped build (no OOM) — `NODE_OPTIONS=--max-old-space-size=512`.
- [x] Pre-deploy DB backup (local + S3 via the nightly script).
- [x] Health check after reload, with automatic **code** rollback on failure.
- [x] One-deploy-at-a-time (`concurrency` in the workflow).
- [x] **CI gate before deploy** — the workflow's `verify` job (lint + compile +
      tests) must pass before the `deploy` job runs (`needs: verify`), so a red
      build never ships.
- [ ] Consider Slack/email notification on deploy failure.

---

## Quick reference
| Action | Command |
|---|---|
| Manual deploy (now) | `~/reality-wallet-backend/deploy.sh` |
| Tag-deploy (automated) | `git tag v1.x.y && git push origin v1.x.y` |
| Manual automated run | GitHub → Actions → "Deploy backend (AWS)" → Run workflow |
| Watch app | `pm2 logs affora-api` · `pm2 status` |
| Roll back by hand | `cd ~/reality-wallet-backend && git reset --hard <good-sha> && npm ci && NODE_OPTIONS=--max-old-space-size=512 npm run build && pm2 reload affora-api` |

# Deploying Affora's backend to your own VPS — a learning guide

A from-scratch, **learn-the-fundamentals** walkthrough for running this NestJS +
Postgres backend on a Linux server you own. Not urgent — do it at your own pace.

> **Why bother?** PaaS (Render) hides the real machinery. Doing it yourself once
> teaches you: process management, reverse proxies, TLS/HTTPS, firewalls, DNS, and
> database administration — the core of backend ops. After this you'll understand
> *what Render was doing for you.*

---

## 0. The mental model — what you now own

On Render, one click gave you: a server, a process that auto-restarts, HTTPS, a
domain, and a database. On a VPS **you assemble those pieces yourself**:

```
        Internet (HTTPS :443)
              │
        ┌─────▼─────┐   Caddy — reverse proxy.
        │   Caddy   │   Terminates TLS (auto Let's Encrypt cert),
        └─────┬─────┘   forwards to your app on localhost:3000.
              │ http://localhost:3000
        ┌─────▼─────┐   pm2 — process manager.
        │  NestJS   │   Keeps `node dist/src/main.js` running,
        │  (pm2)    │   restarts on crash, starts on reboot.
        └─────┬─────┘
              │ localhost:5432
        ┌─────▼─────┐   PostgreSQL — your database,
        │ Postgres  │   running on the same box.
        └───────────┘
   ufw firewall: only 22 (SSH), 80, 443 open. Postgres stays localhost-only.
```

Each box below maps to one section. **No cold starts ever** — these are
long-lived processes that never spin down.

---

## 1. Pick a VPS (any of these = an always-on Ubuntu box)

The deploy is identical on all of them — they're all "Ubuntu + root SSH access."

| Provider | Cost | Learning value | Notes |
|---|---|---|---|
| **Hetzner** CX22 | ~€4/mo | Medium | Best price/performance, clean UI. Great default. |
| **DigitalOcean** Basic | $4–6/mo | Medium | Best beginner *tutorials* (their docs are gold). |
| **AWS EC2** t3.micro | **Free 12 mo**, then ~$8/mo | **Highest** | Industry-standard cloud skills; steepest curve. See §AWS below. |
| **Oracle Cloud** Always-Free ARM | $0 forever | Medium | Genuinely free, but signup is fussy and capacity-limited. |

Pick **Ubuntu 24.04 LTS**. 1 vCPU / 1 GB RAM is enough for NestJS + a small Postgres.

---

## 2. First login & hardening (security basics)

SSH in as root (provider gives you the IP), then create a normal user — you should
**never run an app as root**:

```
ssh root@YOUR_SERVER_IP
adduser affora                      # set a password
usermod -aG sudo affora             # give it sudo
rsync --archive --chown=affora:affora ~/.ssh /home/affora   # copy your SSH key
```

Log out, then back in as the new user: `ssh affora@YOUR_SERVER_IP`.

**Firewall** — open only what you need:
```
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```
Postgres (5432) is deliberately NOT opened — it'll only be reached from localhost.

---

## 3. Install Node + PostgreSQL

```
# Node 20 LTS (matches your @types/node 24 dev env fine)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL
sudo apt-get install -y postgresql
```

Create the database and a user (this is the DB admin part):
``` 
sudo -u postgres psql
```
Inside psql:
```
CREATE DATABASE affora;
CREATE USER affora_app WITH PASSWORD 'a-strong-password-here';
GRANT ALL PRIVILEGES ON DATABASE affora TO affora_app;
\c affora
GRANT ALL ON SCHEMA public TO affora_app;
\q
```
Your `DATABASE_URL` will be:
`postgresql://affora_app:a-strong-password-here@localhost:5432/affora`

---

## 4. Get the code & configure

```
cd /home/affora
git clone YOUR_BACKEND_REPO_URL affora-backend
cd affora-backend
npm ci
```

Create `.env` (never commit it — it's git-ignored):
```
DATABASE_URL=postgresql://affora_app:a-strong-password-here@localhost:5432/affora
JWT_SECRET=paste-a-long-random-string
GOOGLE_CLIENT_ID=461898806484-to9kmleav1rggh4kdcnh8qkqt156t91p.apps.googleusercontent.com
PORT=3000
```
(Generate a JWT secret with `openssl rand -base64 48`.)

Build and run migrations:
```
npm run build                 # prisma generate && nest build
node scripts/migrate.js       # applies prisma/migrations to your new DB
```

---

## 5. Keep it running with pm2 (process manager)

``` affora-db-backups-hakeem
sudo npm install -g pm2
pm2 start dist/src/main.js --name affora-api
pm2 save                      # remember this process list
pm2 startup                   # prints a command — run it to start pm2 on boot
```

Now `node dist/src/main.js` runs forever — restarts on crash, comes back after a
reboot. Check it: `pm2 status` and `curl http://localhost:3000/api/v1/health`
→ should return 200.

---

## 6. HTTPS + domain with Caddy (the easy way to TLS)

You own `buildwithhakeem.dev` — use a subdomain like **`affora-api.buildwithhakeem.dev`**.

1. **DNS:** at your domain registrar, add an **A record**:
   `api` → `YOUR_SERVER_IP`. Wait a few minutes for it to propagate.

2. **Install Caddy:**
```
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update && sudo apt-get install -y caddy
```

3. **Configure** — edit `/etc/caddy/Caddyfile` to just:
```
affora-api.buildwithhakeem.dev {
    reverse_proxy localhost:3000
}
```
```
sudo systemctl reload caddy
```

Caddy **automatically gets and renews a Let's Encrypt HTTPS certificate** for that
domain — no certbot, no manual renewal. Visit
`https://affora-api.buildwithhakeem.dev/api/v1/health` → 200 over HTTPS. 🎉

---

## 7. Point the app at your new backend

In the Flutter app, `lib/core/constants/api_config.dart`:
```
const kBackendUrl = 'https://affora-api.buildwithhakeem.dev/api/v1';
```
Then rebuild the AAB. Also: in `src/main.ts`, CORS is currently `origin: '*'` —
fine for a mobile API, but tighten it if you ever add a web client.

> Google Sign-In note: the backend just *verifies* Google ID tokens, so changing
> the API host does NOT require new OAuth config. The Android client SHA-1 work
> (RELEASE.md step 3) is unrelated and still applies.

---

## 8. The update flow (every future deploy)

```
cd /home/affora/affora-backend
git pull
npm ci
npm run build
node scripts/migrate.js        # only if there are new migrations
pm2 reload affora-api          # zero-downtime restart
```

---

## 9. Don't skip these (ops responsibilities Render did for you)

- **Backups:** automate `pg_dump affora` to a daily cron + copy off-box. Render
  did this invisibly; now it's on you. Losing this DB = losing every user's data.
- **OS updates:** `sudo apt update && sudo apt upgrade` periodically; enable
  `unattended-upgrades` for security patches.
- **Monitoring:** keep the UptimeRobot monitor pointed at the new health URL.
- **Secrets:** `.env` lives only on the server, never in git.

---

## AWS specifically (you asked) — the NEW free tier (2025)

AWS replaced the old "12 months / 750 hours" model. What you're signing up for now:
- **Up to $200 in credits:** $100 on sign-up + up to $100 more by completing
  setup activities (one of which is "create a budget" — do it, see below).
- **Free account plan for up to 6 months**, OR until your credits run out —
  whichever comes first.
- **You can't be silently charged on the free plan.** It's credit-capped: when
  credits/time run out, resources pause until you opt into a paid plan. This is
  *safer* than the old tier's surprise-bill risk.

**An EC2 instance is a VPS** (Ubuntu + SSH), so **every step above applies
unchanged** and you get **zero cold starts**.

**The runway math:** a small always-on instance (**t4g.small**, ARM, ~$0.0168/hr
≈ $12/mo, or t3.micro ≈ $7.5/mo) + ~30 GB storage (~$3/mo) ≈ **$10–15/mo**. Your
$100–200 credits cover the full 6-month free window with room to spare — so for
this learning project it's **effectively free for 6 months**.

**Do these right after signup:**
1. **Complete the "Set up a budget" activity** — it both earns you credit AND
   creates your spend guardrail. Set a budget alert at a low $ amount.
2. Note your calendar **6 months out**: at that point either opt into the paid
   plan (~$10–15/mo, comparable to Render Starter) or tear the instance down and
   point `kBackendUrl` back at Render.

**Learning curve:** AWS is the steepest of the options — you'll meet IAM, VPC, and
**Security Groups** (AWS's firewall: open 22/80/443 there *instead of* `ufw`), plus
EBS for storage. More to learn, which is exactly why it's the most career-valuable.
If you want the gentle version first, do it once on Hetzner/DO, then repeat on EC2.

**Recommendation for *learning*:** AWS EC2 is the most career-valuable place to do
this. If you want the gentlest version first, do it on Hetzner/DO (cheaper, simpler,
better tutorials), then repeat on AWS EC2 once the concepts click — the only
differences are the firewall (Security Groups vs ufw) and the console.

> Reminder: none of this is needed to **launch**. For shipping V1, stay on Render
> ($7 Starter before public rollout). Do the VPS as a parallel learning project,
> then cut `kBackendUrl` over once it's solid and you've tested sign-in + sync.

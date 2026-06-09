#!/usr/bin/env bash
# Affora backend — safe deploy script (run ON the EC2 box).
#
#   ./deploy.sh
#
# Pulls the latest main, installs, builds (memory-capped so a 1 GB box can't
# OOM), runs migrations, reloads via pm2, then health-checks. If the new build
# is unhealthy it rolls the CODE back to the previous commit automatically.
#
# NOTE: database migrations are forward-only and are NOT auto-reverted on
# rollback (a code rollback + a new column is usually fine, but verify after any
# failed deploy that added a migration).
set -euo pipefail

# ── Config (override via env if needed) ──────────────────────────────────────
APP_DIR="${APP_DIR:-$HOME/reality-wallet-backend}"
PM2_NAME="${PM2_NAME:-affora-api}"
HEALTH_URL="${HEALTH_URL:-http://localhost:3000/api/v1/health}"
BUILD_MEM="${BUILD_MEM:-512}"                 # MB cap for the build (1 GB box safe)
BACKUP_SCRIPT="${BACKUP_SCRIPT:-$HOME/backup-affora.sh}"
HEALTH_RETRIES="${HEALTH_RETRIES:-10}"
HEALTH_DELAY="${HEALTH_DELAY:-3}"
BRANCH="${BRANCH:-main}"

log() { echo -e "\n\033[1;32m▶ $*\033[0m"; }
err() { echo -e "\n\033[1;31m✗ $*\033[0m" >&2; }

build() { NODE_OPTIONS="--max-old-space-size=$BUILD_MEM" npm run build; }
reload() { pm2 reload "$PM2_NAME" --update-env || pm2 start dist/src/main.js --name "$PM2_NAME"; }
healthy() { curl -fsS --max-time 5 "$HEALTH_URL" 2>/dev/null | grep -q '"status":"ok"'; }

cd "$APP_DIR"

# ── 0. Remember current commit (rollback target) ─────────────────────────────
PREV_COMMIT="$(git rev-parse HEAD)"
log "Current commit: $PREV_COMMIT"

# ── 1. Pre-deploy DB backup (best-effort) ────────────────────────────────────
if [ -x "$BACKUP_SCRIPT" ]; then
  log "Backing up the database before deploy…"
  "$BACKUP_SCRIPT" || err "Backup failed — continuing (backup is best-effort)"
fi

# ── 2. Fetch + move to exactly origin/$BRANCH ────────────────────────────────
log "Fetching latest…"
git fetch --all --prune
git reset --hard "origin/$BRANCH"             # deploy exactly what's on the branch
NEW_COMMIT="$(git rev-parse HEAD)"

if [ "$NEW_COMMIT" = "$PREV_COMMIT" ]; then
  log "Already up to date ($NEW_COMMIT). Nothing to deploy."
  exit 0
fi
log "Deploying $PREV_COMMIT → $NEW_COMMIT"

# ── 3. Install + build (memory-capped) ───────────────────────────────────────
log "Installing dependencies (npm ci)…"
npm ci
log "Building (cap ${BUILD_MEM} MB)…"
build

# ── 4. Migrate (idempotent; loads .env via dotenv) ───────────────────────────
log "Running migrations…"
node scripts/migrate.js

# ── 5. Reload the app ────────────────────────────────────────────────────────
log "Reloading $PM2_NAME…"
reload
pm2 save

# ── 6. Health check ──────────────────────────────────────────────────────────
log "Health-checking $HEALTH_URL…"
for i in $(seq 1 "$HEALTH_RETRIES"); do
  if healthy; then
    log "✅ Deploy healthy — now running $NEW_COMMIT"
    exit 0
  fi
  echo "  attempt $i/$HEALTH_RETRIES not healthy yet…"
  sleep "$HEALTH_DELAY"
done

# ── 7. Rollback (code + process; DB migrations are NOT reverted) ─────────────
err "Health check FAILED — rolling code back to $PREV_COMMIT"
git reset --hard "$PREV_COMMIT"
npm ci
build
reload
pm2 save
sleep "$HEALTH_DELAY"

if healthy; then
  err "Rolled back to $PREV_COMMIT and it's healthy again. Investigate the bad deploy ($NEW_COMMIT)."
  exit 1
else
  err "ROLLBACK ALSO UNHEALTHY — manual fix needed. Check:  pm2 logs $PM2_NAME --err"
  exit 2
fi

#!/usr/bin/env bash
set -euo pipefail

# Deploy homepage to a remote host via SSH
# Usage: ./deploy.sh [user@host] [remote_path]
#
# Examples:
#   ./deploy.sh ben@192.168.1.242
#   ./deploy.sh ben@192.168.1.242 /home/user/homepage
#
# Prerequisites:
#   - SSH key auth configured (run: ssh-copy-id user@host)
#   - rsync installed locally and on remote host
#   - pnpm installed on remote host

REMOTE_HOST="${1:-ben@192.168.1.242}"
REMOTE_PATH="${2:-/home/user/homepage}"
LOCAL_PATH="$(cd "$(dirname "$0")" && pwd)"

echo "==> Deploying homepage to ${REMOTE_HOST}:${REMOTE_PATH}"

# Sync files to remote, excluding build artifacts and dev files
echo "==> Syncing files..."
rsync -avz --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  --exclude config \
  --exclude package-lock.json \
  "${LOCAL_PATH}/" "${REMOTE_HOST}:${REMOTE_PATH}/"

# Install dependencies, build, and restart on the remote host
echo "==> Installing dependencies and building on remote..."
ssh "${REMOTE_HOST}" bash -s "${REMOTE_PATH}" << 'REMOTE_SCRIPT'
  set -euo pipefail
  REMOTE_PATH="$1"
  cd "${REMOTE_PATH}"

  echo "==> Installing dependencies..."
  pnpm install --frozen-lockfile || pnpm install

  echo "==> Building..."
  pnpm run build

  # Restart if running via pm2, systemd, or start fresh
  if command -v pm2 &>/dev/null && pm2 list | grep -q homepage; then
    echo "==> Restarting via pm2..."
    pm2 restart homepage
  elif systemctl is-active --quiet homepage 2>/dev/null; then
    echo "==> Restarting via systemd..."
    sudo systemctl restart homepage
  else
    echo "==> Build complete. Start the app with: cd ${REMOTE_PATH} && pnpm start"
  fi
REMOTE_SCRIPT

echo "==> Deploy complete!"

#!/bin/sh

set -e

# Default to root, so old installations won't break
export PUID=${PUID:-0}
export PGID=${PGID:-0}

# This is in attempt to preserve the original behavior of the Dockerfile,
# while also supporting the lscr.io /config directory
[ ! -d "/app/config" ] && ln -s /config /app/config

export HOMEPAGE_BUILDTIME=$(date +%s)

# Check ownership before chown
if [ -e /app/config ]; then
  CURRENT_UID=$(stat -c %u /app/config)
  CURRENT_GID=$(stat -c %g /app/config)

  if [ "$CURRENT_UID" -ne "$PUID" ] || [ "$CURRENT_GID" -ne "$PGID" ]; then
    echo "Fixing ownership of /app/config"
    if ! chown -R "$PUID:$PGID" /app/config 2>/dev/null; then
      echo "Warning: Could not chown /app/config; continuing anyway"
    fi
  else
    echo "/app/config already owned by correct UID/GID, skipping chown"
  fi
else
  echo "/app/config does not exist; skipping ownership check"
fi

# Ensure /app/config/logs exists and is owned
if [ -n "$PUID" ] && [ -n "$PGID" ]; then
  mkdir -p /app/config/logs 2>/dev/null || true
  if [ -d /app/config/logs ]; then
    LOG_UID=$(stat -c %u /app/config/logs)
    LOG_GID=$(stat -c %g /app/config/logs)
    if [ "$LOG_UID" -ne "$PUID" ] || [ "$LOG_GID" -ne "$PGID" ]; then
      echo "Fixing ownership of /app/config/logs"
      chown -R "$PUID:$PGID" /app/config/logs 2>/dev/null || echo "Warning: Could not chown /app/config/logs"
    fi
  fi
fi

if [ -d /app/.next ]; then
  CURRENT_UID=$(stat -c %u /app/.next)
  CURRENT_GID=$(stat -c %g /app/.next)

  if [ "$PUID" -ne 0 ] && ([ "$CURRENT_UID" -ne "$PUID" ] || [ "$CURRENT_GID" -ne "$PGID" ]); then
    echo "Fixing ownership of /app/.next"
    if ! chown -R "$PUID:$PGID" /app/.next 2>/dev/null; then
      echo "Warning: Could not chown /app/.next; continuing anyway"
    fi
  else
    echo "/app/.next already owned by correct UID/GID or running as root, skipping chown"
  fi
fi

# Drop privileges (when asked to) if root, otherwise run as current user
if [ "$(id -u)" == "0" ] && [ "${PUID}" != "0" ]; then
  su-exec ${PUID}:${PGID} "$@"
else
  exec "$@"
fi

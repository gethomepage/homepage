#!/bin/sh

set -e

# Default to root, so old installations won't break
export PUID=${PUID:-0}
export PGID=${PGID:-0}

# This is in attempt to preserve the original behavior of the Dockerfile,
# while also supporting the lscr.io /config directory
[ ! -d "/app/config" ] && ln -s /config /app/config

export HOMEPAGE_BUILDTIME=$(date +%s)

# Set privileges for /app but only if pid 1 user is root and we are dropping privileges.
# If container is run as an unprivileged user, it means owner already handled ownership setup on their own.
# Running chown in that case (as non-root) will cause error
[ "$(id -u)" == "0" ] && [ "${PUID}" != "0" ] && chown -R ${PUID}:${PGID} /app

# Drop privileges (when asked to) if root, otherwise run as current user
if [ "$(id -u)" == "0" ] && [ "${PUID}" != "0" ]; then
  su-exec ${PUID}:${PGID} "$@"
else
  exec "$@"
fi

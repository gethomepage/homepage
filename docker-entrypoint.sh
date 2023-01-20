#!/bin/sh

set -e

# This is in attempt to preserve the original behavior of the Dockerfile,
# while also supporting the lscr.io /config directory
[ ! -d "/app/config" ] && ln -s /config /app/config

node server.js

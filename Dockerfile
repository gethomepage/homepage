# syntax = docker/dockerfile:latest

# Install dependencies only when needed
FROM docker.io/node:18-alpine AS deps

WORKDIR /app

COPY --link package.json pnpm-lock.yaml* ./

SHELL ["/bin/ash", "-xeo", "pipefail", "-c"]
RUN apk add --no-cache libc6-compat \
 && apk add --no-cache --virtual .gyp python3 make g++ \
 && npm install -g pnpm

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store pnpm fetch | grep -v "cross-device link not permitted\|Falling back to copying packages from store"

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store pnpm install -r --offline

# Rebuild the source code only when needed
FROM docker.io/node:18-alpine AS builder
WORKDIR /app

ARG BUILDTIME
ARG VERSION
ARG REVISION

COPY --link --from=deps /app/node_modules ./node_modules/
COPY . .

SHELL ["/bin/ash", "-xeo", "pipefail", "-c"]
RUN npm run telemetry \
 && mkdir config \
 && NEXT_PUBLIC_BUILDTIME=$BUILDTIME NEXT_PUBLIC_VERSION=$VERSION NEXT_PUBLIC_REVISION=$REVISION npm run build

# Production image, copy all the files and run next
FROM docker.io/node:18-alpine AS runner
LABEL org.opencontainers.image.title "Homepage"
LABEL org.opencontainers.image.description "A self-hosted services landing page, with docker and service integrations."
LABEL org.opencontainers.image.url="https://github.com/gethomepage/homepage"
LABEL org.opencontainers.image.documentation='https://github.com/gethomepage/homepage/wiki'
LABEL org.opencontainers.image.source='https://github.com/gethomepage/homepage'
LABEL org.opencontainers.image.licenses='Apache-2.0'

ENV NODE_ENV production

WORKDIR /app

# Copy files from context (this allows the files to copy before the builder stage is done).
COPY --link --chown=1000:1000 package.json next.config.js ./
COPY --link --chown=1000:1000 /public ./public/

# Copy files from builder
COPY --link --from=builder --chown=1000:1000 /app/.next/standalone ./
COPY --link --from=builder --chown=1000:1000 /app/.next/static/ ./.next/static/
COPY --link --chmod=755 docker-entrypoint.sh /usr/local/bin/

RUN apk add --no-cache su-exec

ENV PORT 3000
EXPOSE $PORT

HEALTHCHECK --interval=10s --timeout=3s --start-period=20s \
  CMD wget --no-verbose --tries=1 --spider --no-check-certificate http://localhost:$PORT/api/healthcheck || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]

# syntax = docker/dockerfile:latest

# Install dependencies only when needed
FROM node:16-alpine AS deps

WORKDIR /app

COPY --link package.json pnpm-lock.yaml* ./

RUN <<EOF
    set -xe
    apk add --no-cache libc6-compat
    apk add --no-cache --virtual .gyp python3 make g++
EOF

RUN <<EOF
    set -xe
    yarn global add pnpm
    pnpm install
EOF

# Rebuild the source code only when needed
FROM node:16-alpine AS builder
WORKDIR /app

COPY --link --from=deps /app/node_modules ./node_modules/
COPY . .

RUN <<EOF
    set -xe
    yarn next telemetry disable
    npm run build
EOF

# Production image, copy all the files and run next
FROM node:16-alpine AS runner
LABEL org.opencontainers.image.title "Homepage"
LABEL org.opencontainers.image.description "A self-hosted services landing page, with docker and service integrations."
LABEL org.opencontainers.image.url="https://github.com/benphelps/homepage"
LABEL org.opencontainers.image.documentation='https://github.com/benphelps/homepage/wiki'
LABEL org.opencontainers.image.source='https://github.com/benphelps/homepage'
LABEL org.opencontainers.image.licenses='Apache-2.0'

ENV NODE_ENV production

WORKDIR /app

# Copy files from context
COPY --link package.json next.config.js ./
COPY --link --chmod=755 healthcheck.js ./
COPY --link /public ./public

# Copy files from builder
COPY --link --from=builder /app/.next/standalone ./
COPY --link --from=builder /app/.next/static/ ./.next/static/

HEALTHCHECK --interval=12s --timeout=12s --start-period=30s \  
    CMD node ./healthcheck.js

EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]

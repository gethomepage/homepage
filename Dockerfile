# syntax = docker/dockerfile:latest

# Install dependencies only when needed
FROM node:16-alpine AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

RUN <<EOF
    set -xe
    apk add --no-cache libc6-compat
    apk add --no-cache --virtual .gyp python3 make g++
    yarn global add pnpm
    pnpm install
EOF

# Rebuild the source code only when needed
FROM node:16-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
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

COPY --from=builder /app/next.config.js /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]

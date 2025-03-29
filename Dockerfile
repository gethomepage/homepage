# =========================
# Builder Stage
# =========================
FROM node:22-slim AS builder
WORKDIR /app

# Setup
RUN mkdir config
COPY --link package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile --prefer-offline

# Copy source
COPY . .

ARG CI
ARG BUILDTIME
ARG VERSION
ARG REVISION

# Make CI available in RUN steps
ENV CI=$CI

RUN pnpm run telemetry \
 && if [ "$CI" != "true" ]; then \
      NEXT_PUBLIC_BUILDTIME=$BUILDTIME \
      NEXT_PUBLIC_VERSION=$VERSION \
      NEXT_PUBLIC_REVISION=$REVISION \
      pnpm run build; \
    else \
      echo "✅ Using prebuilt .next from CI context"; \
    fi

# =========================
# Runtime Stage
# =========================
FROM node:22-alpine AS runner
LABEL org.opencontainers.image.title "Homepage"
LABEL org.opencontainers.image.description "A self-hosted services landing page, with docker and service integrations."
LABEL org.opencontainers.image.url="https://github.com/gethomepage/homepage"
LABEL org.opencontainers.image.documentation='https://github.com/gethomepage/homepage/wiki'
LABEL org.opencontainers.image.source='https://github.com/gethomepage/homepage'
LABEL org.opencontainers.image.licenses='Apache-2.0'

WORKDIR /app
ENV NODE_ENV=production

# Copy only necessary files from the build stage
COPY --link --from=builder --chown=1000:1000 /app/.next/standalone/ ./
COPY --link --from=builder --chown=1000:1000 /app/.next/static ./.next/static
COPY --link --from=builder --chown=1000:1000 /app/public ./public
COPY --link --from=builder --chmod=755 /app/docker-entrypoint.sh /usr/local/bin/

RUN apk add --no-cache su-exec

ENV HOSTNAME=0.0.0.0
ENV PORT=3000
EXPOSE $PORT

HEALTHCHECK --interval=10s --timeout=3s --start-period=20s \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:$PORT/api/healthcheck || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]

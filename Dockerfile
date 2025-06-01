# =========================
# Builder Stage
# =========================
FROM node:22-slim AS builder
WORKDIR /app

# Setup
RUN mkdir config
COPY . .

ARG CI
ARG BUILDTIME
ARG VERSION
ARG REVISION
ENV CI=$CI

# Install and build only outside CI
RUN if [ "$CI" != "true" ]; then \
      corepack enable && corepack prepare pnpm@latest --activate && \
      pnpm install --frozen-lockfile --prefer-offline && \
      NEXT_TELEMETRY_DISABLED=1 \
      NEXT_PUBLIC_BUILDTIME=$BUILDTIME \
      NEXT_PUBLIC_VERSION=$VERSION \
      NEXT_PUBLIC_REVISION=$REVISION \
      pnpm run build; \
    else \
      echo "✅ Using prebuilt app from CI context"; \
    fi

# =========================
# Runtime Stage
# =========================
FROM node:22-alpine AS runner
LABEL org.opencontainers.image.title="Homepage"
LABEL org.opencontainers.image.description="A self-hosted services landing page, with docker and service integrations."
LABEL org.opencontainers.image.url="https://github.com/gethomepage/homepage"
LABEL org.opencontainers.image.documentation='https://github.com/gethomepage/homepage/wiki'
LABEL org.opencontainers.image.source='https://github.com/gethomepage/homepage'
LABEL org.opencontainers.image.licenses='Apache-2.0'

# Setup
WORKDIR /app

# Copy some files from context
COPY --link --chown=1000:1000 /public ./public/
COPY --link --chmod=755 docker-entrypoint.sh /usr/local/bin/

# Copy only necessary files from the build stage
COPY --link --from=builder --chown=1000:1000 /app/.next/standalone/ ./
COPY --link --from=builder --chown=1000:1000 /app/.next/static/ ./.next/static

RUN apk add --no-cache su-exec iputils-ping shadow

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
EXPOSE $PORT

HEALTHCHECK --interval=10s --timeout=3s --start-period=20s \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:$PORT/api/healthcheck || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]

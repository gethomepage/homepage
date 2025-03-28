# Base build stage (for building Next.js if needed)
FROM node:22-alpine AS builder

WORKDIR /app

RUN mkdir config

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

COPY . .

ARG BUILDTIME
ARG VERSION
ARG REVISION

# Build only if needed (local use)
RUN pnpm run telemetry \
&& NEXT_PUBLIC_BUILDTIME=$BUILDTIME NEXT_PUBLIC_VERSION=$VERSION NEXT_PUBLIC_REVISION=$REVISION pnpm run build

# Final runtime image
FROM docker.io/node:22-alpine AS runner
LABEL org.opencontainers.image.title "Homepage"
LABEL org.opencontainers.image.description "A self-hosted services landing page, with docker and service integrations."
LABEL org.opencontainers.image.url="https://github.com/gethomepage/homepage"
LABEL org.opencontainers.image.documentation='https://github.com/gethomepage/homepage/wiki'
LABEL org.opencontainers.image.source='https://github.com/gethomepage/homepage'
LABEL org.opencontainers.image.licenses='Apache-2.0'

WORKDIR /app
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile --prod

# Copy pre-built assets from builder stage
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public

ENV HOSTNAME=0.0.0.0
ENV PORT=3000
EXPOSE $PORT

HEALTHCHECK --interval=10s --timeout=3s --start-period=20s \
  CMD wget --no-verbose --tries=1 --spider --no-check-certificate http://127.0.0.1:$PORT/api/healthcheck || exit 1

CMD ["pnpm", "start"]

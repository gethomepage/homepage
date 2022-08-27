FROM node:16-alpine AS base
LABEL org.opencontainers.image.title "Homepage"
LABEL org.opencontainers.image.description "A self-hosted services landing page, with docker and service integrations."
LABEL org.opencontainers.image.url="https://github.com/benphelps/homepage"
LABEL org.opencontainers.image.documentation='https://github.com/benphelps/homepage/wiki'
LABEL org.opencontainers.image.source='https://github.com/benphelps/homepage'
LABEL org.opencontainers.image.licenses='Apache-2.0'

# Install dependencies only when needed
FROM node:16-alpine AS deps
RUN apk add --no-cache libc6-compat
RUN apk add --no-cache --virtual .gyp python3 make g++
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN yarn global add pnpm
RUN pnpm install
RUN apk del .gyp

# Rebuild the source code only when needed
FROM node:16-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM node:16-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]

# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# KHI Dashboard — production image
#
# Build:
#   docker build \
#     --build-arg NEXT_PUBLIC_API_URL=/railway-proxy \
#     --build-arg NEXT_PUBLIC_SITE_URL=https://khi.krd \
#     --build-arg NEXT_PUBLIC_SITE_LABEL=KHI \
#     -t khi-dashboard .
#
# Run:
#   docker run -p 3000:3000 -e API_PROXY_TARGET=https://api.example.com khi-dashboard
#
# NEXT_PUBLIC_* values are inlined into the client bundle at BUILD time, so they
# are build args. API_PROXY_TARGET is read by the server at request time and
# must be passed to `docker run`, not to the build.
# ---------------------------------------------------------------------------

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app


# --- deps: install once, cached on the lockfile -----------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile


# --- builder ----------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL=/railway-proxy
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SITE_LABEL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_LABEL=$NEXT_PUBLIC_SITE_LABEL

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build


# --- runner -----------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# `standalone` bundles the traced server deps; static assets and public/ are
# not included in it and must be copied alongside.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]

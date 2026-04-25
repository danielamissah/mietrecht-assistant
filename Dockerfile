# Multi-stage Dockerfile for Mietrecht Assistant (Next.js + Groq API).
# Environment variables (GROQ_API_KEY, NEXT_PUBLIC_SANITY_PROJECT_ID, etc.)
# are injected at runtime — never baked into the image.

# ── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# ── Stage 2: Builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Build args allow CI to inject public env vars at build time.
# Server-side secrets (GROQ_API_KEY) are never passed as build args —
# they go in runtime env vars only.
ARG NEXT_PUBLIC_SANITY_PROJECT_ID
ARG NEXT_PUBLIC_SANITY_DATASET=production
ARG NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

ENV NEXT_PUBLIC_SANITY_PROJECT_ID=$NEXT_PUBLIC_SANITY_PROJECT_ID
ENV NEXT_PUBLIC_SANITY_DATASET=$NEXT_PUBLIC_SANITY_DATASET
ENV NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=$NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

RUN npm run dev

# ── Stage 3: Runner ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
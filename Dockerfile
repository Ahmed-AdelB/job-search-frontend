# JobFlow Frontend Dockerfile
# Author: Ahmed Adel Bakr Alderai
#
# CRITICAL FIX (2026-03-31):
# - Removed build-time NODE_ENV: Next.js standalone bakes optimizations at build time
#   Runtime NODE_ENV override doesn't affect optimization level
# - Kept NEXT_PUBLIC_API_URL as build arg: This MUST be set at build time for standalone
# - Added non-root user for security
# - Added explicit PORT/HOSTNAME configuration documentation

# Build stage
FROM node:22-alpine AS builder

# Required for native modules (lightningcss, etc.) on Alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies including platform-specific native binaries
RUN npm ci

# Copy source code
COPY . .

# Clean any existing build artifacts to ensure fresh build
RUN rm -rf .next .turbopack

# Accept NEXT_PUBLIC_* build args so they are baked into the JS bundle.
# CRITICAL: These are baked at build time and CANNOT be overridden at runtime in standalone mode.
# Use environment-specific image builds (e.g., docker build ... --build-arg NEXT_PUBLIC_API_URL=<url>)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build the application
# Next.js must output standalone mode (configured in next.config.mjs)
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output with proper permissions
COPY --chown=nextjs:nextjs --from=builder /app/.next/standalone ./
COPY --chown=nextjs:nextjs --from=builder /app/.next/static ./.next/static
COPY --chown=nextjs:nextjs --from=builder /app/public ./public

# Expose port (default 3001, override via docker compose environment)
EXPOSE 3001

# Configure Next.js startup
# PORT and HOSTNAME are read from environment at startup
# - PORT: defaults to 3001 (override via docker compose environment: PORT=4001)
# - HOSTNAME: defaults to 0.0.0.0 (all interfaces) or 127.0.0.1 (localhost only)
ENV PORT=3001
ENV HOSTNAME='0.0.0.0'

# NOTE: NODE_ENV is NOT set here. Docker runtime environment takes precedence.
# For Next.js standalone, build-time NODE_ENV is baked into optimization level.
# If you need development mode debugging, rebuild with:
#   docker build --build-arg NODE_ENV=development ...
# Or use the dev build from next dev server (slower, not standalone).

# Switch to non-root user
USER nextjs

# Use dumb-init to handle signals properly (PID 1 process)
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]

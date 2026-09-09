# ─── Stage 1: Build the Vite frontend ────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (layer caches unless package.json changes)
COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile

# Copy source and build
COPY . .
RUN npm run build

# ─── Stage 2: Production runtime ─────────────────────────────────────────────
FROM node:22-alpine AS runner

# Non-root user for security
RUN addgroup -S sastarx && adduser -S sastarx -G sastarx

WORKDIR /app

# Install only production dependencies for the Express server
COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile --omit=dev

# Copy compiled frontend assets
COPY --from=builder /app/dist ./dist

# Copy server source (tsx compiles at runtime; for production use esbuild bundle)
COPY src/server ./src/server
COPY src/data ./src/data
COPY src/types.ts ./src/types.ts
COPY tsconfig.json ./

# Environment defaults (override via Cloud Run --set-env-vars / --set-secrets)
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Cloud Run listens on 8080
EXPOSE 8080

# Switch to non-root user
USER sastarx

# Start the Express server (serves static dist/ + API on same port)
CMD ["node_modules/.bin/tsx", "src/server/index.ts"]

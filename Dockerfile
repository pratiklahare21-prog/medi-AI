# ─── Multi-stage Dockerfile for medi AI Monorepo ─────────────────────────────
# Stage 1: Build the Vite frontend
# Stage 2: Build the Express backend
# Stage 3: Production runtime serving both
# ─────────────────────────────────────────────────────────────────────────────

# ─── Stage 1: Build Frontend ─────────────────────────────────────────────────
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

# Install frontend dependencies
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --frozen-lockfile

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# ─── Stage 2: Prepare Backend ────────────────────────────────────────────────
FROM node:22-alpine AS backend-builder

WORKDIR /app/backend

# Install backend dependencies (including Prisma)
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --frozen-lockfile

# Copy backend source
COPY backend/ ./

# Generate Prisma client
RUN npx prisma generate

# ─── Stage 3: Production Runtime ─────────────────────────────────────────────
FROM node:22-alpine AS runner

# Non-root user for security
RUN addgroup -S sastarx && adduser -S sastarx -G sastarx

WORKDIR /app

# Copy backend with dependencies
COPY --from=backend-builder /app/backend ./backend

# Copy compiled frontend assets to backend for serving
COPY --from=frontend-builder /app/frontend/dist ./backend/dist

# Environment defaults (override via Cloud Run --set-env-vars / --set-secrets)
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Cloud Run listens on 8080
EXPOSE 8080

# Switch to non-root user
USER sastarx

WORKDIR /app/backend

# Start the Express server (serves static dist/ + API on same port)
CMD ["npm", "start"]


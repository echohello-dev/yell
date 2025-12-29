# Build stage
FROM node:24-bookworm-slim AS build
WORKDIR /app

# Set Bun environment
ENV BUN_INSTALL=/opt/bun \
	PATH=/opt/bun/bin:$PATH \
	NODE_ENV=production

# Install minimal build dependencies
RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
	ca-certificates \
	curl \
	unzip \
	&& rm -rf /var/lib/apt/lists* \
	&& curl -fsSL https://bun.sh/install | bash

# Copy package files first for better caching
COPY package.json bun.lock ./
COPY apps/web/package.json apps/web/package.json
COPY apps/mobile/package.json apps/mobile/package.json
COPY packages/shared/package.json packages/shared/package.json

# Install dependencies with frozen lockfile (strict versioning)
RUN bun install --frozen-lockfile

# Copy source and build
COPY . .

# Build shared package and web app
RUN bun run --cwd packages/shared build && \
	bun run --cwd apps/web build

# Runtime stage - minimal, hardened image
FROM node:24-bookworm-slim AS runtime
WORKDIR /app

# Security: Create non-root user with UID 1000 for running app
RUN groupadd -r -g 1000 appuser 2>/dev/null || true && \
	useradd -r -u 1000 -g appuser appuser 2>/dev/null || true

# Set environment variables
ENV NODE_ENV=production \
	PORT=3000 \
	BUN_INSTALL=/opt/bun \
	PATH=/opt/bun/bin:$PATH

# Install only runtime dependencies
RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
	ca-certificates \
	curl \
	unzip \
	&& rm -rf /var/lib/apt/lists/*

# Install Bun runtime
RUN curl -fsSL https://bun.sh/install | bash

# Copy built application from build stage
COPY --from=build --chown=1000:1000 /app /app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
	CMD curl -f http://localhost:3000/health || exit 1

# Security: Use non-root user (UID 1000)
USER 1000

EXPOSE 3000

WORKDIR /app/apps/web

# Use exec form to avoid shell
CMD ["bun", "run", "start"]

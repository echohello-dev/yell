FROM node:24-bookworm-slim AS build
WORKDIR /app

ENV BUN_INSTALL=/opt/bun
ENV PATH=$BUN_INSTALL/bin:$PATH

# Install dependencies first (better layer caching)
COPY package.json bun.lock ./
COPY apps/web/package.json apps/web/package.json
COPY apps/mobile/package.json apps/mobile/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates curl unzip \
	&& rm -rf /var/lib/apt/lists/* \
	&& curl -fsSL https://bun.sh/install | bash

RUN bun install --frozen-lockfile

# Copy the full repo and build
COPY . .

RUN bun run --cwd packages/shared build
RUN bun run --cwd apps/web build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

ENV BUN_INSTALL=/opt/bun
ENV PATH=$BUN_INSTALL/bin:$PATH

RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates curl unzip \
	&& rm -rf /var/lib/apt/lists/* \
	&& curl -fsSL https://bun.sh/install | bash

# Keep runtime simple: copy repo + deps + build outputs
COPY --from=build /app /app

EXPOSE 3000
WORKDIR /app/apps/web
CMD ["bun", "run", "start"]

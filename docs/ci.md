# CI

This repo uses GitHub Actions to validate builds for the monorepo.

## Workflows

- `.github/workflows/build.yml`
  - Runs on PRs and pushes to `main`
  - Uses Node.js 24 + Bun
  - Installs workspace deps (`bun install --frozen-lockfile`)
  - Builds `packages/shared` first (required by the web custom server)
  - Builds `apps/web` (Next.js)
  - Builds `apps/mobile` via `expo export` (artifact-style build, not store binaries)

## Local equivalents

- Web: `bun run build:web`
- Mobile export: `bun run build:mobile`

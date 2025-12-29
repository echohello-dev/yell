# CI

This repo uses GitHub Actions to validate builds for the monorepo.

## Workflows

- `.github/workflows/build.yml`
  - Runs on PRs and pushes to `main`
  - Uses mise for dependency and tool management (Node.js 24 + Bun)
  - Installs workspace deps via `mise run install`
  - Builds `packages/shared` first via `mise run build:shared` (required by the web custom server)
  - **Lint and Test Job**: Runs linting, unit tests, and E2E tests before building
    - `mise run lint` - ESLint checks
    - `mise run test` - Vitest unit tests
    - `mise run test:e2e` - Playwright E2E tests (Chromium only)
    - Uploads Playwright HTML report as artifact on failure
  - **Build Job**: Matrix build for `apps/web` (Next.js) and `apps/mobile` (Expo export)
    - Web: `mise run build:web`
    - Mobile: `mise run build:mobile` (artifact-style build, not store binaries)

- `.github/workflows/release.yml`
  - Runs on pushes to `main`
  - Uses Release Please to open/update the release PR and cut GitHub releases
  - Uses `GITHUB_TOKEN` (`github.token`)
    - Requires Settings → Actions → General → Workflow permissions → "Read and write permissions"
    - And Settings → Actions → General → Workflow permissions → "Allow GitHub Actions to create and approve pull requests"
  - If your org/repo blocks PR creation via `GITHUB_TOKEN`, use a PAT or fine-grained token instead (e.g. `RELEASE_PLEASE_TOKEN`) and wire it into the workflow.

## Deployment workflows

- `.github/workflows/deploy-web-ghcr.yml`
  - Deploys web app Docker image to GitHub Container Registry
  - Runs on pushes to `main` and tags matching `v*`
  - See [web-ghcr.md](./web-ghcr.md) for details

- `.github/workflows/deploy-mobile-eas.yml`
  - Publishes EAS Updates automatically
  - Runs on pushes to `main` and tags matching `v*`
  - See [mobile-eas.md](./mobile-eas.md) for details

## Local equivalents

- Install: `mise run install`
- Lint: `mise run lint`
- Test: `mise run test`
- Test E2E: `mise run test:e2e`
- Build all: `mise run build`
- Build web: `mise run build:web`
- Build mobile: `mise run build:mobile`
- Build shared: `mise run build:shared`
- Dev web: `mise run dev:web`
- Dev mobile: `mise run dev:mobile`

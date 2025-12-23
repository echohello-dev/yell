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

- `.github/workflows/release.yml`
  - Runs on pushes to `main`
  - Uses Release Please to open/update the release PR and cut GitHub releases
  - Uses `GITHUB_TOKEN` (`github.token`)
    - Requires Settings → Actions → General → Workflow permissions → "Read and write permissions"
    - And Settings → Actions → General → Workflow permissions → "Allow GitHub Actions to create and approve pull requests"
  - If your org/repo blocks PR creation via `GITHUB_TOKEN`, use a PAT or fine-grained token instead (e.g. `RELEASE_PLEASE_TOKEN`) and wire it into the workflow.

## Local equivalents

- Web: `bun run build:web`
- Mobile export: `bun run build:mobile`

# AGENTS.md (Guidance for Coding Agents)

This repo is a small monorepo for **Yell**, a live quiz platform:

- **Web**: Next.js App Router + a custom Socket.IO server (`apps/web/server.ts`)
- **Mobile**: Expo / React Native (`apps/mobile`)
- **Shared**: TypeScript types + utilities (`packages/shared`)

Use this document to make safe, minimal, verifiable changes.

## Quick start

### Prereqs

- Node 24+
- Bun

This repo includes a `.mise.toml` with tool versions and common tasks.

### Install

```bash
mise trust
mise run install
```

### Develop

```bash
mise run dev:web
mise run dev:mobile
```

### Lint / test

```bash
mise run lint
mise run test
```

### Build

```bash
mise run build           # Build both web and mobile
mise run build:web       # Build web only
mise run build:mobile    # Build mobile only
mise run build:shared    # Build shared package only
```

## Repository layout

- `apps/web` — Next.js web app (App Router) + Socket.IO server entrypoint
  - `app/api/*/route.ts` — API routes
  - `app/*/page.tsx` — pages (host/join/session/play/demo)
  - `app/join/JoinClient.tsx` — client-side join logic
  - `components/` — shared UI components
    - `BrandMark.tsx` — Yell logo/brand component
    - `GamePinForm.tsx` — reusable game pin input form
    - `ThemeToggle.tsx` — dark/light mode toggle
  - `hooks/useSocket.ts` — client socket hook
  - `server.ts` — custom server (runs Next + Socket.IO)
- `apps/mobile` — Expo client
- `packages/shared` — shared types/utilities published as a workspace package

## Development conventions

### Keep types in sync

- Shared domain shapes should live in `packages/shared/src/types.ts`.
- Web + mobile should import from `@yell/shared` instead of duplicating types.

If you change anything in `packages/shared`, run:

```bash
mise run build:shared
```

### Web server/runtime notes

- Web dev script runs `tsx server.ts` (not `next dev`).
- If you modify Socket.IO event contracts, update both:
  - server-side handlers (in `apps/web`)
  - clients (`apps/web/hooks/useSocket.ts` and `apps/mobile`)

### API routes

- API endpoints live under `apps/web/app/api/*/route.ts`.
- Prefer validating request bodies and returning clear errors.
- Keep handlers small; move shared parsing/validation into `packages/shared` when it’s truly shared.

### UI components

- Reusable UI components live in `apps/web/components/`.
- Use the `BrandMark` component for consistent branding across pages.
- Use the `GamePinForm` component for game pin entry.
- Use the `ThemeToggle` component for dark/light mode switching.
- Follow existing CSS patterns in `apps/web/app/globals.css` (CSS variables for theming).

### Style / scope

- Prefer small, surgical PRs.
- Don’t reformat unrelated files.
- Avoid introducing new heavy deps unless needed.
- When adding/modifying features, keep relevant docs in `./docs` up to date.

## Infra notes: Cloudflare Tunnel ↔ Traefik

These constraints are important to avoid TLS handshake issues and redirect loops:

- Cloudflare Tunnel to Traefik communication should use **HTTP**, not HTTPS.
- When using Cloudflare Tunnel with Traefik, set `http_host_header` in the tunnel config to match the Ingress rule host (example: `traefik-public.ingress`).
- Disable Traefik global HTTP→HTTPS redirection when the tunnel connects over HTTP (otherwise you can get redirect loops).

## What to run before/after changes

Before opening a PR, try to run (as applicable):

```bash
mise run lint
mise run test
mise run build:web
```

If you touched mobile-only code:

```bash
mise run dev:mobile
```

## Where to look first

- UI routes: `apps/web/app/**/page.tsx`
- UI components: `apps/web/components/*.tsx`
- Real-time wiring: `apps/web/server.ts` and `apps/web/hooks/useSocket.ts`
- Shared contracts: `packages/shared/src/types.ts` and `packages/shared/src/utils.ts`
- Styles/theming: `apps/web/app/globals.css`

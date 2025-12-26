# Web: Docker image published to GHCR

The web app is built and published as a container image to GitHub Container Registry (GHCR).

## What gets published

- Image: `ghcr.io/<owner>/<repo>/web`
- Source: `apps/web/Dockerfile`

## When it publishes

- On pushes to `main`
- On tags matching `v*`

Workflow: `.github/workflows/deploy-web-ghcr.yml`

## Running locally

Build:

- `docker build -f apps/web/Dockerfile -t yell-web:local .`

Run:

- `docker run --rm -p 3000:3000 -e PORT=3000 yell-web:local`

Notes:

- The image uses Node.js 24 and installs Bun inside the container for workspace dependency installs and to run the server.

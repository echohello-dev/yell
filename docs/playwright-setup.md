# Playwright E2E Testing Setup

## Summary

Playwright end-to-end testing has been successfully added to the Yell web application.

## What Was Added

### Dependencies

- `@playwright/test` - Installed in `apps/web/package.json`
- Chromium browser with system dependencies installed

### Configuration

- **[apps/web/playwright.config.ts](apps/web/playwright.config.ts)** - Main Playwright configuration
  - Configured to run tests against `http://localhost:3000`
  - Automatically starts dev server before tests
  - Chromium browser enabled by default
  - Firefox and WebKit available but commented out (can be enabled after installing)
  - HTML reporter for test results
  - Trace collection on first retry

### Test Files (in `apps/web/e2e/`)

1. **home.spec.ts** - Tests for home page
   - Branding and content display
   - Game pin input form
   - Navigation links
   - Theme toggle functionality

2. **host.spec.ts** - Tests for quiz creation
   - Quiz settings form
   - Question creation workflow
   - Multiple question types (multiple choice, poll, scale, numeric guess)
   - Adding/removing questions and options
   - Form validation

3. **navigation.spec.ts** - Cross-cutting tests
   - Navigation between pages
   - Responsive design (mobile/desktop)
   - Accessibility (heading hierarchy, form labels, keyboard navigation)

4. **README.md** - Documentation for E2E tests

### Scripts Added

#### package.json (`apps/web/package.json`)

- `test:e2e` - Run all E2E tests
- `test:e2e:ui` - Run tests in interactive UI mode
- `test:e2e:headed` - Run tests with visible browser
- `test:e2e:debug` - Debug tests with Playwright inspector

#### mise tasks (`.mise.toml`)

- `test:e2e` - Run E2E tests
- `test:e2e:ui` - Run tests in UI mode
- `test:e2e:headed` - Run tests in headed mode

### Other Changes

- **apps/web/.gitignore** - Added Playwright test results and cache directories
  - `/test-results/`
  - `/playwright-report/`
  - `/blob-report/`
  - `/playwright/.cache/`

## Running Tests

```bash
# Using mise (recommended)
mise run test:e2e

# Interactive UI mode
mise run test:e2e:ui

# See browser during tests
mise run test:e2e:headed

# Or directly with bun
cd apps/web
bun run test:e2e
```

## Test Results

✅ 22 tests passing

- All home page tests (5 tests)
- All host page quiz creation tests (11 tests)
- All navigation and accessibility tests (6 tests)

## Browser Support

- ✅ **Chromium** - Installed and configured (default)
- ⚠️ **Firefox** - Configuration ready, install with `bunx playwright install firefox`
- ⚠️ **WebKit** - Configuration ready, install with `bunx playwright install webkit`

## Next Steps

To enable cross-browser testing:

```bash
cd apps/web
bunx playwright install firefox webkit
```

Then uncomment the Firefox and WebKit projects in [playwright.config.ts](apps/web/playwright.config.ts).

## CI/CD Integration

The tests are configured to work in CI environments and are integrated into the GitHub Actions build workflow.

### CI Configuration

Tests run automatically on:

- Pull requests
- Pushes to main branch

The CI pipeline includes:

1. **Lint and Test Job** - Runs before build
   - Linting with ESLint
   - Unit tests with Vitest
   - E2E tests with Playwright (Chromium only)
   - Uploads Playwright HTML report as artifact on failure

2. **Build Job** - Runs after tests pass
   - Builds web and mobile apps

### CI-Specific Behavior

When `CI=true` is set (automatic in GitHub Actions):

- Retries failed tests twice
- Runs tests sequentially (1 worker) for stability
- Fails build if `test.only` is left in code
- Generates HTML report available as artifact

### Viewing Test Results in CI

If tests fail, the Playwright HTML report is uploaded as an artifact:

1. Go to the failed workflow run
2. Scroll to "Artifacts" section
3. Download `playwright-report`
4. Open `index.html` in a browser to see detailed test results and traces

### Local CI Simulation

To run tests as they would in CI:

```bash
CI=true mise run test:e2e
```

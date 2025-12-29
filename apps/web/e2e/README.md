# Playwright E2E Tests

This directory contains end-to-end tests for the Yell web application using Playwright.

## Running Tests

### Using mise (recommended)

```bash
# Run all E2E tests
mise run test:e2e

# Run tests with UI mode (interactive)
mise run test:e2e:ui

# Run tests in headed mode (see browser)
mise run test:e2e:headed
```

### Using bun directly

```bash
cd apps/web

# Run all tests
bun run test:e2e

# Run tests in UI mode
bun run test:e2e:ui

# Run tests in headed mode
bun run test:e2e:headed

# Debug a specific test
bun run test:e2e:debug
```

## Test Structure

- `home.spec.ts` - Tests for the home page, including navigation and game pin form
- `host.spec.ts` - Tests for the host page quiz creation workflow
- `navigation.spec.ts` - Tests for navigation between pages, responsive design, and accessibility

## Configuration

The Playwright configuration is in [playwright.config.ts](../playwright.config.ts) and includes:

- Automatic dev server startup before tests
- Tests run against `http://localhost:3000`
- Cross-browser testing (Chromium, Firefox, WebKit)
- Trace collection on first retry
- HTML report generation

## First Time Setup

After installing dependencies, you need to install Playwright browsers:

```bash
cd apps/web
bunx playwright install
```

Or with specific browsers:

```bash
bunx playwright install chromium firefox webkit
```

## Writing Tests

Follow Playwright best practices:

1. Use `test.describe()` to group related tests
2. Use `test.beforeEach()` for common setup
3. Use semantic selectors when possible (role, label, text)
4. Make tests independent and idempotent
5. Use `expect()` for assertions

Example:

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/my-page');
  });

  test('should do something', async ({ page }) => {
    await page.getByRole('button', { name: 'Click me' }).click();
    await expect(page.getByText('Success!')).toBeVisible();
  });
});
```

## CI/CD

Tests are configured to:

- Run in CI mode when `CI=true` is set
- Use 2 retries on CI
- Run with 1 worker (sequential) on CI
- Fail if `test.only` is left in code

## Debugging

Use the Playwright inspector for debugging:

```bash
bun run test:e2e:debug
```

Or add `await page.pause()` in your test code to pause execution.

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API](https://playwright.dev/docs/api/class-playwright)

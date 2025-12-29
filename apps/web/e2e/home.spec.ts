import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the home page with branding', async ({ page }) => {
    await page.goto('/');

    // Check for brand elements
    await expect(page.getByText('Join in.')).toBeVisible();
    await expect(page.getByText('Enter the game pin to jump into the live session.')).toBeVisible();

    // Check for navigation links
    await expect(page.getByRole('link', { name: 'Demo' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Host' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Join' })).toBeVisible();
  });

  test('should have game pin input form', async ({ page }) => {
    await page.goto('/');

    // Check for game pin input
    const pinInput = page.locator('input[type="text"]').first();
    await expect(pinInput).toBeVisible();
    await expect(pinInput).toHaveAttribute('placeholder', 'e.g., happy-tiger');
  });

  test('should navigate to host page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Create a quiz' }).click();
    await expect(page).toHaveURL('/host');
    await expect(page.getByText('Create a quiz')).toBeVisible();
  });

  test('should navigate to join page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'I have a pin' }).click();
    await expect(page).toHaveURL('/join');
  });

  test('should have theme toggle', async ({ page }) => {
    await page.goto('/');

    // Check for theme toggle button exists (button with svg icon)
    const themeToggle = page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .first();
    await expect(themeToggle).toBeVisible();
  });
});

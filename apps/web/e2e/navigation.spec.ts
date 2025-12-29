import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate between main pages', async ({ page }) => {
    // Start at home
    await page.goto('/');
    await expect(page).toHaveURL('/');

    // Navigate to host
    await page.getByRole('link', { name: 'Host' }).first().click();
    await expect(page).toHaveURL('/host');
    await expect(page.getByText('Create a quiz')).toBeVisible();

    // Navigate back to home
    await page.getByRole('link', { name: '← Home' }).click();
    await expect(page).toHaveURL('/');

    // Navigate to join
    await page.getByRole('link', { name: 'Join' }).first().click();
    await expect(page).toHaveURL('/join');
  });

  test('should navigate to demo page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Demo' }).click();
    await expect(page).toHaveURL('/demo');
  });
});

test.describe('Responsive Design', () => {
  test('should display mobile navigation on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');

    // Main content should still be visible
    await expect(page.getByText('Join in.')).toBeVisible();
  });

  test('should display desktop layout on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    // Desktop navigation should be visible
    await expect(page.getByRole('link', { name: 'Demo' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Host' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Join' })).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText('Join in.');
  });

  test('should have accessible form inputs', async ({ page }) => {
    await page.goto('/host');

    // Check for proper labels
    await expect(page.getByText('Quiz title')).toBeVisible();
    await expect(page.getByText('Prize mode')).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Focus should be visible on interactive elements
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

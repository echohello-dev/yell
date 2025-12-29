import { test, expect } from '@playwright/test';

test.describe('Host Page - Quiz Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/host');
  });

  test('should display quiz creation form', async ({ page }) => {
    await expect(page.getByText('Create a quiz')).toBeVisible();
    await expect(page.getByPlaceholder('e.g., Winter trivia night')).toBeVisible();
    await expect(page.getByText('Quiz settings')).toBeVisible();
  });

  test('should allow entering quiz title', async ({ page }) => {
    const titleInput = page.getByPlaceholder('e.g., Winter trivia night');
    await titleInput.fill('Test Quiz');
    await expect(titleInput).toHaveValue('Test Quiz');
  });

  test('should allow selecting prize mode', async ({ page }) => {
    const prizeSelect = page.locator('select').first();
    await prizeSelect.selectOption('random_raffle');
    await expect(prizeSelect).toHaveValue('random_raffle');
  });

  test('should display add question form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Add question' })).toBeVisible();
    await expect(page.getByPlaceholder('Enter your question…')).toBeVisible();
  });

  test('should allow creating a multiple choice question', async ({ page }) => {
    // Fill in question details
    await page.getByPlaceholder('Enter your question…').fill('What is 2 + 2?');

    // Fill in options
    const optionInputs = page.locator('input[placeholder^="Option"]');
    await optionInputs.nth(0).fill('3');
    await optionInputs.nth(1).fill('4');

    // Add the question
    await page.getByRole('button', { name: 'Add question' }).click();

    // Verify question was added
    await expect(page.getByText('What is 2 + 2?')).toBeVisible();
    await expect(page.getByText('1 question')).toBeVisible();
  });

  test('should allow adding multiple options to a question', async ({ page }) => {
    await page.getByPlaceholder('Enter your question…').fill('Pick a color');

    // Add extra options
    await page.getByRole('button', { name: 'Add option' }).click();
    await page.getByRole('button', { name: 'Add option' }).click();

    const optionInputs = page.locator('input[placeholder^="Option"]');
    await expect(optionInputs).toHaveCount(4); // 2 default + 2 added
  });

  test('should disable start session button when quiz is incomplete', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start session' });
    await expect(startButton).toBeDisabled();
  });

  test('should allow removing a question', async ({ page }) => {
    // Add a question first
    await page.getByPlaceholder('Enter your question…').fill('Test question');
    await page.getByRole('button', { name: 'Add question' }).click();

    // Verify it was added
    await expect(page.getByText('Test question')).toBeVisible();

    // Remove it
    await page.getByRole('button', { name: 'Remove' }).first().click();

    // Verify it was removed
    await expect(page.getByText('Test question')).not.toBeVisible();
  });

  test('should switch between question types', async ({ page }) => {
    const typeSelect = page.locator('select').nth(1); // Second select is question type

    // Switch to poll
    await typeSelect.selectOption('poll');
    await expect(typeSelect).toHaveValue('poll');

    // Switch to scale
    await typeSelect.selectOption('scale');
    await expect(typeSelect).toHaveValue('scale');
    await expect(page.getByPlaceholder('e.g., 1').first()).toBeVisible();
    await expect(page.getByPlaceholder('e.g., 10')).toBeVisible();

    // Switch to numeric_guess
    await typeSelect.selectOption('numeric_guess');
    await expect(typeSelect).toHaveValue('numeric_guess');
    await expect(page.getByPlaceholder('Enter the correct numeric answer…')).toBeVisible();
  });

  test('should have back to home link', async ({ page }) => {
    await page.getByRole('link', { name: '← Home' }).click();
    await expect(page).toHaveURL('/');
  });
});

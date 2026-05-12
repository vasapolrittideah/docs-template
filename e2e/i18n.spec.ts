import { test, expect } from '@playwright/test';

test.describe('i18n — Routing', () => {
  test('root "/" redirects to the default locale "/th/docs"', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/th\/docs/);
  });

  test('"/th" redirects to "/th/docs"', async ({ page }) => {
    await page.goto('/th');
    await expect(page).toHaveURL(/\/th\/docs/);
  });

  test('"/en" redirects to "/en/docs"', async ({ page }) => {
    await page.goto('/en');
    await expect(page).toHaveURL(/\/en\/docs/);
  });

  test('invalid locale renders a not found page (404) correctly', async ({ page }) => {
    const response = await page.goto('/en/xx');
    expect(response?.status()).toBe(404);
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText(/page not found/i)).toBeVisible();
  });
});

test.describe('i18n — Content per locale', () => {
  test('English locale shows English UI text', async ({ page }) => {
    await page.goto('/en/docs');
    // Search button label
    await expect(page.getByRole('button', { name: /search/i }).first()).toBeVisible();
  });

  test('Thai locale shows Thai UI text', async ({ page }) => {
    await page.goto('/th/docs');
    // Search button label in Thai
    await expect(page.getByRole('button', { name: /ค้นหา/i }).first()).toBeVisible();
  });

  test('English locale URL contains "/en/"', async ({ page }) => {
    await page.goto('/en/docs');
    await expect(page).toHaveURL(/\/en\//);
  });

  test('Thai locale URL contains "/th/"', async ({ page }) => {
    await page.goto('/th/docs');
    await expect(page).toHaveURL(/\/th\//);
  });
});

test.describe('i18n — Locale switcher', () => {
  test('switching from Thai to English updates the URL and UI', async ({ page }) => {
    await page.goto('/th/docs');
    await expect(page).toHaveURL(/\/th\/docs/);

    // Open locale switcher dropdown
    await page.getByTestId('locale-switcher').click();

    // Click "English" option
    await page.getByRole('menuitem', { name: 'English' }).click();

    // URL should now be under /en/
    await expect(page).toHaveURL(/\/en\//);

    // Search button should now be in English
    await expect(page.getByRole('button', { name: /search/i }).first()).toBeVisible();
  });

  test('switching from English to Thai updates the URL and UI', async ({ page }) => {
    await page.goto('/en/docs');
    await expect(page).toHaveURL(/\/en\/docs/);

    // Open locale switcher dropdown
    await page.getByTestId('locale-switcher').click();

    // Click "ภาษาไทย" option
    await page.getByRole('menuitem', { name: 'ภาษาไทย' }).click();

    // URL should now be under /th/
    await expect(page).toHaveURL(/\/th\//);

    // Search button should now be in Thai
    await expect(page.getByRole('button', { name: /ค้นหา/i }).first()).toBeVisible();
  });

  test('current locale is highlighted in the switcher', async ({ page }) => {
    await page.goto('/en/docs');

    // Open locale switcher dropdown
    await page.getByTestId('locale-switcher').click();

    // "English" item should be visually active (has a checkmark icon sibling)
    const englishItem = page.getByRole('menuitem', { name: 'English' });
    await expect(englishItem).toBeVisible();
    await expect(englishItem.locator('svg')).toBeVisible(); // RiCheckLine icon
  });
});

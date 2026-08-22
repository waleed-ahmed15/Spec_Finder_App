import { test, expect } from '@playwright/test';

test.describe('SpecFinder journeys', () => {
  test('requirement-led flow with specification export', async ({ page }) => {
    await page.goto('/products?fireMin=60&rwMin=50');

    await expect(page.getByText(/products meet your requirements/i)).toBeVisible({
      timeout: 15000,
    });

    await page
      .getByRole('button', { name: /add to specification/i })
      .first()
      .click();
    await page.getByRole('button', { name: /^Specification/i }).click();
    await expect(page.getByRole('dialog', { name: 'Specification list' })).toBeVisible();
  });

  test('material number search returns parent product', async ({ page }) => {
    await page.goto('/products');
    await page
      .getByRole('textbox', { name: /search products or material number/i })
      .fill('07600010');
    await expect(page.getByText(/products meet your requirements/i)).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText('Aurelith Standard 12.5')).toBeVisible();
  });

  test('mobile filters sheet applies requirements', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/products');
    await page.getByRole('button', { name: /filters/i }).click();
    const sheet = page.getByRole('dialog');
    await sheet.getByRole('button', { name: 'Fire resistance' }).click();
    await sheet.getByRole('radio', { name: 'EI 60' }).click();
    await expect(page.getByText(/products meet your requirements/i)).toBeVisible({
      timeout: 15000,
    });
  });
});

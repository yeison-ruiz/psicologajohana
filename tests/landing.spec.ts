import { test, expect } from '@playwright/test';

test('landing page loads correctly', async ({ page }) => {
  await page.goto('/');
  // Heading exists
  await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
  
  // Verify the CTA button
  const ctaButton = page.getByRole('link', { name: /Agendar Sesión/i }).first();
  await expect(ctaButton).toBeVisible();
});

test('navigation to blog works', async ({ page }) => {
  await page.goto('/');
  
  // Specifically target the link in the Header
  const blogLink = page.locator('nav').locator('a[href="/blog"]').first();
  await blogLink.click();
  
  await expect(page).toHaveURL(/\/blog/);
  await expect(page.locator('h1')).toContainText(/bienestar emocional/i);
});

test('booking page redirects to login when not authenticated', async ({ page }) => {
  await page.goto('/book');
  // Since it's protected, it should redirect to /login
  await expect(page).toHaveURL(/\/login/);
});

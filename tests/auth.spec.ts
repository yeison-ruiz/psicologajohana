import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('login page loads correctly', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.getByText('Bienvenido de nuevo')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Iniciar sesión/i })).toBeVisible();
  });

  test('shows error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.locator('input[name="email"]').fill('usuario@erroneo.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.getByRole('button', { name: /Iniciar sesión/i }).click();
    
    // Check for either the English or Spanish error message from Supabase
    // Or just check if the error container/toast is visible
    const errorMsg = page.getByText(/Invalid login credentials/i)
      .or(page.getByText(/Credenciales inválidas/i))
      .or(page.getByText(/Error/i));
      
    await expect(errorMsg.first()).toBeVisible({ timeout: 15000 });
  });

  test('toggle between login and signup', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByRole('button', { name: /Regístrate aquí/i }).click();
    await expect(page.getByText('Crea tu cuenta')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    
    await page.getByRole('button', { name: /Inicia sesión/i }).click();
    await expect(page.getByText('Bienvenido de nuevo')).toBeVisible();
  });
});

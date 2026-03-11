import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test('full booking flow for registered patient', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.locator('input[name="email"]').fill('test-paciente@example.com');
    await page.locator('input[name="password"]').fill('TestPassword123!');
    await page.getByRole('button', { name: /Iniciar sesión/i }).click();

    // 2. Dashboard check
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/Test Paciente Playwright/i)).toBeVisible();

    // 3. Navigate to booking
    await page.getByRole('link', { name: /Agendar/i }).first().click();
    await expect(page).toHaveURL(/\/book/);

    // 4. Select a date (Look for an available day - primary-50 class)
    // We try to find any enabled button in the calendar
    const availableDay = page.locator('button:not([disabled])').filter({ hasText: /^\d{1,2}$/ }).first();
    
    if (await availableDay.count() > 0) {
      await availableDay.click();

      // 5. Select a time slot
      const timeSlot = page.locator('button:has-text("AM")').or(page.locator('button:has-text("PM")')).first();
      await expect(timeSlot).toBeVisible({ timeout: 10000 });
      await timeSlot.click();

      // 6. Confirm Booking
      const confirmButton = page.getByRole('button', { name: /Confirmar Cita/i });
      await expect(confirmButton).toBeEnabled();
      await confirmButton.click();

      // 7. Should redirect to payment page
      await expect(page).toHaveURL(/\/paciente\/pagar/);
      await expect(page.getByText(/Subir Comprobante/i).or(page.getByText(/Confirmar Pago/i))).toBeVisible();
    } else {
      console.log('No available days found in the current month for testing.');
    }
  });
});

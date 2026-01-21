import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://countryclub.do/');
  await page.getByText('RESERVAS ONLINE').nth(1).hover();
  await page.getByRole('link', { name: 'RESERVAS DEPORTIVAS Y EVENTOS' }).click();
  await page.getByRole('link', { name: 'Reservar' }).click();
  await page.waitForTimeout(3000)
});
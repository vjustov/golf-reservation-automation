import 'dotenv/config'
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://countryclub.do/');
  await page.getByText('RESERVAS ONLINE').nth(1).hover();
  await page.getByRole('link', { name: 'RESERVAS DEPORTIVAS Y EVENTOS' }).click();
  await page.getByRole('link', { name: 'Reservar' }).click();
  const userField = await page.getByRole('textbox', { name: 'Usuario o email' });
  userField.fill(process.env.COUNTRY_CLUB_USERNAME)
  const passwordField = await page.getByRole('textbox', { name: 'Contraseña' });
  passwordField.fill(process.env.COUNTRY_CLUB_PASSWORD)
  page.locator('div').filter({ hasText: /^Entrar$/ }).nth(2).click();
    await page.waitForTimeout(3000)
});
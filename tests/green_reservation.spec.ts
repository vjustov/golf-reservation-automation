import 'dotenv/config'
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  // await page.goto('https://countryclub.do/');
    // await page.getByText('RESERVAS ONLINE').nth(1).hover();
  // await page.getByRole('link', { name: 'RESERVAS DEPORTIVAS Y EVENTOS' }).click();
  

  await page.goto('https://countryclub.golfmanager.com/system/page/landing');
  await page.getByRole('link', { name: 'Reservar' }).click();
  
  const userField = await page.getByRole('textbox', { name: 'Usuario o email' });
  await userField.fill(process.env.COUNTRY_CLUB_USERNAME)
  const passwordField = await page.getByRole('textbox', { name: 'Contraseña' });
  await passwordField.fill(process.env.COUNTRY_CLUB_PASSWORD)
  await page.locator('div').filter({ hasText: /^Entrar$/ }).nth(2).click();
  await page.getByText('Golf').click();
  await page.locator('.textIconInput > .icon').click();
  const dayOfTheMonth = (new Date()).getDate() + 1;
  await page.getByText(dayOfTheMonth.toString(), { exact: true }).click();

  const timeSlotWishlist = "7:40";
  await page.getByText(timeSlotWishlist).click();
  const child = page.getByText("GF 18H SOCIOS");
  await page.locator('div.resourceContent').filter({ has: child }).getByText("3").click();

  const memberIds = [6944,7818,6563];

  const memberFields = page.getByRole('textbox', { name: 'Identificador' });
  const count = await memberFields.count();
  for (let i = 0; i < count; ++i)
    await memberFields.nth(i).fill(memberIds[i].toString());

  await page.getByText("Confirmar").click();



  await page.waitForTimeout(300000)
});
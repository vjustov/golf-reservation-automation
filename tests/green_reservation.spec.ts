import 'dotenv/config'
import { test, expect } from '@playwright/test';
import fs from 'fs';

test('test', async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  const consoleLogs: string[] = [];
  page.on('console', msg => consoleLogs.push(`[${new Date().toISOString()}] [${msg.type()}] ${msg.text()}`));

  try {

    await page.goto('https://countryclub.golfmanager.com/system/page/landing');
    await page.getByRole('link', { name: 'Reservar' }).click();

    const userField = await page.getByRole('textbox', { name: 'Usuario o email' });
    await userField.fill(process.env.COUNTRY_CLUB_USERNAME);
    const passwordField = await page.getByRole('textbox', { name: 'Contraseña' });
    await passwordField.fill(process.env.COUNTRY_CLUB_PASSWORD);
    await page.locator('div').filter({ hasText: /^Entrar$/ }).nth(2).click();
    await page.getByText('Golf').click();
    await page.locator('.textIconInput > .icon').click();
    const dayOfTheMonth = new Date(Date.now() + 1000 * 3600 * 24).getDate();
    const todayAt8 = (new Date()).setHours(8, 0, 0, 0);
    await page.waitForTimeout(todayAt8 - Date.now());
    await page.getByText(dayOfTheMonth.toString(), { exact: true })
      .filter({ has: page.locator("xpath=ancestor::td[1]/preceding-sibling::td[1]//span[contains(@class,\"today\")]") }) // THIS FILTERS THE DAY OF THE MONTH TO THE ONE AFTER TODAY
      .click();

    const hourLocator = await page.locator(".hour").filter({ hasText: /(07:[45]0|08:[01]0|09:[345]0|10:40)/ }).first()
    const hourValue = hourLocator.innerText();
    hourLocator.click();
    console.log(`Selected hour: ${hourValue}`);
    const child = page.getByText("GF 18H");
    await page.locator('div.resourceContent').filter({ has: child }).getByText("3").click();

    // const memberIds = [6645, 7818, 6563];
    const memberIds = [6944, 7818, 3537];
    // const memberIds = [6944,6343,1668]; // 9:29
    // const memberIds = [4311,7377,4818]; // 9:34
    // const memberIds = [5162, 3176, 3537]; // 10:00



    const memberFields = await page.getByRole('textbox', { name: 'Identificador' }).all();
    for (let i = 0; i < memberFields.length; ++i)
      await memberFields[i].fill(memberIds[i].toString());

    await page.getByText("Confirmar").click();

    const errorPanel = page.locator(".confirmReservation > .errorPanel");
    if (await errorPanel.isVisible()) {
      const errorText = await errorPanel.innerText();
      // do something
    }

    await page.getByRole('checkbox').click();
    await page.getByText('Pagar', { exact: true }).click();


    await page.locator('#tokenizedCards').click();
    await page.getByText('**** 0263').click();
    await page.getByText('Pagar', { exact: true }).nth(1).dispatchEvent('click');

    await page.getByRole('textbox', { name: 'Nombre en la tarjeta' }).fill("Victor M Justo K");
    await page.getByRole('textbox', { name: 'Correo electrónico' }).fill("v.justo@claro.net.do");

    await page.pause();
  } catch (e) {
    console.log(e)
    await page.pause();
    // Do something if this is a timeout.
  } finally {
    const logPath = testInfo.outputPath('console.log');
    fs.writeFileSync(logPath, consoleLogs.join('\n'));
    console.log(`Console logs saved to: ${logPath}`);

    const videoPath = await page.video()?.path();
    if (videoPath) {
      console.log(`Video saved to: ${videoPath}`);
    }
  }

});

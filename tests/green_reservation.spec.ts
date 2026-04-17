import 'dotenv/config';
import { test, Page, Locator } from '@playwright/test';
import fs from 'fs';

const HOUR_PATTERN = /(07:[45]0|08:[01]0|09:[345]0|10:40)/;
const MEMBER_IDS = [6944, 7818, 3537];

test('test', async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  const consoleLogs: string[] = [];
  page.on('console', msg => consoleLogs.push(`[${new Date().toISOString()}] [${msg.type()}] ${msg.text()}`));

  try {
    await login(page);
    await waitUntil8am(page);
    await bookFirstAvailableHour(page);
    await pay(page);
  } catch (e) {
    console.log(e)
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

async function login(page: Page) {
  await page.goto('https://countryclub.golfmanager.com/system/page/landing');
  await page.getByRole('link', { name: 'Reservar' }).click();
  await page.getByRole('textbox', { name: 'Usuario o email' }).fill(process.env.COUNTRY_CLUB_USERNAME!);
  await page.getByRole('textbox', { name: 'Contraseña' }).fill(process.env.COUNTRY_CLUB_PASSWORD!);
  await page.locator('div').filter({ hasText: /^Entrar$/ }).nth(2).click();
  await page.getByText('Golf').click();
}

async function waitUntil8am(page: Page) {
  const todayAt8 = new Date().setHours(8, 0, 0, 0);
  await page.waitForTimeout(todayAt8 - Date.now());
}

async function selectDate(page: Page) {
  await page.locator('.textIconInput > .icon').click();
  const tomorrow = new Date(Date.now() + 1000 * 3600 * 24).getDate();
  await page.getByText(tomorrow.toString(), { exact: true })
    .filter({ has: page.locator("xpath=ancestor::td[1]/preceding-sibling::td[1]//span[contains(@class,\"today\")]") }) // THIS FILTERS THE DAY OF THE MONTH TO THE ONE AFTER TODAY
    .click();
}

async function bookFirstAvailableHour(page: Page) {
  await selectDate(page);
  const hourLocators = await page.locator(".hour").filter({ hasText: HOUR_PATTERN }).all();

  for (let i = 0; i < hourLocators.length; i++) {
    if (i > 0) await selectDate(page);
    if (await attemptHour(page, hourLocators[i])) return;
  }

  throw new Error('No available hours found');
}

async function attemptHour(page: Page, hourLocator: Locator): Promise<boolean> {
  const hourValue = await hourLocator.innerText();
  await hourLocator.click();
  console.log(`Selected hour: ${hourValue}`);

  const child = page.getByText("GF 18H");
  await page.locator('div.resourceContent').filter({ has: child }).getByText("3").click();

  const memberFields = await page.getByRole('textbox', { name: 'Identificador' }).all();
  for (let i = 0; i < memberFields.length; ++i)
    await memberFields[i].fill(MEMBER_IDS[i].toString());

  await page.getByText("Confirmar").click();

  const errorPanel = page.locator(".confirmReservation > .errorPanel");
  if (await errorPanel.isVisible()) {
    console.log(`Error at ${hourValue}: ${await errorPanel.innerText()}`);
    return false;
  }

  return true;
}

async function pay(page: Page) {
  await page.getByRole('checkbox').click();
  await page.getByText('Pagar', { exact: true }).click();
  await page.locator('#tokenizedCards').click();
  await page.getByText('**** 0263').click();
  await page.getByText('Pagar', { exact: true }).nth(1).dispatchEvent('click');
  await page.getByRole('textbox', { name: 'Nombre en la tarjeta' }).fill("Victor M Justo K");
  await page.getByRole('textbox', { name: 'Correo electrónico' }).fill("v.justo@claro.net.do");
  await page.pause();
}

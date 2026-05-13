import { Locator, Page } from '@playwright/test';

export async function typeHumanLike(
  locator: Locator,
  text: string,
  minDelayMs = 120,
  maxDelayMs = 280
): Promise<void> {
  for (const char of text.split('')) {
    const delay = Math.floor(Math.random() * (maxDelayMs - minDelayMs)) + minDelayMs;
    await locator.type(char, { delay });
  }
}

export async function moveMouseNaturally(page: Page): Promise<void> {
  await page.mouse.move(
    200 + Math.random() * 100,
    200 + Math.random() * 100,
    { steps: 10 }
  );
  await page.mouse.wheel(0, Math.random() * 150 + 50);
}

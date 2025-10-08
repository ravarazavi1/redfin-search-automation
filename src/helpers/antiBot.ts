import { Page } from '@playwright/test';

export async function applyAntiBotHeaders(page: Page) {
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Upgrade-Insecure-Requests': '1'
  });

  // Mimic human typing with random delay
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
  await delay(Math.random() * 500 + 250);
}
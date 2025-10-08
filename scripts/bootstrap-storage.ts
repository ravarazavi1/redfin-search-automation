import { chromium } from '@playwright/test';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://www.redfin.com', { waitUntil: 'domcontentloaded' });
  console.log('✅ Opened Redfin homepage — please wait 5 seconds...');
  await page.waitForTimeout(5000);

  const storage = await page.context().storageState();
  fs.writeFileSync('storageState.json', JSON.stringify(storage, null, 2));
  console.log('💾 Saved session to storageState.json');

  await browser.close();
})();
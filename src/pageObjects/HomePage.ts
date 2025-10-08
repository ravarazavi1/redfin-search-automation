import { Page, Locator, expect } from '@playwright/test';


export class HomePage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Stable locators confirmed via Redfin DOM
    this.searchInput = page.locator('#search-box-input:enabled').first();
    this.searchButton = page.locator('button[data-rf-test-name="searchButton"]').first();
  }

async navigate() {
  // Small delay before navigation to avoid rate limits
  await this.page.waitForTimeout(1500);
  await this.page.goto('https://www.redfin.com', { waitUntil: 'domcontentloaded' });

  // Anti-bot hardening BEFORE doing anything else
  await this.page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });
  await this.page.setExtraHTTPHeaders({
    'accept-language': 'en-US,en;q=0.9',
    'referer': 'https://www.google.com/',
    'sec-ch-ua-platform': '"macOS"',
    'sec-ch-ua':
      '"Chromium";v="125", "Google Chrome";v="125", "Not.A/Brand";v="24"'
  });

  // Light, random interactions to look human
  await this.page.mouse.move(200 + Math.random() * 50, 300 + Math.random() * 50, { steps: 10 });
  await this.page.waitForTimeout(500 + Math.random() * 300);

  // Handle cookie banner and confirm search box ready
  await this.handleCookieBanner();
  await expect(this.searchInput).toBeVisible({ timeout: 15000 });
  console.log(' Navigated to Redfin homepage and search box is visible');
}

  async handleCookieBanner() {
    try {
      const frame = this.page.frameLocator('iframe[title="Cookies and your choices banner"]');
      const close = frame.locator('button.onetrust-close-btn-handler');
      await close.waitFor({ state: 'visible', timeout: 4000 });
      await close.click();
      console.log(' Cookie banner closed');
    } catch {
      console.log('No cookie banner found');
    }
  }

  async search(location: string) {
    // 🧠 1. Pretend to be a real user before interacting
    await this.page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
    await this.page.setExtraHTTPHeaders({
      'accept-language': 'en-US,en;q=0.9',
      'referer': 'https://www.google.com/',
      'sec-ch-ua-platform': '"macOS"',
      'sec-ch-ua': '"Chromium";v="125", "Google Chrome";v="125", "Not.A/Brand";v="24"'
    });

    // 🖱️ 2. Make small mouse and scroll movements before interacting
    await this.page.mouse.move(200, 200, { steps: 10 });
    await this.page.waitForTimeout(500);
    await this.page.mouse.wheel(0, 200);
    await this.page.waitForTimeout(500);

    // 💬 3. Focus the input and type naturally
    await expect(this.searchInput).toBeVisible({ timeout: 10000 });
    await this.searchInput.focus();
    await this.page.waitForTimeout(300);
 // Click safely — if an overlay is blocking, close it first
try {
  await this.searchInput.click({ trial: true, timeout: 2000 });
} catch {
  console.warn(' Click intercepted — closing possible Oops overlay...');
  await this.page.locator('button:has-text("×")').click({ timeout: 2000 }).catch(() => {});
  await this.page.waitForTimeout(1500);
}
await this.searchInput.click({ timeout: 4000 });

    // 👤 4. Type each character slowly to look human
    for (const char of location.split('')) {
      await this.searchInput.type(char, { delay: 220 + Math.random() * 150 });
    }

    // 💡 Small pause before clicking
    await this.page.waitForTimeout(800);
    await expect(this.searchButton).toBeEnabled();
    await this.searchButton.click();
    console.log(` Human-like search triggered for: ${location}`);

// ⚠️ 5. Detect and close “Oops” popup if it appears
const errorDialog = this.page.locator('text=An error occurred while searching');
if (await errorDialog.isVisible({ timeout: 3000 }).catch(() => false)) {
  console.warn(' Detected anti-bot Oops popup, retrying once...');
  await this.page.locator('button:has-text("×")').click({ timeout: 2000 }).catch(() => {});
  await this.page.waitForTimeout(2500);

  // Retry only once
  const retried = this.page.locator('#search-box-input:enabled').first();
  const currentValue = (await retried.inputValue().catch(() => '')).trim();

  if (!currentValue.includes(location)) {
    await this.searchInput.fill(location);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(5000);
    console.log(`Retried search manually for: ${location}`);
  } else {
    console.log('Skipping redundant retry, input already matches location.');
  }
}
  }

  async searchSlowly(location: string) {
    await this.searchInput.waitFor({ state: 'visible', timeout: 10000 });
    for (const char of location.split('')) {
      await this.searchInput.type(char, { delay: 250 });
    }
    await this.searchButton.click();
    console.log(`Slowly typed and searched for ${location}`);
  }

  async emptySearchAttempt() {
    await this.searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.searchButton.click();
    console.log(' Clicked search with empty input');
  }
}
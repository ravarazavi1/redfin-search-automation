import { Page, Locator, expect } from '@playwright/test';
import { randomDelay } from '../helpers/antiBot';
import { typeHumanLike, moveMouseNaturally } from '../helpers/humanTyping';
import { Logger } from '../helpers/logger';

export class HomePage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  private readonly logger: Logger;

  constructor(page: Page, logger: Logger) {
    this.page = page;
    this.logger = logger;
    this.searchInput = page.locator('#search-box-input:enabled').first();
    this.searchButton = page.locator('button[data-rf-test-name="searchButton"]').first();
  }

  async navigate(): Promise<void> {
    await randomDelay(1000, 2000);
    await this.page.goto('https://www.redfin.com', { waitUntil: 'domcontentloaded' });
    await moveMouseNaturally(this.page);
    await randomDelay(400, 700);
    await this.closeCookieBanner();
    await expect(this.searchInput).toBeVisible({ timeout: 15000 });
    this.logger.lineLog('Navigated to Redfin homepage');
  }

  async search(query: string, mode: 'human' | 'slow' | 'fill' = 'human'): Promise<void> {
    await moveMouseNaturally(this.page);
    await randomDelay(400, 700);
    await expect(this.searchInput).toBeVisible({ timeout: 10000 });
    await this.searchInput.focus();
    await randomDelay(200, 400);

    try {
      await this.searchInput.click({ trial: true, timeout: 2000 });
    } catch {
      this.logger.warn('Click intercepted — closing overlay');
      await this.page.locator('button:has-text("×")').click({ timeout: 2000 }).catch(() => {});
      await randomDelay(1200, 2000);
    }
    await this.searchInput.click({ timeout: 4000 });

    if (mode === 'fill') {
      await this.searchInput.fill(query);
    } else if (mode === 'slow') {
      await typeHumanLike(this.searchInput, query, 200, 380);
    } else {
      await typeHumanLike(this.searchInput, query, 120, 280);
    }

    await randomDelay(600, 1000);
    await expect(this.searchButton).toBeEnabled();
    await this.searchButton.click();
    this.logger.lineLog(`Search triggered: "${query}" (mode: ${mode})`);
  }

  async clickSearchWithoutTyping(): Promise<void> {
    await expect(this.searchInput).toBeVisible({ timeout: 10000 });
    await this.searchButton.click();
    this.logger.lineLog('Search button clicked with empty input');
  }

  async isOopsDialogVisible(): Promise<boolean> {
    return this.page.locator('text=An error occurred while searching')
      .isVisible({ timeout: 500 })
      .catch(() => false);
  }

  async closeOopsDialog(): Promise<void> {
    // Escape is the most reliable way to dismiss Redfin's modal
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(600);

    // Also attempt clicking the close button via the known CSS class
    for (const sel of ['.bp-DialogHeader button', '.DialogWrapper button', '[aria-label*="close" i]']) {
      const btn = this.page.locator(sel).first();
      if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
        await btn.click({ timeout: 1000 }).catch(() => {});
        break;
      }
    }

    // Wait for the modal to fully disappear before proceeding
    await this.page.locator('.DialogWrapper').waitFor({ state: 'hidden', timeout: 6000 }).catch(() => {});
    await randomDelay(600, 1200);
  }

  async fillAndEnter(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await randomDelay(400, 700);
    await this.page.keyboard.press('Enter');
    this.logger.lineLog(`Retry search submitted: "${query}"`);
  }

  private async closeCookieBanner(): Promise<void> {
    try {
      const frame = this.page.frameLocator('iframe[title="Cookies and your choices banner"]');
      const btn = frame.locator('button.onetrust-close-btn-handler');
      await btn.waitFor({ state: 'visible', timeout: 4000 });
      await btn.click();
      this.logger.lineLog('Cookie banner closed');
    } catch {
      // no banner — proceed normally
    }
  }
}

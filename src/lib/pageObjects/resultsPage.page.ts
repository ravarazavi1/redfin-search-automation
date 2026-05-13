import { Page, Locator } from '@playwright/test';
import { Logger } from '../helpers/logger';

export class ResultsPage {
  readonly page: Page;
  readonly headerLocator: Locator;
  readonly searchBarLocator: Locator;
  readonly oopsDialog: Locator;
  private readonly logger: Logger;

  constructor(page: Page, logger: Logger) {
    this.page = page;
    this.logger = logger;
    this.headerLocator = page.locator('[data-rf-test-id="h1-header"]');
    // No :enabled constraint — the dialog overlay disables the input but it still exists
    this.searchBarLocator = page.locator('#search-box-input').first();
    this.oopsDialog = page.locator('text=An error occurred while searching');
  }

  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await this.waitForLoad();
    this.logger.lineLog(`Navigated directly to: ${url}`);
  }

  async isCloudFrontBlocked(): Promise<boolean> {
    const h1 = await this.page.locator('h1').first().textContent({ timeout: 2000 }).catch(() => '');
    return h1?.includes('403') || h1?.includes('ERROR') || false;
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    // Allow the page to stabilize — results, blocked state, or homepage
    await this.page.waitForTimeout(2000);
  }

  async getHeaderText(): Promise<string | null> {
    const visible = await this.headerLocator.isVisible().catch(() => false);
    if (!visible) return null;
    return this.headerLocator.textContent();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async getSearchInputValue(): Promise<string> {
    return this.searchBarLocator.inputValue().catch(() => '');
  }

  async isOopsDialogVisible(): Promise<boolean> {
    return this.oopsDialog.isVisible({ timeout: 500 }).catch(() => false);
  }

  async closeOopsDialog(): Promise<void> {
    await this.page.locator('button:has-text("×")').click({ timeout: 2000 }).catch(() => {});
  }

  async retrySearchAfterBlock(query: string): Promise<void> {
    this.logger.warn('Anti-bot block detected — retrying search');
    await this.closeOopsDialog();
    await this.page.waitForTimeout(3000);
    await this.searchBarLocator.fill(query);
    await this.page.mouse.move(400 + Math.random() * 100, 250);
    await this.page.waitForTimeout(400);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(5000);
  }
}

import { test as base } from '@playwright/test';
import { PageRegistry } from '../pageObjects/pageRegistry.index';
import { Logger } from '../helpers/logger';
import type { BrowserSetupOptions } from '../interface/interface.index';

type BrowserFixture = {
  logger: Logger;
  pages: PageRegistry;
  browserSetupOptions: BrowserSetupOptions;
};

/**
 * Custom fixture that wires page objects and logger into every test.
 *
 * Fixture chain:
 *   browserSetupOptions (from scenario via test.use())
 *       → logger (structured, CI-aware)
 *           → pages (PageRegistry with homePage + resultsPage)
 *
 * Usage in spec:
 *   test('...', async ({ pages, logger }) => { ... })
 */
export const test = base.extend<BrowserFixture>({
  browserSetupOptions: [{ skipStorageState: false }, { option: true }],

  logger: async ({}, use) => {
    await use(new Logger());
  },

  pages: async ({ page, logger }, use) => {
    // ── Stealth setup — must happen before the first goto() ─────────────────
    //
    // addInitScript fires on EVERY navigation for the lifetime of this page,
    // including the very first goto(). setExtraHTTPHeaders applies to all
    // outgoing requests from this point forward, including the initial HTML load.

    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined, configurable: true });
      (window as any).chrome = { runtime: {}, loadTimes: () => {}, csi: () => {}, app: {} };
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      const origQuery = window.navigator.permissions.query.bind(navigator.permissions);
      (navigator.permissions as any).query = (p: any) =>
        p.name === 'notifications'
          ? Promise.resolve({ state: Notification.permission } as PermissionStatus)
          : origQuery(p);
    });

    await page.setExtraHTTPHeaders({
      'accept-language': 'en-US,en;q=0.9',
      'referer': 'https://www.google.com/',
      'sec-ch-ua-platform': '"macOS"',
      'sec-ch-ua': '"Chromium";v="125", "Google Chrome";v="125", "Not.A/Brand";v="24"',
    });

    await use(new PageRegistry(page, logger));
  },
});

export { expect } from '@playwright/test';

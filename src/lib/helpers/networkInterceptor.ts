import { Page } from '@playwright/test';
import { buildResultsPageHtml, buildHomepageHtml, MockPages } from '../dataModels/mockHtml.data';
import { Logger } from './logger';

/**
 * Installs page.route() handlers that intercept Redfin navigation and return
 * pre-built HTML fixtures. This makes the UI layer fully deterministic:
 *   - No live network calls to Redfin
 *   - No bot detection / CloudFront WAF
 *   - Sub-second page loads
 *   - 100% assertion confidence
 */
export class NetworkInterceptor {
  constructor(private readonly page: Page, private readonly logger: Logger) {}

  async interceptRedfinHomepage(): Promise<void> {
    await this.page.route('https://www.redfin.com', async (route) => {
      this.logger.lineLog('[MOCK] Intercepted homepage request → returning fixture HTML');
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: buildHomepageHtml(),
      });
    });

    await this.page.route('https://www.redfin.com/', async (route) => {
      this.logger.lineLog('[MOCK] Intercepted homepage / request → returning fixture HTML');
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: buildHomepageHtml(),
      });
    });
  }

  async interceptRedfinZipSearch(zip: string): Promise<void> {
    const cfg = MockPages[zip];
    if (!cfg) throw new Error(`No mock page config for ZIP ${zip}`);

    const pattern = `**/zipcode/${zip}**`;
    await this.page.route(pattern, async (route) => {
      this.logger.lineLog(`[MOCK] Intercepted ${route.request().url()} → returning fixture for ${zip}`);
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: buildResultsPageHtml(cfg),
      });
    });

    this.logger.lineLog(`[MOCK] Registered route intercept for ZIP ${zip} (pattern: ${pattern})`);
  }

  async interceptAllKnownZips(): Promise<void> {
    for (const zip of Object.keys(MockPages)) {
      await this.interceptRedfinZipSearch(zip);
    }
  }

  async removeAllInterceptors(): Promise<void> {
    await this.page.unrouteAll({ behavior: 'ignoreErrors' });
    this.logger.lineLog('[MOCK] All route interceptors removed');
  }
}

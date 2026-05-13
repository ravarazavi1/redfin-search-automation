import type { PageContext } from '../../interface/interface.index';
import type { SearchResultDto } from '../../interface/interface.index';
import { NetworkInterceptor } from '../../helpers/networkInterceptor';

export class MockedSearchWorkflows {

  /**
   * Intercepts the Redfin ZIP results URL with a fixture, navigates to it,
   * and returns the same SearchResultDto shape as the live workflow.
   * Zero anti-bot risk — 100% deterministic.
   */
  static async navigateMockedZipPage(
    context: PageContext,
    zip: string,
  ): Promise<SearchResultDto> {
    context.logger.lineLog(`\n--- Mocked ZIP Search: ${zip} ---`);

    const interceptor = new NetworkInterceptor(context.pages.resultsPage.page, context.logger);
    await interceptor.interceptRedfinZipSearch(zip);

    const url = `https://www.redfin.com/zipcode/${zip}/`;
    await context.pages.resultsPage.navigateTo(url);

    const headerText       = await context.pages.resultsPage.getHeaderText();
    const currentUrl       = await context.pages.resultsPage.getCurrentUrl();
    const searchInputValue = await context.pages.resultsPage.getSearchInputValue();

    const dto: SearchResultDto = { headerText, currentUrl, searchInputValue, blockedByAntiBot: false };
    context.logger.jsonLog(dto, '<-- SearchResultDto (mocked)');
    return dto;
  }

  /**
   * Intercepts the homepage, navigates, then simulates pressing search without
   * a query — asserts the page doesn't navigate away.
   */
  static async mockedEmptySearchValidation(context: PageContext): Promise<{ finalUrl: string; staysOnHomepage: boolean }> {
    context.logger.lineLog('\n--- Mocked Empty Search Validation ---');

    const interceptor = new NetworkInterceptor(context.pages.homePage.page, context.logger);
    await interceptor.interceptRedfinHomepage();

    await context.pages.homePage.navigate();
    await context.pages.homePage.clickSearchWithoutTyping();
    await context.pages.resultsPage.waitForLoad();

    const finalUrl        = await context.pages.resultsPage.getCurrentUrl();
    const staysOnHomepage = finalUrl.replace(/\/$/, '') === 'https://www.redfin.com';

    context.logger.jsonLog({ finalUrl, staysOnHomepage }, '<-- NavigationResultDto (mocked)');
    return { finalUrl, staysOnHomepage };
  }
}

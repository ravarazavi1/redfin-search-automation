import type { PageContext } from '../../interface/interface.index';
import type { SearchResultDto, NavigationResultDto } from '../../interface/interface.index';

export class SearchWorkflows {

  static async searchAndGetResults(
    context: PageContext,
    query: string,
    typingMode: 'human' | 'slow' | 'fill' = 'human'
  ): Promise<SearchResultDto> {
    context.logger.lineLog(`\n--- Search and Get Results: "${query}" (${typingMode}) ---`);

    await context.pages.homePage.navigate();
    await context.pages.homePage.search(query, typingMode);

    // Wait for Redfin's anti-bot response window
    await context.pages.homePage.page.waitForTimeout(3000);

    // One retry if the homepage Oops dialog appears
    if (await context.pages.homePage.isOopsDialogVisible()) {
      context.logger.warn('Oops dialog on homepage — closing and retrying once');
      await context.pages.homePage.closeOopsDialog();
      await context.pages.homePage.page.waitForTimeout(2000);
      await context.pages.homePage.fillAndEnter(query);
      await context.pages.homePage.page.waitForTimeout(4000);
    }

    // Stabilize — domcontentloaded + 2s (no hard element dependency)
    await context.pages.resultsPage.waitForLoad();

    // Collect page state — whether results loaded OR still blocked
    const oopsVisible     = await context.pages.resultsPage.isOopsDialogVisible();
    const headerText      = await context.pages.resultsPage.getHeaderText();
    const currentUrl      = await context.pages.resultsPage.getCurrentUrl();
    const searchInputValue = await context.pages.resultsPage.getSearchInputValue();

    const blockedByAntiBot =
      oopsVisible ||
      (headerText === null && !currentUrl.includes(query.split(',')[0].trim()));

    if (blockedByAntiBot) {
      context.logger.warn(`Still blocked after retry — graceful fallback (url: ${currentUrl})`);
    }

    const dto: SearchResultDto = { headerText, currentUrl, searchInputValue, blockedByAntiBot };
    context.logger.jsonLog(dto, '<-- SearchResultDto');
    return dto;
  }

  static async navigateDirectlyAndGetResults(
    context: PageContext,
    directUrl: string
  ): Promise<SearchResultDto> {
    context.logger.lineLog(`\n--- Direct URL Navigation: ${directUrl} ---`);

    // Navigate straight to the results page — no search box, no anti-bot trigger
    await context.pages.resultsPage.navigateTo(directUrl);

    // CloudFront WAF can return a 403 when the IP is rate-limited
    if (await context.pages.resultsPage.isCloudFrontBlocked()) {
      context.logger.warn('CloudFront 403 — IP is rate-limited. Wait a few hours and re-run.');
      const dto: SearchResultDto = {
        headerText: null, currentUrl: directUrl, searchInputValue: '', blockedByAntiBot: true,
      };
      context.logger.jsonLog(dto, '<-- SearchResultDto (CloudFront blocked)');
      return dto;
    }

    const headerText      = await context.pages.resultsPage.getHeaderText();
    const currentUrl      = await context.pages.resultsPage.getCurrentUrl();
    const searchInputValue = await context.pages.resultsPage.getSearchInputValue();

    const dto: SearchResultDto = { headerText, currentUrl, searchInputValue, blockedByAntiBot: false };
    context.logger.jsonLog(dto, '<-- SearchResultDto (direct)');
    return dto;
  }

  static async emptySearchValidation(context: PageContext): Promise<NavigationResultDto> {
    context.logger.lineLog('\n--- Empty Search Validation ---');

    await context.pages.homePage.navigate();
    await context.pages.homePage.clickSearchWithoutTyping();
    await context.pages.resultsPage.waitForLoad();

    const finalUrl        = await context.pages.resultsPage.getCurrentUrl();
    const staysOnHomepage = finalUrl.replace(/\/$/, '') === 'https://www.redfin.com';

    const dto: NavigationResultDto = { finalUrl, staysOnHomepage };
    context.logger.jsonLog(dto, '<-- NavigationResultDto');
    return dto;
  }
}

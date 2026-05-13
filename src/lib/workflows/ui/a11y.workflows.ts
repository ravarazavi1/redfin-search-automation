import AxeBuilder from '@axe-core/playwright';
import type { PageContext } from '../../interface/interface.index';
import type { A11yResultDto, A11yViolationSummary } from '../../interface/interface.index';
import { NetworkInterceptor } from '../../helpers/networkInterceptor';

export interface A11yAuditOptions {
  disableRules?: string[];
  includedImpacts?: ('critical' | 'serious' | 'moderate' | 'minor')[];
  tags?: string[];
}

export class A11yWorkflows {

  /**
   * Navigates to a mocked Redfin ZIP results page, runs a full axe-core
   * audit, and returns a structured DTO. The network intercept guarantees
   * the same HTML on every run — violations are deterministic and stable.
   */
  static async auditMockedZipPage(
    context: PageContext,
    zip: string,
    opts: A11yAuditOptions = {},
  ): Promise<A11yResultDto> {
    context.logger.lineLog(`\n--- A11y Audit: Mocked ZIP ${zip} results page ---`);

    const interceptor = new NetworkInterceptor(context.pages.resultsPage.page, context.logger);
    await interceptor.interceptRedfinZipSearch(zip);

    const url = `https://www.redfin.com/zipcode/${zip}/`;
    await context.pages.resultsPage.navigateTo(url);

    return A11yWorkflows._runAxe(context, url, opts);
  }

  /**
   * Navigates to the mocked Redfin homepage and audits it.
   */
  static async auditMockedHomepage(
    context: PageContext,
    opts: A11yAuditOptions = {},
  ): Promise<A11yResultDto> {
    context.logger.lineLog('\n--- A11y Audit: Mocked homepage ---');

    const interceptor = new NetworkInterceptor(context.pages.homePage.page, context.logger);
    await interceptor.interceptRedfinHomepage();

    await context.pages.homePage.navigate();
    const url = context.pages.homePage.page.url();

    return A11yWorkflows._runAxe(context, url, opts);
  }

  private static async _runAxe(
    context: PageContext,
    url: string,
    opts: A11yAuditOptions,
  ): Promise<A11yResultDto> {
    const page = context.pages.resultsPage.page;

    let builder = new AxeBuilder({ page });

    if (opts.tags?.length) {
      builder = builder.withTags(opts.tags);
    }
    if (opts.disableRules?.length) {
      builder = builder.disableRules(opts.disableRules);
    }
    if (opts.includedImpacts?.length) {
      builder = builder.withTags(['wcag2a', 'wcag2aa']);
    }

    const results = await builder.analyze();

    const violations: A11yViolationSummary[] = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact ?? null,
      description: v.description,
      helpUrl: v.helpUrl,
      nodeCount: v.nodes.length,
    }));

    const count = (impact: string) =>
      violations.filter((v) => v.impact === impact).length;

    const dto: A11yResultDto = {
      url,
      violationCount: violations.length,
      criticalCount:  count('critical'),
      seriousCount:   count('serious'),
      moderateCount:  count('moderate'),
      minorCount:     count('minor'),
      violations,
      passCount:      results.passes.length,
      incompleteCount: results.incomplete.length,
    };

    if (dto.violationCount > 0) {
      context.logger.warn(
        `[A11y] ${dto.violationCount} violation(s) on ${url}:\n` +
        dto.violations.map((v) => `  [${v.impact}] ${v.id} — ${v.description} (${v.nodeCount} node(s))`).join('\n'),
      );
    } else {
      context.logger.lineLog(`[A11y] ✓ Zero violations on ${url} (${dto.passCount} rules passed)`);
    }

    context.logger.jsonLog(dto, '<-- A11yResultDto');
    return dto;
  }
}

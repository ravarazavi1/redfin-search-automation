import { test } from '@fixtures/browser.fixture';
import { scenarios } from './search.scenarios';
import { SearchWorkflows } from '@workflows/ui/search.workflows';
import {
  assertSearchResults,
  assertNavigationResult,
  type SearchExpectedResults,
  type NavigationExpectedResults,
} from '@workflows/ui/searchAssertions.assertions';
import type { PageContext } from '@interface/interface.index';

test.describe('Redfin Search — Regression Suite', {
  tag: ['@search', '@ui'],
  annotation: [{ type: 'Environment', description: 'Production' }],
}, () => {
  // Serial prevents anti-bot rate limiting between scenarios
  test.describe.configure({ mode: 'serial' });

  for (const scenario of scenarios) {
    if (scenario.skip) continue;

    test.describe(`${scenario.testRailId} — ${scenario.testName}`, () => {
      test.use({ browserSetupOptions: scenario.browserSetupOptions ?? {} });

      test(scenario.testName, {
        tag: scenario.tags,
        annotation: [{ type: 'TestRail', description: scenario.testRailId }],
      }, async ({ pages, logger }) => {

        const context: PageContext = { pages, logger };

        // ── direct-url-results ──────────────────────────────────────────────
        if (scenario.workflow === 'direct-url-results') {
          const { directUrl } = scenario.actionsData!;
          let result!: Awaited<ReturnType<typeof SearchWorkflows.navigateDirectlyAndGetResults>>;

          await test.step(`[NAVIGATE] Direct URL: ${directUrl}`, async () => {
            result = await SearchWorkflows.navigateDirectlyAndGetResults(context, directUrl!);
          });

          await test.step('[ASSERT] Validate results page content', async () => {
            assertSearchResults(result, scenario.expectedResults as SearchExpectedResults);
          });
        }

        // ── search-and-validate ─────────────────────────────────────────────
        if (scenario.workflow === 'search-and-validate') {
          const { query = '', typingMode = 'human' } = scenario.actionsData!;
          let result!: Awaited<ReturnType<typeof SearchWorkflows.searchAndGetResults>>;

          await test.step(`[NAVIGATE + SEARCH] "${query}" (mode: ${typingMode})`, async () => {
            result = await SearchWorkflows.searchAndGetResults(context, query, typingMode);
          });

          await test.step('[ASSERT] Validate search results', async () => {
            assertSearchResults(result, scenario.expectedResults as SearchExpectedResults);
          });
        }

        // ── empty-search-validation ─────────────────────────────────────────
        if (scenario.workflow === 'empty-search-validation') {
          let result!: Awaited<ReturnType<typeof SearchWorkflows.emptySearchValidation>>;

          await test.step('[NAVIGATE + EMPTY SEARCH] Click search with no query', async () => {
            result = await SearchWorkflows.emptySearchValidation(context);
          });

          await test.step('[ASSERT] Validate stays on homepage', async () => {
            assertNavigationResult(result, scenario.expectedResults as NavigationExpectedResults);
          });
        }
      });
    });
  }
});

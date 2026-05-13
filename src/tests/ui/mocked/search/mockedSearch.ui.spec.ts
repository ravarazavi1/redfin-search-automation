import { test } from '@fixtures/browser.fixture';
import { mockedScenarios } from './mockedSearch.scenarios';
import { MockedSearchWorkflows } from '@workflows/ui/mockedSearch.workflows';
import {
  assertSearchResults,
  assertNavigationResult,
  type SearchExpectedResults,
  type NavigationExpectedResults,
} from '@workflows/ui/searchAssertions.assertions';
import type { PageContext } from '@interface/interface.index';

test.describe('Redfin Search — Network Mocked Suite', {
  tag: ['@search', '@mocked'],
  annotation: [
    { type: 'Environment', description: 'Mocked (page.route() — no live Redfin traffic)' },
    { type: 'Purpose', description: 'Deterministic UI assertions via fixture HTML — zero bot detection risk' },
  ],
}, () => {
  test.describe.configure({ mode: 'serial' });

  for (const scenario of mockedScenarios) {
    if (scenario.skip) continue;

    test.describe(`${scenario.testRailId} — ${scenario.testName}`, () => {

      test(scenario.testName, {
        tag: scenario.tags,
        annotation: [{ type: 'TestRail', description: scenario.testRailId }],
      }, async ({ pages, logger }) => {

        const context: PageContext = { pages, logger };

        // ── mocked-zip-results ─────────────────────────────────────────────
        if (scenario.workflow === 'mocked-zip-results') {
          const { zip } = scenario.actionsData!;
          let result!: Awaited<ReturnType<typeof MockedSearchWorkflows.navigateMockedZipPage>>;

          await test.step(`[MOCK] Intercept + navigate to ZIP ${zip} fixture page`, async () => {
            result = await MockedSearchWorkflows.navigateMockedZipPage(context, zip!);
          });

          await test.step('[ASSERT] Validate mocked results page content', async () => {
            assertSearchResults(result, scenario.expectedResults as SearchExpectedResults);
          });
        }

        // ── mocked-empty-search ────────────────────────────────────────────
        if (scenario.workflow === 'mocked-empty-search') {
          let result!: Awaited<ReturnType<typeof MockedSearchWorkflows.mockedEmptySearchValidation>>;

          await test.step('[MOCK] Intercept homepage + click search with no query', async () => {
            result = await MockedSearchWorkflows.mockedEmptySearchValidation(context);
          });

          await test.step('[ASSERT] Validate stays on homepage', async () => {
            assertNavigationResult(result, scenario.expectedResults as NavigationExpectedResults);
          });
        }
      });
    });
  }
});

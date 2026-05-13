import { test } from '@fixtures/browser.fixture';
import { a11yScenarios } from './a11y.scenarios';
import { A11yWorkflows } from '@workflows/ui/a11y.workflows';
import {
  assertA11y,
  type A11yExpectedResults,
} from '@workflows/ui/a11yAssertions.assertions';
import type { PageContext } from '@interface/interface.index';

test.describe('Redfin Search — Accessibility Audit Suite', {
  tag: ['@a11y', '@accessibility'],
  annotation: [
    { type: 'Standard', description: 'WCAG 2.1 AA (axe-core)' },
    { type: 'Environment', description: 'Mocked (page.route() — deterministic fixtures)' },
  ],
}, () => {
  test.describe.configure({ mode: 'serial' });

  for (const scenario of a11yScenarios) {
    if (scenario.skip) continue;

    test.describe(`${scenario.testRailId} — ${scenario.testName}`, () => {

      test(scenario.testName, {
        tag: scenario.tags,
        annotation: [{ type: 'TestRail', description: scenario.testRailId }],
      }, async ({ pages, logger }) => {

        const context: PageContext = { pages, logger };
        const { pageType, zip, auditOptions } = scenario.actionsData!;

        let result!: Awaited<ReturnType<typeof A11yWorkflows.auditMockedZipPage>>;

        if (pageType === 'homepage') {
          await test.step('[A11Y] Audit mocked Redfin homepage', async () => {
            result = await A11yWorkflows.auditMockedHomepage(context, auditOptions);
          });
        } else {
          await test.step(`[A11Y] Audit mocked ZIP ${zip} results page`, async () => {
            result = await A11yWorkflows.auditMockedZipPage(context, zip!, auditOptions);
          });
        }

        await test.step('[ASSERT] Validate accessibility compliance', async () => {
          assertA11y(result, scenario.expectedResults as A11yExpectedResults);
        });
      });
    });
  }
});

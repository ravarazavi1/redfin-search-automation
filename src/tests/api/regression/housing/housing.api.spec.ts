import { test } from '@fixtures/api.fixture';
import { housingScenarios } from './housing.scenarios';
import { LocationDataWorkflows } from '@workflows/api/housingData.workflows';
import {
  assertHousingData,
  type HousingExpectedResults,
} from '@workflows/api/housingAssertions.assertions';
import type { ApiContext } from '@interface/interface.index';

test.describe('Location Geocoding API — Regression Suite', {
  tag: ['@api', '@geocoding'],
  annotation: [
    { type: 'Environment', description: 'Production (nominatim.openstreetmap.org)' },
    { type: 'Purpose', description: 'Validate ZIP-to-city resolution — critical pre-condition for real estate search' },
  ],
}, () => {
  // Serial to respect Nominatim's 1 req/sec rate limit
  test.describe.configure({ mode: 'serial' });

  for (const scenario of housingScenarios) {
    if (scenario.skip) continue;

    test.describe(`${scenario.testRailId} — ${scenario.testName}`, () => {

      test(scenario.testName, {
        tag: scenario.tags,
        annotation: [{ type: 'TestRail', description: scenario.testRailId }],
      }, async ({ apis, logger }) => {

        const context: ApiContext = { apis, logger };
        const { zip } = scenario.actionsData!;

        let result!: Awaited<ReturnType<typeof LocationDataWorkflows.getLocationByZip>>;

        await test.step(`[API] GET Nominatim location for ZIP ${zip}`, async () => {
          result = await LocationDataWorkflows.getLocationByZip(context, zip);
        });

        await test.step('[ASSERT] Validate geocoding response', async () => {
          assertHousingData(result, scenario.expectedResults as HousingExpectedResults);
        });
      });
    });
  }
});

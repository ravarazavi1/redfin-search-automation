import type { BaseTestScenario } from '@interface/interface.index';
import type { SearchExpectedResults, NavigationExpectedResults } from '@workflows/ui/searchAssertions.assertions';
import type { HousingExpectedResults } from '@workflows/api/housingAssertions.assertions';

type MockedWorkflowType =
  | 'mocked-zip-results'
  | 'mocked-empty-search';

interface MockedActionsData {
  zip?: string;
}

export type MockedSearchScenario = BaseTestScenario<
  MockedWorkflowType,
  SearchExpectedResults | NavigationExpectedResults,
  MockedActionsData
>;

export const mockedScenarios: MockedSearchScenario[] = [
  {
    testName: '[Mocked] ZIP 22304 results page shows Alexandria header and search input',
    tags: ['@search', '@mocked', '@regression', '@zip-search', '@happyPath'],
    testRailId: 'SRCH-TC-M001',
    workflow: 'mocked-zip-results',
    actionsData: { zip: '22304' },
    expectedResults: {
      resultsContainText: 'Alexandria',
      urlContains: '/zipcode/22304',
    },
  },
  {
    testName: '[Mocked] ZIP 22201 results page shows Arlington header and search input',
    tags: ['@search', '@mocked', '@regression', '@zip-search', '@happyPath'],
    testRailId: 'SRCH-TC-M002',
    workflow: 'mocked-zip-results',
    actionsData: { zip: '22201' },
    expectedResults: {
      resultsContainText: 'Arlington',
      urlContains: '/zipcode/22201',
    },
  },
  {
    testName: '[Mocked] ZIP 98101 results page shows Seattle header and search input',
    tags: ['@search', '@mocked', '@regression', '@zip-search', '@happyPath'],
    testRailId: 'SRCH-TC-M003',
    workflow: 'mocked-zip-results',
    actionsData: { zip: '98101' },
    expectedResults: {
      resultsContainText: 'Seattle',
      urlContains: '/zipcode/98101',
    },
  },
  {
    testName: '[Mocked] Empty search stays on Redfin homepage',
    tags: ['@search', '@mocked', '@regression', '@validation', '@negative'],
    testRailId: 'SRCH-TC-M004',
    workflow: 'mocked-empty-search',
    actionsData: {},
    expectedResults: { staysOnHomepage: true },
  },
];

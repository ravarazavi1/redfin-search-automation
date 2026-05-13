import type { BaseTestScenario } from '@interface/interface.index';
import type {
  SearchExpectedResults,
  NavigationExpectedResults,
} from '@workflows/ui/searchAssertions.assertions';
import { ZipCodes, Cities, DirectUrls } from '@dataModels/searchQueries.data';

// ─── Type definitions ───────────────────────────────────────────────────────

type SearchWorkflowType =
  | 'search-and-validate'
  | 'empty-search-validation'
  | 'direct-url-results';

interface SearchActionsData {
  query?: string;
  typingMode?: 'human' | 'slow' | 'fill';
  directUrl?: string;
}

export type SearchTestScenario = BaseTestScenario<
  SearchWorkflowType,
  SearchExpectedResults | NavigationExpectedResults,
  SearchActionsData
>;

// ─── Scenarios ──────────────────────────────────────────────────────────────

export const scenarios: SearchTestScenario[] = [

  // ── Direct URL — bypasses search box, asserts real results ──────────────
  {
    testName: 'Direct URL — ZIP 22304 results page shows Alexandria listings',
    tags: ['@search', '@regression', '@direct-url', '@zip-search', '@happyPath'],
    testRailId: 'SRCH-TC-006',
    workflow: 'direct-url-results',
    actionsData: { directUrl: DirectUrls.zip_22304_alexandria },
    expectedResults: { resultsContainText: '22304', urlContains: '/zipcode/22304' },
  },
  {
    testName: 'Direct URL — ZIP 22201 results page shows Arlington listings',
    tags: ['@search', '@regression', '@direct-url', '@zip-search', '@happyPath'],
    testRailId: 'SRCH-TC-007',
    workflow: 'direct-url-results',
    actionsData: { directUrl: DirectUrls.zip_22201_arlington },
    expectedResults: { resultsContainText: '22201', urlContains: '/zipcode/22201' },
  },
  {
    testName: 'Direct URL — ZIP 98101 results page shows Seattle listings',
    tags: ['@search', '@regression', '@direct-url', '@zip-search', '@happyPath'],
    testRailId: 'SRCH-TC-008',
    workflow: 'direct-url-results',
    actionsData: { directUrl: DirectUrls.zip_98101_seattle },
    expectedResults: { resultsContainText: '98101', urlContains: '/zipcode/98101' },
  },

  // ── Search-box flows — demonstrate anti-bot handling pattern ────────────
  {
    testName: 'Search-box ZIP 22304 — human-like typing with anti-bot resilience',
    tags: ['@search', '@regression', '@zip-search', '@happyPath'],
    testRailId: 'SRCH-TC-001',
    workflow: 'search-and-validate',
    actionsData: { query: ZipCodes.alexandria, typingMode: 'human' },
    expectedResults: { resultsContainText: ZipCodes.alexandria },
  },
  {
    testName: 'Search-box city Alexandria VA — human-like typing with anti-bot resilience',
    tags: ['@search', '@regression', '@city-search', '@happyPath'],
    testRailId: 'SRCH-TC-002',
    workflow: 'search-and-validate',
    actionsData: { query: Cities.alexandria, typingMode: 'human' },
    expectedResults: { resultsContainText: 'Alexandria' },
  },
  {
    testName: 'Empty search does not navigate away from homepage',
    tags: ['@search', '@regression', '@validation', '@negative'],
    testRailId: 'SRCH-TC-003',
    workflow: 'empty-search-validation',
    actionsData: {},
    expectedResults: { staysOnHomepage: true },
  },
  {
    testName: 'Slow-typed ZIP 22304 — simulates human typing cadence',
    tags: ['@search', '@regression', '@slow-type', '@anti-bot'],
    testRailId: 'SRCH-TC-004',
    workflow: 'search-and-validate',
    actionsData: { query: ZipCodes.alexandria, typingMode: 'slow' },
    expectedResults: { resultsContainText: ZipCodes.alexandria },
  },
];

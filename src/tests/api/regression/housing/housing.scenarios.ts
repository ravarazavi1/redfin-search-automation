import type { BaseTestScenario } from '@interface/interface.index';
import type { HousingExpectedResults } from '@workflows/api/housingAssertions.assertions';
import { CensusZips } from '@dataModels/censusQueries.data';

type LocationWorkflowType = 'get-location-by-zip';

interface LocationActionsData {
  zip: string;
}

export type LocationApiScenario = BaseTestScenario<
  LocationWorkflowType,
  HousingExpectedResults,
  LocationActionsData
>;

export const housingScenarios: LocationApiScenario[] = [

  // ── Northern Virginia ──────────────────────────────────────────────────
  {
    testName: 'Geocoding API — ZIP 22304 resolves to Alexandria, Virginia',
    tags: ['@api', '@geocoding', '@regression', '@location', '@happyPath'],
    testRailId: 'GEO-TC-001',
    workflow: 'get-location-by-zip',
    actionsData: { zip: CensusZips.alexandria_22304 },
    expectedResults: {
      found: true,
      cityContains: 'Alexandria',
      stateContains: 'Virginia',
      displayNameContains: 'United States',
      latitudeInRange:  [38.7, 39.0],
      longitudeInRange: [-77.3, -76.9],
    },
  },
  {
    testName: 'Geocoding API — ZIP 22201 resolves to Arlington, Virginia',
    tags: ['@api', '@geocoding', '@regression', '@location', '@happyPath'],
    testRailId: 'GEO-TC-002',
    workflow: 'get-location-by-zip',
    actionsData: { zip: CensusZips.arlington_22201 },
    expectedResults: {
      found: true,
      cityContains: 'Arlington',
      stateContains: 'Virginia',
      latitudeInRange:  [38.8, 39.0],
      longitudeInRange: [-77.2, -77.0],
    },
  },

  // ── Pacific Northwest ──────────────────────────────────────────────────
  {
    testName: 'Geocoding API — ZIP 98101 resolves to Seattle, Washington',
    tags: ['@api', '@geocoding', '@regression', '@location', '@happyPath'],
    testRailId: 'GEO-TC-003',
    workflow: 'get-location-by-zip',
    actionsData: { zip: CensusZips.seattle_98101 },
    expectedResults: {
      found: true,
      stateContains: 'Washington',
      displayNameContains: 'United States',
      latitudeInRange:  [47.5, 47.8],
      longitudeInRange: [-122.5, -122.2],
    },
  },

  // ── Maryland suburbs ───────────────────────────────────────────────────
  {
    testName: 'Geocoding API — ZIP 20814 resolves to Bethesda, Maryland',
    tags: ['@api', '@geocoding', '@regression', '@location'],
    testRailId: 'GEO-TC-004',
    workflow: 'get-location-by-zip',
    actionsData: { zip: CensusZips.bethesda_20814 },
    expectedResults: {
      found: true,
      stateContains: 'Maryland',
      displayNameContains: 'United States',
    },
  },

  // ── Negative test — non-existent ZIP ──────────────────────────────────
  {
    testName: 'Geocoding API — invalid ZIP 00000 returns not found',
    tags: ['@api', '@geocoding', '@regression', '@negative'],
    testRailId: 'GEO-TC-005',
    workflow: 'get-location-by-zip',
    actionsData: { zip: '00000' },
    expectedResults: { found: false },
  },
];

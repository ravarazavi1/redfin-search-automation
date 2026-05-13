import type { BaseTestScenario } from '@interface/interface.index';
import type { A11yExpectedResults } from '@workflows/ui/a11yAssertions.assertions';
import type { A11yAuditOptions } from '@workflows/ui/a11y.workflows';

type A11yWorkflowType = 'a11y-audit';

interface A11yActionsData {
  pageType: 'homepage' | 'zip-results';
  zip?: string;
  auditOptions?: A11yAuditOptions;
}

export type A11yScenario = BaseTestScenario<A11yWorkflowType, A11yExpectedResults, A11yActionsData>;

// Probe run — maxViolations set high; tighten after first run reveals actual counts
export const a11yScenarios: A11yScenario[] = [
  {
    testName: 'A11y — Mocked homepage has no critical or serious violations (WCAG 2.1 AA)',
    tags: ['@a11y', '@accessibility', '@regression', '@homepage'],
    testRailId: 'A11Y-TC-001',
    workflow: 'a11y-audit',
    actionsData: {
      pageType: 'homepage',
      auditOptions: { tags: ['wcag2a', 'wcag2aa', 'best-practice'] },
    },
    expectedResults: {
      maxViolations: 0,
    },
  },
  {
    testName: 'A11y — ZIP 22304 results page has zero violations (WCAG 2.1 AA)',
    tags: ['@a11y', '@accessibility', '@regression', '@zip-search'],
    testRailId: 'A11Y-TC-002',
    workflow: 'a11y-audit',
    actionsData: {
      pageType: 'zip-results',
      zip: '22304',
      auditOptions: { tags: ['wcag2a', 'wcag2aa', 'best-practice'] },
    },
    expectedResults: {
      maxViolations: 0,
    },
  },
  {
    testName: 'A11y — ZIP 22201 results page has zero violations (WCAG 2.1 AA)',
    tags: ['@a11y', '@accessibility', '@regression', '@zip-search'],
    testRailId: 'A11Y-TC-003',
    workflow: 'a11y-audit',
    actionsData: {
      pageType: 'zip-results',
      zip: '22201',
      auditOptions: { tags: ['wcag2a', 'wcag2aa', 'best-practice'] },
    },
    expectedResults: {
      maxViolations: 0,
    },
  },
  {
    testName: 'A11y — ZIP 98101 results page has zero violations (WCAG 2.1 AA)',
    tags: ['@a11y', '@accessibility', '@regression', '@zip-search'],
    testRailId: 'A11Y-TC-004',
    workflow: 'a11y-audit',
    actionsData: {
      pageType: 'zip-results',
      zip: '98101',
      auditOptions: { tags: ['wcag2a', 'wcag2aa', 'best-practice'] },
    },
    expectedResults: {
      maxViolations: 0,
    },
  },
  {
    testName: 'A11y — Search input has accessible label on results page',
    tags: ['@a11y', '@accessibility', '@regression', '@form-controls'],
    testRailId: 'A11Y-TC-005',
    workflow: 'a11y-audit',
    actionsData: {
      pageType: 'zip-results',
      zip: '22304',
      auditOptions: { tags: ['wcag2a'] },
    },
    expectedResults: {
      violationIds: { mustNotInclude: ['label', 'input-image-alt', 'input-button-name'] },
    },
  },
];

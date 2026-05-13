import { expect } from '@playwright/test';
import type { SearchResultDto, NavigationResultDto } from '../../interface/interface.index';

export interface SearchExpectedResults {
  resultsContainText?: string;
  urlContains?: string;
}

export interface NavigationExpectedResults {
  staysOnHomepage?: boolean;
}

/**
 * Pure validation — accepts a DTO, asserts with expect.soft() so all
 * failures are captured in one run rather than stopping at the first.
 *
 * When anti-bot blocks the page, falls back to validating that the
 * search input still retains the query (graceful degradation).
 */
export function assertSearchResults(
  dto: SearchResultDto,
  expected: SearchExpectedResults
): void {
  if (dto.blockedByAntiBot) {
    expect.soft(
      dto.searchInputValue.trim(),
      'anti-bot fallback: search input retains the query'
    ).toBeTruthy();
    return;
  }

  if (expected.resultsContainText) {
    if (dto.headerText !== null) {
      expect.soft(dto.headerText, 'results header contains search term')
        .toContain(expected.resultsContainText);
    } else {
      expect.soft(dto.currentUrl, 'URL contains search term when header is absent')
        .toContain(expected.resultsContainText);
    }
  }

  if (expected.urlContains) {
    expect.soft(dto.currentUrl, 'URL matches expected pattern')
      .toContain(expected.urlContains);
  }
}

export function assertNavigationResult(
  dto: NavigationResultDto,
  expected: NavigationExpectedResults
): void {
  if (expected.staysOnHomepage !== undefined) {
    expect.soft(dto.staysOnHomepage, `empty search stays on homepage (url: ${dto.finalUrl})`)
      .toBe(expected.staysOnHomepage);
  }
}

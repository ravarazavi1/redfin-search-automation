import { expect } from '@playwright/test';
import type { A11yResultDto } from '../../interface/interface.index';

export interface A11yExpectedResults {
  maxViolations?: number;
  zeroCritical?: boolean;
  zeroSerious?: boolean;
  maxImpact?: 'critical' | 'serious' | 'moderate' | 'minor';
  violationIds?: { mustNotInclude: string[] };
}

const IMPACT_ORDER = ['critical', 'serious', 'moderate', 'minor'] as const;

export function assertA11y(dto: A11yResultDto, expected: A11yExpectedResults): void {
  if (expected.maxViolations !== undefined) {
    expect.soft(
      dto.violationCount,
      `A11y: total violations ≤ ${expected.maxViolations} (got ${dto.violationCount})` +
        (dto.violations.length ? `\n  Rules: ${dto.violations.map((v) => v.id).join(', ')}` : ''),
    ).toBeLessThanOrEqual(expected.maxViolations);
  }

  if (expected.zeroCritical) {
    expect.soft(
      dto.criticalCount,
      `A11y: zero critical violations (got ${dto.criticalCount})` +
        (dto.violations.filter((v) => v.impact === 'critical').length
          ? `\n  Rules: ${dto.violations.filter((v) => v.impact === 'critical').map((v) => v.id).join(', ')}`
          : ''),
    ).toBe(0);
  }

  if (expected.zeroSerious) {
    expect.soft(
      dto.seriousCount,
      `A11y: zero serious violations (got ${dto.seriousCount})` +
        (dto.violations.filter((v) => v.impact === 'serious').length
          ? `\n  Rules: ${dto.violations.filter((v) => v.impact === 'serious').map((v) => v.id).join(', ')}`
          : ''),
    ).toBe(0);
  }

  if (expected.maxImpact !== undefined) {
    const allowedIndex = IMPACT_ORDER.indexOf(expected.maxImpact);
    const exceeding = dto.violations.filter((v) => {
      const idx = v.impact ? IMPACT_ORDER.indexOf(v.impact) : -1;
      return idx !== -1 && idx < allowedIndex;
    });
    expect.soft(
      exceeding.length,
      `A11y: no violations worse than "${expected.maxImpact}" (found ${exceeding.map((v) => `[${v.impact}] ${v.id}`).join(', ')})`,
    ).toBe(0);
  }

  if (expected.violationIds?.mustNotInclude) {
    for (const ruleId of expected.violationIds.mustNotInclude) {
      const hit = dto.violations.find((v) => v.id === ruleId);
      expect.soft(
        hit,
        `A11y: rule "${ruleId}" must not be violated`,
      ).toBeUndefined();
    }
  }
}

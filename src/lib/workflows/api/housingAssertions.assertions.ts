import { expect } from '@playwright/test';
import type { LocationResultDto } from '../../interface/interface.index';

export interface HousingExpectedResults {
  found?: boolean;
  cityContains?: string;
  stateContains?: string;
  displayNameContains?: string;
  latitudeInRange?: [number, number];
  longitudeInRange?: [number, number];
}

export function assertHousingData(dto: LocationResultDto, expected: HousingExpectedResults): void {
  if (expected.found !== undefined) {
    expect.soft(dto.found, `ZIP ${dto.zip}: result found = ${expected.found}`).toBe(expected.found);
  }

  if (!dto.found) return;

  if (expected.cityContains !== undefined) {
    expect.soft(
      dto.city ?? '',
      `ZIP ${dto.zip}: city contains "${expected.cityContains}"`
    ).toContain(expected.cityContains);
  }

  if (expected.stateContains !== undefined) {
    expect.soft(
      dto.state ?? '',
      `ZIP ${dto.zip}: state contains "${expected.stateContains}"`
    ).toContain(expected.stateContains);
  }

  if (expected.displayNameContains !== undefined) {
    expect.soft(
      dto.displayName ?? '',
      `ZIP ${dto.zip}: displayName contains "${expected.displayNameContains}"`
    ).toContain(expected.displayNameContains);
  }

  if (expected.latitudeInRange !== undefined && dto.latitude !== null) {
    const [min, max] = expected.latitudeInRange;
    expect.soft(dto.latitude, `ZIP ${dto.zip}: latitude in [${min}, ${max}]`)
      .toBeGreaterThanOrEqual(min);
    expect.soft(dto.latitude, `ZIP ${dto.zip}: latitude in [${min}, ${max}]`)
      .toBeLessThanOrEqual(max);
  }

  if (expected.longitudeInRange !== undefined && dto.longitude !== null) {
    const [min, max] = expected.longitudeInRange;
    expect.soft(dto.longitude, `ZIP ${dto.zip}: longitude in [${min}, ${max}]`)
      .toBeGreaterThanOrEqual(min);
    expect.soft(dto.longitude, `ZIP ${dto.zip}: longitude in [${min}, ${max}]`)
      .toBeLessThanOrEqual(max);
  }
}

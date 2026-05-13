import { APIRequestContext } from '@playwright/test';
import { Logger } from '../helpers/logger';
import { BaseRequest } from './baseRequest';
import type { LocationResultDto } from '../interface/housingResult.interface';

/**
 * OpenStreetMap Nominatim Geocoding API
 * Base URL: https://nominatim.openstreetmap.org
 *
 * Used to validate that ZIP codes resolve to the correct cities — a critical
 * pre-condition for any real estate search platform.
 *
 * Auth:    None required (free, open)
 * Docs:    https://nominatim.org/release-docs/develop/api/Search/
 * Policy:  Max 1 req/sec; must include a meaningful User-Agent.
 */
export class GeocodingApiEndpoints extends BaseRequest {
  private static readonly USER_AGENT =
    'RedfindSearchAutomation/1.0 (portfolio project; github.com/ravarazavi1)';

  constructor(request: APIRequestContext, logger: Logger) {
    super(request, logger, 'https://nominatim.openstreetmap.org');
  }

  async getLocationByZip(zip: string): Promise<LocationResultDto> {
    const response = await this.request.get(
      `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=US&format=json&addressdetails=1&limit=1`,
      {
        timeout: 15000,
        headers: { 'User-Agent': GeocodingApiEndpoints.USER_AGENT },
      },
    );

    this.logger.lineLog(`[API] ${response.status()} ← Nominatim ZIP ${zip}`);

    if (!response.ok()) {
      const body = await response.text();
      this.logger.warn(`Nominatim returned ${response.status()} for ZIP ${zip}: ${body}`);
      return { zip, found: false, city: null, state: null, displayName: null, latitude: null, longitude: null, rawResponse: body };
    }

    const raw = await response.json() as NominatimResult[];

    if (raw.length === 0) {
      this.logger.warn(`Nominatim: no results for ZIP ${zip}`);
      return { zip, found: false, city: null, state: null, displayName: null, latitude: null, longitude: null, rawResponse: raw };
    }

    const result = raw[0];
    const dto: LocationResultDto = {
      zip,
      found: true,
      city:        result.address?.city ?? result.address?.town ?? result.address?.village ?? result.address?.county ?? null,
      state:       result.address?.state ?? null,
      displayName: result.display_name ?? null,
      latitude:    parseFloat(result.lat) || null,
      longitude:   parseFloat(result.lon) || null,
      rawResponse: raw,
    };

    this.logger.jsonLog(dto, `<-- LocationResultDto (${zip})`);
    return dto;
  }
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    county?: string;
    country?: string;
    country_code?: string;
  };
}

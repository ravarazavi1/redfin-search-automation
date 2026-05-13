import type { ApiContext } from '../../interface/interface.index';
import type { LocationResultDto } from '../../interface/interface.index';

export class LocationDataWorkflows {

  static async getLocationByZip(
    context: ApiContext,
    zip: string,
  ): Promise<LocationResultDto> {
    context.logger.lineLog(`\n--- Nominatim Geocoding: ZIP ${zip} ---`);
    return context.apis.geocoding.getLocationByZip(zip);
  }

  static async getLocationsForMultipleZips(
    context: ApiContext,
    zips: string[],
  ): Promise<LocationResultDto[]> {
    context.logger.lineLog(`\n--- Nominatim Geocoding: Batch for ${zips.join(', ')} ---`);
    const results: LocationResultDto[] = [];
    for (const zip of zips) {
      results.push(await context.apis.geocoding.getLocationByZip(zip));
      // Nominatim policy: max 1 request/second
      await new Promise((r) => setTimeout(r, 1100));
    }
    return results;
  }
}

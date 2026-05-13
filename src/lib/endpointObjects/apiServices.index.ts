import { APIRequestContext } from '@playwright/test';
import { Logger } from '../helpers/logger';
import { GeocodingApiEndpoints } from './censusApi.endpoints';

export class ApiRegistry {
  readonly geocoding: GeocodingApiEndpoints;

  constructor(request: APIRequestContext, logger: Logger) {
    this.geocoding = new GeocodingApiEndpoints(request, logger);
  }
}

import type { ApiRegistry } from '../endpointObjects/apiServices.index';
import type { Logger } from '../helpers/logger';

export interface ApiContext {
  apis: ApiRegistry;
  logger: Logger;
}

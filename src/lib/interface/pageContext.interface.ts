import type { PageRegistry } from '../pageObjects/pageRegistry.index';
import type { Logger } from '../helpers/logger';

export interface PageContext {
  pages: PageRegistry;
  logger: Logger;
}

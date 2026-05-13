import { test as base } from '@playwright/test';
import { ApiRegistry } from '../endpointObjects/apiServices.index';
import { Logger } from '../helpers/logger';

type ApiFixture = {
  logger: Logger;
  apis: ApiRegistry;
};

export const test = base.extend<ApiFixture>({
  logger: async ({}, use) => {
    await use(new Logger());
  },

  apis: async ({ request, logger }, use) => {
    await use(new ApiRegistry(request, logger));
  },
});

export { expect } from '@playwright/test';

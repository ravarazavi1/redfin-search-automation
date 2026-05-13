import { APIRequestContext, APIResponse } from '@playwright/test';
import { Logger } from '../helpers/logger';

export class BaseRequest {
  constructor(
    protected readonly request: APIRequestContext,
    protected readonly logger: Logger,
    protected readonly baseUrl: string,
  ) {}

  protected async get(path: string, params?: Record<string, string>): Promise<APIResponse> {
    const url = new URL(path, this.baseUrl);
    if (params) {
      for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    }

    this.logger.lineLog(`[API GET] ${url.toString()}`);
    const response = await this.request.get(url.toString(), { timeout: 15000 });
    this.logger.lineLog(`[API] ${response.status()} ← ${url.pathname}${url.search}`);
    return response;
  }
}

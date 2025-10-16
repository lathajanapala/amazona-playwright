import { APIRequestContext, request, APIResponse } from '@playwright/test';
import { api } from './testData';

export class ApiClient {
  private context!: APIRequestContext;
  private baseURL: string;

  constructor(baseURL: string = api.baseUrl) {
    this.baseURL = baseURL;
  }

  async init() {
    this.context = await request.newContext({
      baseURL: this.baseURL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json'
      }
    });
  }

  async dispose() {
    await this.context.dispose();
  }

  async get(path: string, params?: Record<string, string | number>): Promise<APIResponse> {
    const url = this.withQuery(path, params);
    return this.context.get(url);
  }

  async post(path: string, body?: unknown): Promise<APIResponse> {
    return this.context.post(path, { data: body });
  }

  private withQuery(path: string, params?: Record<string, string | number>): string {
    if (!params) return path;
    const search = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => search.append(k, String(v)));
    return `${path}?${search.toString()}`;
  }
}

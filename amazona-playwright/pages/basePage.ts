import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string = '/') {
    await this.page.goto(path);
  }

  getByRole(role: Parameters<Page['getByRole']>[0], options?: Parameters<Page['getByRole']>[1]) {
    return this.page.getByRole(role, options as any);
  }

  getByLabel(text: string | RegExp) {
    return this.page.getByLabel(text);
  }

  locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  async assertToastContains(text: string | RegExp) {
    // generic toast/alert area
    const alert = this.page.getByRole('alert').or(this.page.locator('[class*="toast"], .Toastify, .alert, .message'));
    await expect(alert).toContainText(text);
  }

  async clickNav(linkText: string | RegExp) {
    await this.page.getByRole('link', { name: linkText }).click();
  }
}

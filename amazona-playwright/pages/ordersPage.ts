import { expect, Page } from '@playwright/test';
import { BasePage } from './basePage';

export class OrdersPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }
  async open() {
    await this.goto('/orders');
  }
  ordersList() {
    return this.page.locator('[data-test="order-row"], .order-row, table >> tbody >> tr, .order-list .order');
  }
  orderRowByIndex(index = 0) {
    return this.ordersList().nth(index);
  }
  viewDetailsButton(row = this.orderRowByIndex()) {
    return row.getByRole('link', { name: /view details|details|view/i }).or(row.locator('a:has-text("Details"), button:has-text("Details")'));
  }
  async openOrderDetailsByIndex(index = 0) {
    const row = this.orderRowByIndex(index);
    await this.viewDetailsButton(row).click();
  }
  orderItems() {
    return this.page.locator('[data-test="order-item"], .order-item, .order-details .item');
  }
  shippingAddress() {
    return this.page.locator('[data-test="shipping-address"], .shipping-address, #shipping-address');
  }
  orderStatus() {
    return this.page.locator('[data-test="order-status"], .status, text=/status/i');
  }
  async assertOrdersVisible() {
    const count = await this.ordersList().count();
    expect(count).toBeGreaterThan(0);
  }
  async assertOrderDetailsVisible() {
    await expect(this.orderItems().first()).toBeVisible();
    await expect(this.shippingAddress()).toBeVisible();
    await expect(this.orderStatus()).toBeVisible();
  }
}

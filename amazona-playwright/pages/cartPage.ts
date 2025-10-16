import { expect, Page } from '@playwright/test';
import { BasePage } from './basePage';

export class CartPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  cartItems() {
    return this.page.locator('[data-test="cart-item"], .cart-item, .row:has([class*="cart"])');
  }

  itemRowByIndex(index = 0) {
    return this.cartItems().nth(index);
  }

  increaseButton(row = this.itemRowByIndex()) {
    return row.getByRole('button', { name: /\+|increase/i }).or(row.locator('button:has-text("+"), [data-test="inc"]'));
  }

  decreaseButton(row = this.itemRowByIndex()) {
    return row.getByRole('button', { name: /-|decrease/i }).or(row.locator('button:has-text("-"), [data-test="dec"]'));
  }

  removeButton(row = this.itemRowByIndex()) {
    return row.getByRole('button', { name: /remove|delete/i }).or(row.locator('button:has-text("Remove"), .remove, [data-test="remove"]'));
  }

  quantityInput(row = this.itemRowByIndex()) {
    return row.getByRole('spinbutton').or(row.locator('input[type="number"], select[name*="qty" i]'));
  }

  subtotalText() {
    return this.page.locator('[data-test="cart-subtotal"], #subtotal, text=/subtotal/i');
  }

  totalText() {
    return this.page.locator('[data-test="cart-total"], #total, text=/total/i');
  }

  emptyMessage() {
    return this.page.getByText(/cart is empty|no items in cart/i).or(this.page.locator('[data-test="cart-empty"], .alert-info'));
  }

  checkoutButton() {
    return this.getByRole('button', { name: /proceed to checkout|checkout/i }).or(this.locator('a[href*="shipping"], a[href*="signin"]'));
  }

  async open() {
    await this.goto('/cart');
  }

  async assertItemCountAtLeast(n: number) {
    const itemCount = await this.cartItems().count();
    expect(itemCount).toBeGreaterThanOrEqual(1);
    const count = await this.cartItems().count();
    expect(count).toBeGreaterThanOrEqual(n);
  }

  async assertSubtotalExists() {
    await expect(this.subtotalText()).toBeVisible();
  }

  async proceedToCheckout() {
    await this.checkoutButton().click();
  }

  async increaseFirstItem() {
    await this.increaseButton().click();
  }

  async decreaseFirstItem() {
    await this.decreaseButton().click();
  }

  async removeFirstItem() {
    await this.removeButton().click();
  }

  async assertCartEmpty() {
    await expect(this.cartItems()).toHaveCount(0);
    await expect(this.emptyMessage()).toBeVisible();
  }

  async assertCheckoutDisabled() {
    const btn = this.checkoutButton();
    if (await btn.count()) {
      await expect(btn).toBeDisabled({ timeout: 2000 }).catch(async () => {
        // If button not disabled, it should not be visible when cart empty
        await expect(btn).toBeHidden();
      });
    }
  }
}

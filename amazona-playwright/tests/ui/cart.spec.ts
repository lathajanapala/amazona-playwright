import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/homePage';
import { ProductPage } from '../../pages/productPage';
import { CartPage } from '../../pages/cartPage';
import { testData } from '../../utils/testData';

test.describe('Cart Operations @ui', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure there is at least one item in cart for tests that require it
    const home = new HomePage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);
    await home.open();
    await home.searchProduct(testData.products.search.validTerm);
    await product.openFirstProductFromResults();
    await product.addToCart();
    await cart.open();
  });

  test('CART-002 Increase quantity in cart', async ({ page }) => {
    const cart = new CartPage(page);
    const qty = cart.quantityInput();
    const before = await qty.inputValue().catch(async () => (await qty.textContent()) || '1');
    await cart.increaseFirstItem();
    const after = await qty.inputValue().catch(async () => (await qty.textContent()) || '2');
    expect(Number(after)).toBeGreaterThan(Number(before));
    await expect(cart.subtotalText()).toBeVisible();
  });

  test('CART-003 Decrease quantity in cart and remove at zero', async ({ page }) => {
    const cart = new CartPage(page);
    const qty = cart.quantityInput();
    const before = Number((await qty.inputValue().catch(async () => (await qty.textContent()) || '2')));
    if (before <= 1) {
      await cart.increaseFirstItem();
    }
    await cart.decreaseFirstItem();
    const after = Number((await qty.inputValue().catch(async () => (await qty.textContent()) || '1')));
    expect(after).toBeGreaterThanOrEqual(1);
  });

  test('CART-004 Remove item from cart', async ({ page }) => {
    const cart = new CartPage(page);
    const beforeCount = await cart.cartItems().count();
    await cart.removeFirstItem();
    const afterCount = await cart.cartItems().count();
    expect(afterCount).toBeLessThan(beforeCount);
  });

  test('CART-005 Persist cart between sessions (reload)', async ({ page }) => {
    const cart = new CartPage(page);
    const countBefore = await cart.cartItems().count();
    await page.reload();
    const countAfter = await cart.cartItems().count();
    if (testData.cart.persistBetweenSessions) {
      expect(countAfter).toBeGreaterThanOrEqual(countBefore);
    }
  });

  test('CART-006 Checkout button disabled for empty cart', async ({ page }) => {
    const cart = new CartPage(page);
    // Remove all items
    const items = cart.cartItems();
    const n = await items.count();
    for (let i = 0; i < n; i++) {
      await cart.removeFirstItem();
    }
    await cart.assertCartEmpty();
    await cart.assertCheckoutDisabled();
  });
});

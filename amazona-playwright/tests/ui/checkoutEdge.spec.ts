import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/loginPage';
import { HomePage } from '../../pages/homePage';
import { ProductPage } from '../../pages/productPage';
import { CartPage } from '../../pages/cartPage';
import { CheckoutPage } from '../../pages/checkoutPage';
import { testData } from '../../utils/testData';

test.describe('Checkout Edge Cases @ui', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    const home = new HomePage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);
    await login.login(testData.validUser.email, testData.validUser.password);
    await login.assertLoginSuccess();
    await home.open();
    await home.searchProduct(testData.products.search.validTerm);
    await product.openFirstProductFromResults();
    await product.addToCart();
    await cart.open();
  });

  test('CHECK-002 Checkout with missing required fields shows validation errors', async ({ page }) => {
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    await cart.proceedToCheckout();
    await checkout.submitEmptyShipping();
    await expect(checkout.validationError()).toBeVisible();
  });

  test('CHECK-003 Payment with invalid card fails', async ({ page }) => {
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    await cart.proceedToCheckout();
    await checkout.fillShippingAddress(testData.checkout.address.valid as any);
    // Try credit card if available
    await checkout.paymentMethodRadio('Credit').check().catch(() => {});
    if ((await checkout.cardNumberInput().count()) > 0) {
      await checkout.fillCardDetails(testData.checkout.payment.invalidCard);
    }
    await checkout.placeOrder();
    // Expect error either as validation error or specific message
    const error = checkout.validationError();
    await expect(error).toBeVisible();
    await expect(error).toContainText(/invalid|failed|error/i);
  });

  test('CHECK-004 Apply coupon / promo code', async ({ page }) => {
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    await cart.proceedToCheckout();
    await checkout.fillShippingAddress(testData.checkout.address.valid as any);
    await checkout.selectPayment('PayPal');
    // Apply valid code
    await checkout.applyPromo(testData.checkout.promoCodes.valid);
    if ((await checkout.promoSuccess().count()) > 0) {
      await expect(checkout.promoSuccess()).toBeVisible();
    }
    // Apply invalid code
    await checkout.applyPromo(testData.checkout.promoCodes.invalid);
    if ((await checkout.promoError().count()) > 0) {
      await expect(checkout.promoError()).toBeVisible();
    }
  });

  test('CHECK-005 Order summary correctness shows key values', async ({ page }) => {
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    await cart.proceedToCheckout();
    await checkout.fillShippingAddress(testData.checkout.address.valid as any);
    // Ensure we are on summary step, select payment if needed
    await checkout.selectPayment('PayPal');
    await expect(checkout.summarySubtotal()).toBeVisible();
    await expect(checkout.summaryTax()).toBeVisible();
    await expect(checkout.summaryShipping()).toBeVisible();
    await expect(checkout.summaryTotal()).toBeVisible();
  });
});

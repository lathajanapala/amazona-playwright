import { test } from '@playwright/test';
import { LoginPage } from '../../pages/loginPage';
import { HomePage } from '../../pages/homePage';
import { ProductPage } from '../../pages/productPage';
import { CartPage } from '../../pages/cartPage';
import { CheckoutPage } from '../../pages/checkoutPage';
import { testData } from '../../utils/testData';

test('checkout flow completes with success message @ui', async ({ page }) => {
  const login = new LoginPage(page);
  const home = new HomePage(page);
  const product = new ProductPage(page);
  const cart = new CartPage(page);
  const checkout = new CheckoutPage(page);

  // Login first (many shops require auth for checkout)
  await login.login(testData.validUser.email, testData.validUser.password);
  await login.assertLoginSuccess();

  // Add an item
  await home.open();
  await home.searchProduct(testData.products.searchTerm);
  await product.openFirstProductFromResults();
  await product.addToCart();

  // Cart -> Checkout
  await cart.open();
  await cart.proceedToCheckout();

  // Fill shipping -> payment -> place order
  await checkout.fillShippingAddress();
  await checkout.selectPayment('PayPal');
  await checkout.placeOrder();
  await checkout.assertOrderSuccess();
});

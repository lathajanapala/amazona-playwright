import { test } from '@playwright/test';
import { HomePage } from '../../pages/homePage';
import { ProductPage } from '../../pages/productPage';
import { CartPage } from '../../pages/cartPage';
import { testData } from '../../utils/testData';

test('add product to cart and verify count/subtotal @ui', async ({ page }) => {
  const home = new HomePage(page);
  const product = new ProductPage(page);
  const cart = new CartPage(page);

  await home.open();
  await home.searchProduct(testData.products.searchTerm);
  await product.openFirstProductFromResults();
  await product.addToCart();
  await product.assertCartCountAtLeast(1);

  await cart.open();
  await cart.assertItemCountAtLeast(1);
  await cart.assertSubtotalExists();
});

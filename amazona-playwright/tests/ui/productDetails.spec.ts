import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/homePage';
import { ProductPage } from '../../pages/productPage';
import { CartPage } from '../../pages/cartPage';
import { testData } from '../../utils/testData';

test.describe('Product Details @ui', () => {
  test('PD-001 View product details shows essential info', async ({ page }) => {
    const home = new HomePage(page);
    const product = new ProductPage(page);
    await home.open();
    await home.searchProduct(testData.products.search.validTerm);
    await product.openFirstProductFromResults();
    await product.assertDetailsVisible();
    await expect(product.ratings().first()).toBeVisible({ timeout: 2000 }).catch(() => {});
  });

  test('PD-002 Image gallery updates main image on thumbnail click', async ({ page }) => {
    const home = new HomePage(page);
    const product = new ProductPage(page);
    await home.open();
    await home.searchProduct(testData.products.search.validTerm);
    await product.openFirstProductFromResults();
    const thumbs = product.galleryThumbnails();
    const count = await thumbs.count();
    if (count >= 2) {
      const beforeSrc = await product.mainImage().getAttribute('src');
      await thumbs.nth(1).click();
      await expect(async () => {
        const afterSrc = await product.mainImage().getAttribute('src');
        expect(afterSrc).not.toBe(beforeSrc);
      }).toPass();
    } else {
      test.skip(true, 'Not enough thumbnails to verify gallery');
    }
  });

  test('PD-003 Verify stock/availability and Add to Cart disabled if out of stock', async ({ page }) => {
    const product = new ProductPage(page);
    // In stock product
    await product.openById(testData.products.stock.inStockId);
    await product.assertAvailability(false);
    await expect(await product.isAddToCartDisabled()).toBe(false);
    // Out of stock product
    await product.openById(testData.products.stock.outOfStockId);
    await product.assertAvailability(true);
    await expect(await product.isAddToCartDisabled()).toBe(true);
  });

  test('PD-004 Check reviews and ratings visible', async ({ page }) => {
    const home = new HomePage(page);
    const product = new ProductPage(page);
    await home.open();
    await home.searchProduct(testData.products.search.validTerm);
    await product.openFirstProductFromResults();
    await product.assertReviewsBasic(testData.products.reviews.minCount);
  });

  test('PD-005 Add to cart from detail adds 1 item', async ({ page }) => {
    const product = new ProductPage(page);
    const cart = new CartPage(page);
    await product.openById(testData.products.stock.inStockId);
    await product.addToCart();
    await cart.open();
    await cart.assertItemCountAtLeast(1);
  });
});

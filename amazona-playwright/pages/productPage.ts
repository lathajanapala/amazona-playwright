import { expect, Page } from '@playwright/test';
import { BasePage } from './basePage';

export class ProductPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  productTitle() {
    return this.page.getByRole('heading').first();
  }

  mainImage() {
    return this.page.locator('[data-test="product-main-image"], .product-main img, #main-image, img[alt*="product" i]').first();
  }

  galleryThumbnails() {
    return this.page.locator('[data-test="thumbnail"], .thumbnails img, .product-gallery img, .swiper-slide img');
  }

  description() {
    return this.page.locator('[data-test="product-description"], #description, .description, article');
  }

  price() {
    return this.page.locator('[data-test="product-price"], .price, #price, text=/\$\s?\d/');
  }

  availability() {
    return this.page.locator('[data-test="availability"], #availability, text=/in stock|out of stock|available/i');
  }

  ratings() {
    return this.page.locator('[data-test="ratings"], .rating, [aria-label*="rating" i]');
  }

  addToCartButton() {
    return this.getByRole('button', { name: /add to cart/i }).or(this.locator('button#add-to-cart, button:has-text("Add to Cart")'));
  }

  cartCountBadge() {
    return this.page.locator('[data-test="cart-count"], #cart-count, .badge:has-text(/\d+/)');
  }

  async openFirstProductFromResults() {
    const link = this.page.getByRole('link', { name: /details|more|view/i }).first().or(this.page.locator('a:has(.product):visible').first());
    if (await link.count()) {
      await link.click();
    } else {
      // fallback: click first product title
      await this.page.locator('a').filter({ hasText: /.+/ }).first().click();
    }
  }

  async openById(id: string) {
    await this.goto(`/product/${id}`);
  }

  async addToCart() {
    await this.addToCartButton().click();
  }

  async isAddToCartDisabled() {
    const btn = this.addToCartButton();
    return (await btn.isDisabled()) || (await btn.getAttribute('disabled')) !== null || (await btn.getAttribute('aria-disabled')) === 'true';
  }

  async assertDetailsVisible() {
    await expect(this.productTitle()).toBeVisible();
    await expect(this.mainImage()).toBeVisible();
    await expect(this.description()).toBeVisible();
    await expect(this.price()).toBeVisible();
    await expect(this.addToCartButton()).toBeVisible();
  }

  async assertAvailability(expectOutOfStock = false) {
    const avail = this.availability();
    if (await avail.count()) {
      const text = (await avail.first().innerText()).toLowerCase();
      if (expectOutOfStock) {
        expect(text).toMatch(/out of stock|unavailable/);
      } else {
        expect(text).toMatch(/in stock|available|ships/);
      }
    }
  }

  reviewsSection() {
    return this.page.locator('[data-test="reviews"], #reviews, .reviews, section:has-text(/reviews/i)');
  }

  reviewItems() {
    return this.reviewsSection().locator('[data-test="review-item"], .review, li');
  }

  async assertReviewsBasic(minCount = 1) {
    const list = this.reviewItems();
    const count = await list.count();
    if (count === 0) {
      await expect(this.reviewsSection()).toBeVisible();
    }
    expect(count).toBeGreaterThanOrEqual(minCount);
  }

  async assertCartCountAtLeast(n: number) {
    // Header typically has Cart link with count
    const cartLink = this.page.getByRole('link', { name: /cart/i });
    await expect(cartLink).toContainText(new RegExp(`\\(${n}\\)|${n}`));
  }
}

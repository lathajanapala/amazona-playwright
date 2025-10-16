import { expect, Page } from '@playwright/test';
import { BasePage } from './basePage';
import { testData } from '../utils/testData';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  searchInput() {
    // Amazona header has search box
    return this.page.getByRole('textbox', { name: /search/i }).or(this.locator('input[type="search"], #search'));
  }

  searchButton() {
    return this.getByRole('button', { name: /search/i }).or(this.locator('button[type="submit"]'));
  }

  productCards() {
    return this.page.locator('[data-test="product-card"], .product, .card');
  }

  // Added: common elements for search/result state
  noResultsMessage() {
    return this.page.getByText(new RegExp(testData.messages.noProductsFound, 'i')).or(
      this.page.locator('[data-test="no-results"], .no-results, text=/no products? found/i')
    );
  }

  breadcrumb() {
    return this.page.locator('nav[aria-label="breadcrumb"], .breadcrumb, [data-test="breadcrumb"]');
  }

  sortControl() {
    return this.page.locator('select[name="sort"], select#sort').or(this.page.getByRole('combobox', { name: /sort/i }));
  }

  // Category links (header/sidebar)
  categoryLink(name: string) {
    return this.page.getByRole('link', { name: new RegExp(name, 'i') }).or(
      this.page.locator(`[data-test="category-link"]:has-text("${name}")`)
    );
  }

  async open() {
    await this.goto('/');
  }

  async searchProduct(name: string) {
    await this.searchInput().fill(name);
    await this.searchButton().click();
  }

  async assertSearchResultsContain(term: string) {
    await this.page.waitForLoadState('networkidle');
    const list = this.productCards();
    const count = await list.count();
    expect(count).toBeGreaterThan(0);
    await expect(list.first()).toContainText(new RegExp(term, 'i'));
  }

  // Added: handle blank search behavior (either show prompt or keep products)
  async assertBlankSearchBehavior() {
    await this.page.waitForLoadState('networkidle');
    const list = this.productCards();
    const count = await list.count();
    if (count > 0) {
      expect(count).toBeGreaterThan(0);
    } else {
      await expect(this.page.getByText(new RegExp(testData.messages.enterKeyword, 'i')).or(
        this.page.locator('[data-test="enter-keyword"], .search-prompt')
      )).toBeVisible();
    }
  }

  async assertNoResults() {
    await this.page.waitForLoadState('networkidle');
    await expect(this.noResultsMessage()).toBeVisible();
  }

  async navigateToCategory(name: string) {
    await this.categoryLink(name).first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async assertOnCategory(name: string) {
    const crumb = this.breadcrumb();
    if (await crumb.count()) {
      await expect(crumb).toContainText(new RegExp(name, 'i'));
    }
    const count = await this.productCards().count();
    expect(count).toBeGreaterThan(0);
  }

  // Filtering helpers
  async setPriceRange(min?: number, max?: number) {
    const minInput = this.page.getByLabel(/min(imum)? price|from/i).or(this.page.locator('input[name="minPrice"], #minPrice'));
    const maxInput = this.page.getByLabel(/max(imum)? price|to/i).or(this.page.locator('input[name="maxPrice"], #maxPrice'));
    if (typeof min === 'number') await minInput.fill(String(min));
    if (typeof max === 'number') await maxInput.fill(String(max));
  }

  async selectBrand(brand: string) {
    const brandOption = this.page.getByLabel(new RegExp(brand, 'i')).or(
      this.page.locator('[data-test="brand"], .brand-filter').filter({ hasText: new RegExp(brand, 'i') })
    );
    if (await brandOption.count()) {
      const el = brandOption.first();
      const role = await el.getAttribute('role');
      if (role === 'checkbox' || (await el.evaluate((n) => (n as HTMLInputElement).type === 'checkbox').catch(() => false))) {
        await el.check({ force: true }).catch(async () => await el.click());
      } else {
        await el.click();
      }
    }
  }

  async selectRating(rating: number) {
    const ratingText = `${rating}`;
    const ratingOption = this.page.getByRole('link', { name: new RegExp(`${ratingText}(.|\n)*stars?`, 'i') }).or(
      this.page.getByLabel(new RegExp(`${ratingText}.?\+?\s*stars?`, 'i'))
    ).or(this.page.locator('[data-test="rating"], .rating-filter').filter({ hasText: new RegExp(ratingText) }));
    if (await ratingOption.count()) await ratingOption.first().click();
  }

  async applyFiltersIfNeeded() {
    const apply = this.page.getByRole('button', { name: /apply|go|filter/i }).or(this.page.locator('[data-test="apply-filters"]'));
    if (await apply.count()) await apply.click();
    await this.page.waitForLoadState('networkidle');
  }

  // Sorting
  async sortBy(optionLabel: string) {
    const sort = this.sortControl();
    if (await sort.count()) {
      const el = sort.first();
      const tag = await el.evaluate((n) => n.tagName.toLowerCase());
      if (tag === 'select') {
        await el.selectOption({ label: optionLabel }).catch(async () => {
          const value = await el.locator('option', { hasText: optionLabel }).first().getAttribute('value');
          if (value) await el.selectOption(value);
        });
      } else {
        // combobox style
        await el.click();
        await this.page.getByRole('option', { name: new RegExp(optionLabel, 'i') }).first().click().catch(async () => {
          await this.page.locator(`text=${optionLabel}`).first().click();
        });
      }
      await this.page.waitForLoadState('networkidle');
    }
  }

  // Price parsing helpers
  private async getCardPrice(card: import('@playwright/test').Locator): Promise<number | null> {
    const text = await card.innerText();
    const m = text.match(/[\$€£]\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/);
    if (!m) return null;
    return parseFloat(m[1].replace(/,/g, ''));
  }

  async getVisiblePrices(limit = 10): Promise<number[]> {
    const cards = this.productCards();
    const count = Math.min(await cards.count(), limit);
    const prices: number[] = [];
    for (let i = 0; i < count; i++) {
      const p = await this.getCardPrice(cards.nth(i));
      if (p != null) prices.push(p);
    }
    return prices;
  }

  async assertPricesWithin(min?: number, max?: number) {
    const prices = await this.getVisiblePrices();
    expect(prices.length).toBeGreaterThan(0);
    if (typeof min === 'number') expect(Math.min(...prices)).toBeGreaterThanOrEqual(min);
    if (typeof max === 'number') expect(Math.max(...prices)).toBeLessThanOrEqual(max);
  }

  async assertPricesSortedAscending() {
    const prices = await this.getVisiblePrices();
    expect(prices.length).toBeGreaterThan(1);
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  }
}

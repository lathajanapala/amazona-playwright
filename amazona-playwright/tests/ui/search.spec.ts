import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/homePage';
import { testData } from '../../utils/testData';

test.describe('Search / Browse / Filter / Sort @ui', () => {
  test('SRCH-001 Search for a valid product', async ({ page }) => {
    const home = new HomePage(page);
    await home.open();
    await home.searchProduct(testData.products.search.validTerm);
    await home.assertSearchResultsContain(testData.products.search.validTerm);
  });

  test('SRCH-002 Search for non-existing product', async ({ page }) => {
    const home = new HomePage(page);
    await home.open();
    await home.searchProduct(testData.products.search.invalidTerm);
    await home.assertNoResults();
  });

  test('SRCH-003 Search with blank input', async ({ page }) => {
    const home = new HomePage(page);
    await home.open();
    await home.searchProduct(testData.products.search.blankTerm);
    await home.assertBlankSearchBehavior();
  });

  test('SRCH-004 Navigate by category', async ({ page }) => {
    const home = new HomePage(page);
    await home.open();
    const category = testData.products.categories[0] || 'Electronics';
    await home.navigateToCategory(category);
    await home.assertOnCategory(category);
  });

  test('SRCH-005 Filter results', async ({ page }) => {
    const home = new HomePage(page);
    await home.open();
    const { price, brand, rating } = testData.products.filters;
    await home.setPriceRange(price.min, price.max);
    await home.selectBrand(brand);
    await home.selectRating(rating);
    await home.applyFiltersIfNeeded();
    // Assert only products matching price range
    await home.assertPricesWithin(price.min, price.max);
    // Optional UI updates (active filter chips)
    const chips = page.locator('[data-test="active-filter"], .filter-chip, .applied-filters .chip');
    if (await chips.count()) {
      const chipCount = await chips.count();
      if (chipCount <= 0) {
        throw new Error('Expected at least one active filter chip, but found none.');
      }
    }
    expect(await chips.count()).toBeGreaterThan(0);
  });

  test('SRCH-006 Sort results', async ({ page }) => {
    const home = new HomePage(page);
    await home.open();
    // Ensure there are products visible first (optional: perform a generic search)
    await home.searchProduct(testData.products.search.validTerm);
    await home.sortBy(testData.products.sortOptions.priceLowToHigh);
    await home.assertPricesSortedAscending();
  });

  test('search product shows relevant items @ui', async ({ page }) => {
    const home = new HomePage(page);
    await home.open();
    await home.searchProduct(testData.products.searchTerm);
    await home.assertSearchResultsContain(testData.products.searchTerm);
  });
});

import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/homePage';
import { testData } from '../../utils/testData';

const hasHorizontalOverflow = async (page: import('@playwright/test').Page) => {
  return await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
};

test.describe('General / UI / Performance / Security / Usability @ui', () => {
  test('UI-001 Responsive layout (mobile/desktop) has no horizontal overflow', async ({ page }) => {
    const home = new HomePage(page);
    // Mobile
    await page.setViewportSize(testData.ui.viewports.mobile as any);
    await home.open();
    expect(await hasHorizontalOverflow(page)).toBe(false);
    // Desktop
    await page.setViewportSize(testData.ui.viewports.desktop as any);
    await home.open();
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });

  test('UI-002 No broken links or images', async ({ page }) => {
    const home = new HomePage(page);
    await home.open();
    // Images
    const imgs = page.locator('img');
    const imgCount = await imgs.count();
    for (let i = 0; i < imgCount; i++) {
      const el = imgs.nth(i);
      const visible = await el.isVisible();
      if (!visible) continue;
      const ok = await el.evaluate((img: HTMLImageElement) => img.complete && Number(img.naturalWidth) > 0);
      expect(ok).toBe(true);
    }
    // Links
    const links = await page.$$eval('a[href]', (as) => (as as HTMLAnchorElement[]).map((a) => a.getAttribute('href') || ''));
    for (const href of links) {
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
      const url = href.startsWith('http') ? href : new URL(href, page.url()).toString();
      const res = await page.request.get(url, { failOnStatusCode: false });
      expect(res.status(), `Broken link: ${url}`).toBeLessThan(400);
    }
  });

  test('PERF-001 Page load time below threshold', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(testData.perf.pageLoadThresholdMs);
  });

  test('SEC-001 Inputs sanitize script/SQL injection', async ({ page }) => {
    const home = new HomePage(page);
    await home.open();
    // Fail test if any dialog opens (e.g., alert from XSS)
    let dialogOpened = false;
    page.on('dialog', async (d) => {
      dialogOpened = true;
      await d.dismiss().catch(() => {});
    });
    // Try XSS in search
    await home.searchProduct(testData.security.payloads.xss);
    await page.waitForLoadState('networkidle');
    expect(dialogOpened).toBe(false);
    // Try SQL payload in search as well
    await home.searchProduct(testData.security.payloads.sql);
    await page.waitForLoadState('networkidle');
    expect(dialogOpened).toBe(false);
  });

  test('USAB-001 Basic accessibility checks: keyboard navigation and alt texts', async ({ page }) => {
    const home = new HomePage(page);
    await home.open();
    // Keyboard navigation: Tab to cycle focus a few times
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const activeRole = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el) return '';
        return (el.getAttribute('role') || el.tagName).toLowerCase();
      });
      expect(activeRole.length).toBeGreaterThan(0);
    }
    // Alt texts for images
    if (testData.accessibility.requireAltText) {
      const imgs = page.locator('img');
      const count = await imgs.count();
      for (let i = 0; i < count; i++) {
        const el = imgs.nth(i);
        const visible = await el.isVisible();
        if (!visible) continue;
        const alt = await el.getAttribute('alt');
        expect(alt ?? '').not.toEqual('');
      }
    }
  });
});

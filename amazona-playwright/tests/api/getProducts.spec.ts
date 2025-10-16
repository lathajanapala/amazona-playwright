import { test, expect } from '@playwright/test';
import { api } from '../../utils/testData';

test('GET /api/products returns products with required fields @api', async ({ request }) => {
  const start = Date.now();
  const res = await request.get(`${api.baseUrl}${api.endpoints.products}`);
  const ms = Date.now() - start;

  expect(res.ok()).toBeTruthy();
  expect(res.status()).toBe(200);
  expect(ms).toBeLessThan(1000);

  const data = await res.json();
  expect(Array.isArray(data)).toBeTruthy();
  expect(data.length).toBeGreaterThan(0);

  const first = data[0];
  // Common Amazona fields: _id, name, slug, price, category, image
  expect(first).toHaveProperty('_id');
  expect(first).toHaveProperty('name');
  expect(first).toHaveProperty('price');
  expect(typeof first.name).toBe('string');
  expect(typeof first.price === 'number' || typeof first.price === 'string').toBeTruthy();
});

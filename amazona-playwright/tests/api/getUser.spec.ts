import { test, expect } from '@playwright/test';
import { api } from '../../utils/testData';

test('GET /api/users/:id returns a user structure @api', async ({ request }) => {
  // First sign up a user to ensure ID exists and is accessible
  const unique = Math.random().toString(36).slice(2, 8);
  const email = `qa_${unique}@example.com`;
  const body = { name: `QA ${unique}`, email, password: 'Password123' };

  const create = await request.post(`${api.baseUrl}${api.endpoints.signup}`, { data: body });
  expect(create.status(), 'signup should return 201/200').toBeGreaterThanOrEqual(200);
  const created = await create.json();

  const userId = created?._id || created?.user?._id || created?.data?._id;
  expect(userId).toBeTruthy();

  const res = await request.get(`${api.baseUrl}${api.endpoints.users}/${userId}`);
  expect(res.ok()).toBeTruthy();

  const user = await res.json();
  expect(user).toHaveProperty('_id');
  expect(user).toHaveProperty('name');
  expect(user).toHaveProperty('email');
});

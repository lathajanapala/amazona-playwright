import { test, expect } from '@playwright/test';
import { api } from '../../utils/testData';

test('POST /api/users/signup creates a user @api', async ({ request }) => {
  const unique = Math.random().toString(36).slice(2, 8);
  const payload = {
    name: `User ${unique}`,
    email: `user_${unique}@example.com`,
    password: 'Password123'
  };

  const res = await request.post(`${api.baseUrl}${api.endpoints.signup}`, { data: payload });
  expect([200, 201]).toContain(res.status());

  const data = await res.json();
  const user = data?.user || data;
  expect(user).toHaveProperty('_id');
  expect(user).toHaveProperty('name');
  expect(user).toHaveProperty('email');
});

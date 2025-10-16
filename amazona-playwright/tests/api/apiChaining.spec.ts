// filepath: /Users/pushpalatha/Desktop/amzoncloneproject/amazona-playwright/tests/api/apiChaining.spec.ts
import { test, expect, APIResponse } from '@playwright/test';
import { api, testData } from '../../utils/testData';
import { signupAndLogin, extractId, authHeader, createUniqueUserPayload } from '../../utils/auth';

async function expectOk(res: APIResponse) {
  const status = res.status();
  expect([200, 201]).toContain(status);
}

// 1) Chain: signup -> login -> fetch user by id
// Demonstrates passing userId and token between calls

test('API chain: signup -> login -> get user by id @api @chain', async ({ request }) => {
  const { token, userId, credentials } = await signupAndLogin(request);

  expect(token || userId).toBeTruthy();

  // Try fetching by id; if id missing, fallback to /me
  let res = await request.get(`${api.baseUrl}${api.endpoints.users}/${userId ?? 'me'}`, {
    headers: authHeader(token)
  });
  if (res.status() === 404 && !userId) {
    // try without /me if backend expects id only
    res = await request.get(`${api.baseUrl}${api.endpoints.users}/${userId}`, {
      headers: authHeader(token)
    });
  }
  await expectOk(res);

  const body = await res.json();
  const user = body?.user || body;
  expect(user?.email).toBe(credentials.email);
});

// 2) Chain: login -> list products -> get product details
// Demonstrates using a productId from a previous response

test('API chain: login -> list products -> get product details @api @chain', async ({ request }) => {
  // Create user and login to obtain token if product endpoints require auth
  const { token } = await signupAndLogin(request);

  const listRes = await request.get(`${api.baseUrl}${api.endpoints.products}`, {
    headers: authHeader(token)
  });
  await expectOk(listRes);
  const list = await listRes.json();
  const products = list?.products || list?.data || list;
  expect(Array.isArray(products)).toBeTruthy();
  expect(products.length).toBeGreaterThan(0);

  const first = products[0];
  const productId = extractId(first);
  expect(productId).toBeTruthy();

  const detailRes = await request.get(`${api.baseUrl}${api.endpoints.products}/${productId}`, {
    headers: authHeader(token)
  });
  await expectOk(detailRes);
  const detail = await detailRes.json();
  const product = detail?.product || detail;
  expect(extractId(product)).toBe(productId);
});

// 3) End-to-end API chain: signup -> login -> pick product -> add to cart -> create order/checkout
// This demonstrates reusing token and ids across the flow

test('API chain: signup -> login -> add to cart -> checkout/order @api @chain', async ({ request }) => {
  const { token } = await signupAndLogin(request);
  expect(token).toBeTruthy();

  // Get a product to purchase
  const productsRes = await request.get(`${api.baseUrl}${api.endpoints.products}`, {
    headers: authHeader(token)
  });
  await expectOk(productsRes);
  const productsJson = await productsRes.json();
  const products = productsJson?.products || productsJson?.data || productsJson;
  const productId = extractId(products?.[0]);
  expect(productId).toBeTruthy();

  // Add to cart (accepts either {productId, qty} or {id, quantity})
  const addPayload: any = { productId, qty: 1 }; // eslint-disable-line @typescript-eslint/no-explicit-any
  const cartRes = await request.post(`${api.baseUrl}${api.endpoints.cart}`, {
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    data: addPayload
  });
  await expectOk(cartRes);

  // Attempt to create order via /orders, fallback to /checkout
  const orderPayload: any = {
    items: [{ productId, qty: 1 }],
    address: testData.checkout.address.valid,
    payment: testData.checkout.payment.validCard,
    deliveryOption: testData.checkout.deliveryOption
  };

  let orderRes = await request.post(`${api.baseUrl}${api.endpoints.orders}`, {
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    data: orderPayload
  });

  if (![200, 201].includes(orderRes.status())) {
    // Fallback to /checkout
    orderRes = await request.post(`${api.baseUrl}${api.endpoints.checkout}`, {
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      data: orderPayload
    });
  }

  await expectOk(orderRes);
  const orderJson = await orderRes.json();
  const order = orderJson?.order || orderJson?.data || orderJson;
  expect(extractId(order)).toBeTruthy();
});

// 4) Optional: custom user creation to demonstrate reusability of chaining pieces

test('API chain: custom signup payload and subsequent login @api @chain', async ({ request }) => {
  const payload = createUniqueUserPayload();
  const signupRes = await request.post(`${api.baseUrl}${api.endpoints.signup}`, { data: payload });
  await expectOk(signupRes);

  const loginRes = await request.post(`${api.baseUrl}${api.endpoints.login}`, { data: { email: payload.email, password: payload.password } });
  await expectOk(loginRes);
  const loginJson = await loginRes.json();
  const token = loginJson?.token || loginJson?.accessToken;
  expect(token).toBeTruthy();
});

import { test, expect } from '@playwright/test';
import { testData, api } from '../utils/testData';

test.describe('Authentication', () => {
  const base = api.baseUrl;
  const pages = testData.pages;
  const msgs = testData.messages;

  test('AUTH-001 Login with valid credentials', async ({ page }) => {
    await page.goto(`${base}${pages.login}`);
    await page.getByRole('textbox', { name: /email/i }).fill(testData.validUser.email);
    await page.getByLabel(/password/i).fill(testData.validUser.password);
    await page.getByRole('button', { name: /login/i }).click();

    // Expect user logged in: logout link/button visible or welcome text
    const logoutLink = page.getByRole('link', { name: /logout|sign out/i });
    const logoutBtn = page.getByRole('button', { name: /logout|sign out/i });
    await expect(logoutLink.or(logoutBtn)).toBeVisible();
  });

  test('AUTH-002 Login with invalid credentials', async ({ page }) => {
    await page.goto(`${base}${pages.login}`);
    await page.getByRole('textbox', { name: /email/i }).fill(testData.invalidUser.email);
    await page.getByLabel(/password/i).fill(testData.invalidUser.password);
    await page.getByRole('button', { name: /login/i }).click();

    await expect(page.getByText(new RegExp(msgs.invalidLogin, 'i'))).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${pages.login}$`));
  });

  test('AUTH-003 Login with empty fields', async ({ page }) => {
    await page.goto(`${base}${pages.login}`);
    await page.getByRole('button', { name: /login/i }).click();

    // Expect two "required" validation messages
    await expect(page.getByText(new RegExp(msgs.requiredField, 'i'))).toHaveCount(2);
  });

  test('AUTH-004 Password reset / Forgot password', async ({ page }) => {
    await page.goto(`${base}${pages.login}`);
    const forgotLink = page.getByRole('link', { name: /forgot password/i });
    if (await forgotLink.isVisible()) {
      await forgotLink.click();
    } else {
      await page.goto(`${base}${pages.forgotPassword}`);
    }

    await page.getByRole('textbox', { name: /email/i }).fill(testData.validUser.email);
    await page.getByRole('button', { name: /submit|send|reset/i }).click();

    await expect(page.getByText(new RegExp(msgs.resetEmailSent, 'i'))).toBeVisible();
  });

  test('AUTH-005 Registration / Sign up with valid data', async ({ page }) => {
    const unique = Date.now();
    const email = `user+${unique}@example.com`;
    const password = 'StrongPassw0rd!';

    await page.goto(`${base}${pages.register}`);
    await page.getByRole('textbox', { name: /name/i }).fill(`User ${unique}`);
    await page.getByRole('textbox', { name: /email/i }).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByLabel(/confirm password|confirm/i).fill(password);
    await page.getByRole('button', { name: /sign up|register|create account/i }).click();

    // Expect logged in or confirmation/welcome
    const welcome = page.getByText(new RegExp(msgs.welcome, 'i'));
    const logout = page.getByRole('link', { name: /logout|sign out/i }).or(
      page.getByRole('button', { name: /logout|sign out/i })
    );
    await expect(welcome.or(logout)).toBeVisible();
  });

  test('AUTH-006 Registration with invalid data', async ({ page }) => {
    await page.goto(`${base}${pages.register}`);
    await page.getByRole('textbox', { name: /name/i }).fill(''); // missing
    await page.getByRole('textbox', { name: /email/i }).fill('invalid-email');
    await page.getByLabel(/password/i).fill('123'); // weak
    await page.getByLabel(/confirm password|confirm/i).fill('456'); // mismatch
    await page.getByRole('button', { name: /sign up|register|create account/i }).click();

    // Expect field-level validation errors
    await expect(page.getByText(/invalid email|email is invalid|enter a valid email/i)).toBeVisible();
    await expect(page.getByText(/password.*weak|too short|requirements/i)).toBeVisible();
    await expect(page.getByText(/passwords do not match|confirm password/i)).toBeVisible();
  });

  test('AUTH-007 Logout', async ({ page }) => {
    // Precondition: log in
    await page.goto(`${base}${pages.login}`);
    await page.getByRole('textbox', { name: /email/i }).fill(testData.validUser.email);
    await page.getByLabel(/password/i).fill(testData.validUser.password);
    await page.getByRole('button', { name: /login/i }).click();

    const logout = page.getByRole('link', { name: /logout|sign out/i }).or(
      page.getByRole('button', { name: /logout|sign out/i })
    );
    await expect(logout).toBeVisible();
    await logout.click();

    // Expect redirected to login or login link visible
    await expect(page).toHaveURL(new RegExp(`${pages.login}`));
    await expect(page.getByRole('button', { name: /login/i }).or(page.getByRole('link', { name: /login/i }))).toBeVisible();
  });
});

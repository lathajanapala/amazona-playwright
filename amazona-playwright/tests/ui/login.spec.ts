import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/loginPage';
import { testData } from '../../utils/testData';

test.describe('Login @ui', () => {
  test('valid login shows account UI', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(testData.validUser.email, testData.validUser.password);
    await login.assertLoginSuccess();
  });

  test('invalid login shows error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(testData.invalidUser.email, testData.invalidUser.password);
    await expect(login.errorMessage()).toBeVisible();
  });
});

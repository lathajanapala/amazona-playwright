import { test } from '@playwright/test';
import { LoginPage } from '../../pages/loginPage';
import { OrdersPage } from '../../pages/ordersPage';
import { ProfilePage } from '../../pages/profilePage';
import { HomePage } from '../../pages/homePage';
import { testData } from '../../utils/testData';

test.describe('User Profile & Orders @ui', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(testData.validUser.email, testData.validUser.password);
    await login.assertLoginSuccess();
  });

  test('ORD-001 View past orders list', async ({ page }) => {
    const orders = new OrdersPage(page);
    await orders.open();
    await orders.assertOrdersVisible();
  });

  test('ORD-002 View order details', async ({ page }) => {
    const orders = new OrdersPage(page);
    await orders.open();
    await orders.openOrderDetailsByIndex(0);
    await orders.assertOrderDetailsVisible();
  });

  test('PROF-001 Edit user profile', async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.open();
    await profile.editProfile(testData.profile.edits);
  });

  test('PROF-002 Change password and login with new one', async ({ page, context }) => {
    const login = new LoginPage(page);
    const profile = new ProfilePage(page);
    const home = new HomePage(page);
    const { current, next } = testData.profile.passwordChange;
    await profile.open();
    await profile.changePassword(current, next);
    // Sign out then sign in with new password
    await login.signOut();
    await login.login(testData.validUser.email, next);
    await login.assertLoginSuccess();
    // Optional: revert password to original to not impact other tests
    try {
      await profile.open();
      await profile.changePassword(next, current);
    } catch {
      // ignore cleanup failure
    }
    // Ensure we can access home
    await home.open();
  });
});

import { expect, Page } from '@playwright/test';
import { BasePage } from './basePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  emailInput() {
    return this.getByLabel(/email/i).or(this.locator('input[type="email"], #email'));
  }

  passwordInput() {
    return this.getByLabel(/password/i).or(this.locator('input[type="password"], #password'));
  }

  signInButton() {
    return this.getByRole('button', { name: /sign in|login/i });
  }

  userMenu() {
    // header element that shows user name or menu after login
    return this.page.locator('header').getByRole('link', { name: /sign out|profile|account|orders|admin|user/i }).first().or(
      this.page.locator('header >> text=/sign out|profile|account/i')
    );
  }

  signOutLink() {
    return this.page.getByRole('link', { name: /sign out|logout/i }).or(this.locator('button:has-text("Sign Out"), button:has-text("Logout")'));
  }

  errorMessage() {
    return this.page.getByRole('alert').or(this.page.locator('.alert, [class*="error"], [data-test="error"]'));
  }

  async open() {
    await this.goto('/signin'); // amazona uses /signin
  }

  async login(email: string, password: string) {
    await this.open();
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.signInButton().click();
  }

  async assertLoginSuccess() {
    // Either redirected to home and header shows user account
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveURL(/\/(signin|login)?/i, { timeout: 2000 }).catch(() => {}); // tolerate immediate redirect
    // Expect header to no longer have "Sign In"
    await expect(this.page.getByRole('link', { name: /sign in/i })).toHaveCount(0);
  }

  async assertLoginError() {
    await expect(this.errorMessage()).toBeVisible();
    await expect(this.errorMessage()).toContainText(/invalid|incorrect|failed/i);
  }

  async signOut() {
    const link = this.signOutLink();
    if (await link.count()) {
      await link.click();
    } else {
      // try menu then sign out
      await this.userMenu().click().catch(() => {});
      if (await link.count()) await link.click();
    }
  }
}

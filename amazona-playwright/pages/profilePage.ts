import { expect, Page } from '@playwright/test';
import { BasePage } from './basePage';

export class ProfilePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }
  async open() {
    await this.goto('/profile');
  }
  nameInput() {
    return this.getByLabel(/name/i);
  }
  addressInput() {
    return this.getByLabel(/address/i);
  }
  phoneInput() {
    return this.getByLabel(/phone|mobile/i);
  }
  saveButton() {
    return this.getByRole('button', { name: /save|update/i });
  }
  successAlert() {
    return this.page.getByRole('alert').or(this.page.locator('.alert-success, [data-test="success"]'));
  }
  // Change password
  currentPasswordInput() {
    return this.getByLabel(/current password|old password/i);
  }
  newPasswordInput() {
    return this.getByLabel(/new password/i);
  }
  confirmPasswordInput() {
    return this.getByLabel(/confirm password|confirm/i);
  }
  changePasswordButton() {
    return this.getByRole('button', { name: /change password|update password/i });
  }
  ordersLink() {
    return this.page.getByRole('link', { name: /orders|order history/i });
  }
  async editProfile({ name, address, phone }: { name?: string; address?: string; phone?: string }) {
    if (name) await this.nameInput().fill(name);
    if (address) await this.addressInput().fill(address);
    if (phone) await this.phoneInput().fill(phone);
    await this.saveButton().click();
    await expect(this.successAlert()).toBeVisible();
  }
  async changePassword(current: string, next: string) {
    await this.currentPasswordInput().fill(current);
    await this.newPasswordInput().fill(next);
    await this.confirmPasswordInput().fill(next);
    await this.changePasswordButton().click();
    await expect(this.successAlert()).toBeVisible();
  }
}

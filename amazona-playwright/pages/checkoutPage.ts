import { expect, Page } from '@playwright/test';
import { BasePage } from './basePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Shipping
  fullNameInput() {
    return this.getByLabel(/full name|name/i);
  }
  addressInput() {
    return this.getByLabel(/address/i);
  }
  cityInput() {
    return this.getByLabel(/city/i);
  }
  postalCodeInput() {
    return this.getByLabel(/postal|zip/i);
  }
  countryInput() {
    return this.getByLabel(/country/i);
  }
  continueButton() {
    return this.getByRole('button', { name: /continue|next|place order|pay/i });
  }
  validationError() {
    return this.page.getByRole('alert').or(this.page.locator('.error, .invalid-feedback, [data-test="validation-error"]'));
  }

  // Payment selection
  paymentMethodRadio(name: string) {
    return this.page.getByRole('radio', { name: new RegExp(name, 'i') });
  }
  cardNumberInput() {
    return this.getByLabel(/card number|number/i).or(this.locator('input[name*="card" i]'));
  }
  expiryInput() {
    return this.getByLabel(/exp|expiry|expiration/i).or(this.locator('input[name*="exp" i]'));
  }
  cvvInput() {
    return this.getByLabel(/cvv|cvc|security code/i).or(this.locator('input[name*="cvv" i], input[name*="cvc" i]'));
  }
  cardNameInput() {
    return this.getByLabel(/name on card|cardholder|name/i);
  }

  placeOrderButton() {
    return this.getByRole('button', { name: /place order/i }).or(this.locator('button[type="submit"]'));
  }

  successMessage() {
    return this.page.getByRole('heading', { name: /order placed|success|thank/i }).or(this.page.locator('[data-test="order-success"], .alert-success'));
  }

  promoCodeInput() {
    return this.getByLabel(/promo|coupon/i).or(this.locator('input[name*="promo" i], input[name*="coupon" i]'));
  }
  applyPromoButton() {
    return this.getByRole('button', { name: /apply/i });
  }
  promoSuccess() {
    return this.page.getByText(/discount applied/i).or(this.page.locator('[data-test="promo-success"], .alert-success'));
  }
  promoError() {
    return this.page.getByText(/invalid promo|invalid code/i).or(this.page.locator('[data-test="promo-error"], .alert-danger'));
  }

  orderSummary() {
    return this.page.locator('[data-test="order-summary"], #order-summary, .order-summary');
  }
  summarySubtotal() {
    return this.orderSummary().locator('text=/subtotal/i');
  }
  summaryTax() {
    return this.orderSummary().locator('text=/tax/i');
  }
  summaryShipping() {
    return this.orderSummary().locator('text=/shipping/i');
  }
  summaryTotal() {
    return this.orderSummary().locator('text=/total/i');
  }

  async fillShippingAddress(sample?: Partial<Record<string, string>>) {
    await this.fullNameInput().fill(sample?.name || 'John Test');
    await this.addressInput().fill(sample?.address || '1 Test St');
    await this.cityInput().fill(sample?.city || 'Testville');
    await this.postalCodeInput().fill(sample?.postal || '12345');
    await this.countryInput().fill(sample?.country || 'USA');
    await this.continueButton().click();
  }

  async submitEmptyShipping() {
    // Try to proceed without filling to trigger validation
    await this.continueButton().click();
  }

  async selectPayment(name = 'PayPal') {
    const radio = this.paymentMethodRadio(name);
    if (await radio.count()) await radio.check();
    await this.continueButton().click();
  }

  async fillCardDetails(card: { cardNumber: string; expiry: string; cvv: string; name: string }) {
    await this.cardNumberInput().fill(card.cardNumber);
    await this.expiryInput().fill(card.expiry);
    await this.cvvInput().fill(card.cvv);
    await this.cardNameInput().fill(card.name);
  }

  async applyPromo(code: string) {
    const input = this.promoCodeInput();
    if (await input.count()) {
      await input.fill(code);
      await this.applyPromoButton().click();
    }
  }

  async placeOrder() {
    await this.placeOrderButton().click();
  }

  async assertOrderSuccess() {
    await expect(this.successMessage()).toBeVisible();
  }
}

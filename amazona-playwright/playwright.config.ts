import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

// Prefer BASE_URL, then WEB_SERVER_URL, then default localhost
const baseURL = process.env.BASE_URL || process.env.WEB_SERVER_URL || 'http://localhost:3000';

// Optional: allow CI to start a local web server via Playwright
const webServerCommand = process.env.WEB_SERVER_CMD;
const webServerUrl = process.env.WEB_SERVER_URL || baseURL;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  workers: '50%',
  reporter: [['line'], ['allure-playwright']],
  use: {
    baseURL,
    headless: true,
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  },
  // Start app locally on CI if WEB_SERVER_CMD is provided; otherwise assume BASE_URL points to a reachable env
  webServer: webServerCommand
    ? {
        command: webServerCommand,
        url: webServerUrl,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
      }
    : undefined,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ]
});

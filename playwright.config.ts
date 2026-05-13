import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const storagePath = path.join(__dirname, 'storageState.json');

export default defineConfig({
  timeout: 120 * 1000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  maxFailures: process.env.CI ? 5 : 0,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results.json' }],
  ],
  use: {
    baseURL: 'https://www.redfin.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    storageState: fs.existsSync(storagePath) ? storagePath : undefined,
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'Upgrade-Insecure-Requests': '1',
    },
    launchOptions: {
      // Removes the "Chrome is being controlled by automated software" banner
      // and disables the navigator.webdriver flag at the Blink engine level
      args: ['--disable-blink-features=AutomationControlled'],
    },
  },
  projects: [
    // ── Network-Mocked UI (Layer 1) — deterministic, zero bot risk ──────────
    {
      name: 'ui-mocked',
      testDir: './src/tests/ui/mocked',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },

    // ── Live UI — real Redfin, graceful anti-bot fallback ───────────────────
    {
      name: 'web-chromium',
      testDir: './src/tests/ui/regression',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
    {
      name: 'web-firefox',
      testDir: './src/tests/ui/regression',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'web-webkit',
      testDir: './src/tests/ui/regression',
      use: { ...devices['Desktop Safari'] },
    },

    // ── Census API (Layer 2) — real public API, no auth, no browser ─────────
    {
      name: 'api-census',
      testDir: './src/tests/api',
      use: {
        baseURL: 'https://api.census.gov',
      },
    },
  ],
});

// Testet padel/index.html direkt aus der Datei – kein Server nötig.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './padel/tests',
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    ...devices['iPhone 13'],
    browserName: 'chromium',
    defaultBrowserType: 'chromium',
  },
});

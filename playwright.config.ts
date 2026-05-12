import { defineConfig, devices } from '@playwright/test';
import { E2E_NEXTAUTH_SECRET } from './e2e/global-setup';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: 'http://localhost:4000',
    storageState: 'playwright/.auth/user.json',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: process.env.CI ? 'bun run start' : 'bun run dev',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXTAUTH_SECRET: E2E_NEXTAUTH_SECRET,
      NEXTAUTH_URL: 'http://localhost:4000',
      INTERNAL_EMAIL_DOMAIN: 'tcc-technology.com',
    },
  },
});

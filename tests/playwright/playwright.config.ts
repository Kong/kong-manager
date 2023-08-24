import type { PlaywrightTestConfig } from '@playwright/test'
import * as dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const config: PlaywrightTestConfig = {
  reporter: [['junit', { outputFile: './test-results/playwright.xml' }]],
  testDir: '.', // Using default value here. Let's keep it here to prevent it from being forgotten in future migrations.
  retries: 1,
  workers: 1,
  use: {
    actionTimeout: 5000,
    baseURL: process.env.KM_TEST_GUI_URL ?? 'http://localhost:8080',
    headless: true,
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    contextOptions: {
      permissions: ['clipboard-read', 'clipboard-write'],
    },
  },
}

export default config

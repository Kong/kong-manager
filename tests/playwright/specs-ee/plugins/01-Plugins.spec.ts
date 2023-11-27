import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'

const test = baseTest()

test.describe('PLACEHOLDER', () => {
  test.skip('is enterprise edition', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[aria-label="Gateway"] .info-list')).toContainText('enterprise')
  })
})

import type { Page } from '@playwright/test'

export const waitAndDismissToasts = async (page: Page) => {
  await page.waitForSelector('.toaster-item')
  const locators = page.locator('.toaster-item button.close')

  for (let i = 0; i < await locators.count(); i++) {
    await locators.nth(i).click()
  }

  await page.waitForSelector('.toaster-item', { state: 'hidden' })
}

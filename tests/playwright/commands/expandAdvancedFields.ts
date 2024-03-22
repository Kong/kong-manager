import type { Page } from '@playwright/test'

// This command expands advanced fields in plugin form
export const expandAdvancedFields = async (page: Page) => {
  await page.waitForSelector('.entity-form .vue-form-generator')
  const advancedFields = page.locator('.k-collapse').last()

  if (await advancedFields.isVisible() && await advancedFields.locator('.k-collapse-hidden-content').isHidden()) {
    await advancedFields.locator('.k-collapse-trigger-icon').click()
  }
}

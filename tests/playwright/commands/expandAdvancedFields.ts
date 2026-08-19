import type { Page } from '@playwright/test'

// This command expands advanced fields in plugin form
export const expandAdvancedFields = async (page: Page) => {
  await page.locator('.entity-form .ff-plugin-configuration-form').waitFor({ state: 'attached' })

  const advancedFieldsExpandTrigger = page.locator('[data-testid="ff-advanced-fields-container"] [data-testid="collapse-trigger-content"]')

  if (await advancedFieldsExpandTrigger.isVisible()) {
    if ((await advancedFieldsExpandTrigger.getAttribute('aria-expanded')) !== 'true') {
      await advancedFieldsExpandTrigger.click()
    }
  }
}

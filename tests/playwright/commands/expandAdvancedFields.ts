import type { Page } from '@playwright/test'

// This command expands advanced fields in plugin form
export const expandAdvancedFields = async (page: Page) => {
  await page
    .locator('.entity-form > .vue-form-generator > fieldset')
    .or(page.locator('.entity-form .k-tabs')) // for oidc plugin
    .waitFor({ state: 'attached' })
  const advancedFieldsExpandTrigger = page.locator('.k-collapse.nested-collapse .k-collapse-trigger-chevron.kong-icon-chevronRight')

  if (await advancedFieldsExpandTrigger.isVisible()) {
    await advancedFieldsExpandTrigger.click()
  }
}

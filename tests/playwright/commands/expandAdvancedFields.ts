import type { Page } from '@playwright/test'

// This command expands advanced fields in plugin form
export const expandAdvancedFields = async (page: Page) => {
  await page
    .locator('.entity-form > .vue-form-generator > fieldset')
    .or(page.locator('.entity-form .k-tabs')) // for oidc plugin
    .waitFor({ state: 'attached' })
  const advancedFieldsExpandTrigger = page.locator('.k-collapse.nested-collapse .collapse-trigger-icon.chevron-right-icon')

  if (await advancedFieldsExpandTrigger.isVisible()) {
    const classes = await advancedFieldsExpandTrigger.getAttribute('class') ?? ''

    if (!classes.includes('collapse-expanded')) {
      await advancedFieldsExpandTrigger.click()
    }
  }
}

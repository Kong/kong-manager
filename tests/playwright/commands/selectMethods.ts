import { expect, type Page } from '@playwright/test'

export const selectMethods = async (page: Page, methods: string[], is_enabled = false) => {
  if (!is_enabled) {
    await page.getByTestId('routing-rule-methods').click()
  }

  await expect(page.locator('.routing-rule-input .methods-input-container')).toBeVisible()

  await Promise.all(methods.map((method) => {
    return page
      .locator('.routing-rule-input .methods-input')
      .filter({ hasText: method })
      .locator('.k-input-switch')
      .click()
  }))
}

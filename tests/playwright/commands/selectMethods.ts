import { expect, type Page } from '@playwright/test'

export const selectMethods = async (page: Page, methods: string[], is_enabled = false) => {
  if (!is_enabled) {
    await page.getByTestId('routing-rule-methods').click()
  }

  await expect(page.locator('.routing-rule-input .methods-input')).toBeVisible()

  await Promise.all(methods.map((method) => {
    return page
      .locator('.routing-rule-input .methods-input .k-badge')
      .filter({ hasText: method })
      .click()
  }))
}

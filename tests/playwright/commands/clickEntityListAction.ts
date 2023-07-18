import type { Locator, Page } from '@playwright/test'

export const clickEntityListAction = async (
  pageOrLocator: Page | Locator,
  action: string,
  nth = 1
) => {
  const row = pageOrLocator
    .locator('.k-table')
    .locator('tr')
    .nth(nth)

  await row.locator('[data-testid="overflow-actions-button"]').click()
  await row
    .locator('[data-testid="k-dropdown-list"]')
    .locator(`[data-testid="action-entity-${action}"] .k-dropdown-item-trigger`)
    .click()
}

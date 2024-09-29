import type { Locator, Page } from '@playwright/test'

export const clickEntityListAction = async (
  pageOrLocator: Page | Locator,
  action: string,
  nth = 1,
) => {
  const row = pageOrLocator
    .locator('.k-table-data')
    .locator('tr')
    .nth(nth)

  await row.locator('[data-testid="row-actions-dropdown-trigger"]').click()
  await row
    .locator('[data-testid="dropdown-list"]')
    .locator(`[data-testid="action-entity-${action}"]`)
    .click()
}

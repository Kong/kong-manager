import type { Locator, Page } from '@playwright/test'

export const clickEntityListAction = async (
  pageOrLocator: Page | Locator,
  action: string,
  nth = 1,
  page?: Page,
) => {
  // if the first argument is a Locator, the fourth argument must be provided
  if (('blur' in pageOrLocator) && page === undefined) {
    throw new Error('When the first argument is a Locator, provide a Page object as the last argument')
  }

  const row = pageOrLocator
    .locator('.k-table-data')
    .locator('tr')
    .nth(nth)

  await row.locator('[data-testid="row-actions-dropdown-trigger"]').click()
  await (page ?? pageOrLocator)
    .locator('body')
    .locator('[data-testid="dropdown-list"]:visible')
    .locator(`[data-testid="action-entity-${action}"]`)
    .click()
}

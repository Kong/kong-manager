import type { Page } from '@playwright/test'

export const autocompleteDeleteModal = async (page: Page) => {
  const name = await page
    .locator('.kong-ui-entity-delete-modal .k-prompt-confirm-text span')
    .textContent()

  await page
    .locator('.kong-ui-entity-delete-modal')
    .locator('[data-testid="confirmation-input"]')
    .type(name ?? '')
  await page.locator('.kong-ui-entity-delete-modal .k-prompt-proceed').click()
}

import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

export const autocompleteDeleteModal = async (page: Page) => {
  await expect(page.locator('.kong-ui-entity-delete-modal .modal-container')).toBeVisible()

  if (await page.locator('.kong-ui-entity-delete-modal .prompt-confirmation-text span').isVisible()) {
    const name = (await page
      .locator('.kong-ui-entity-delete-modal .prompt-confirmation-text span')
      .textContent())
      ?.slice(1, -1) // Remove quotes

    await page
      .locator('.kong-ui-entity-delete-modal')
      .locator('[data-testid="confirmation-input"]')
      .fill(name ?? '')
  }

  await page.locator('.kong-ui-entity-delete-modal [data-testid="modal-action-button"]').click()
}

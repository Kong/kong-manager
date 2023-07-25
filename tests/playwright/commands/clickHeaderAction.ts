import type { Page } from '@playwright/test'

export const clickHeaderAction = async (page: Page, action: string) => {
  await page
    .locator('[data-testid="header-actions"]')
    .locator(`[data-testid="header-${action}-button"]`)
    .click()
}

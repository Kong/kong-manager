import type { Page } from '@playwright/test'

export const switchDetailTab = async (page: Page, tab: string) => {
  await page
    .locator(`.k-tabs #${tab}-tab`)
    .click()
}

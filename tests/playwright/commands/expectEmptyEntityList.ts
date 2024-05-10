import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export const expectEmptyEntityList = async (page: Page, entity: string, description: string) => {
  await expect(page.locator(`.kong-ui-entities-${entity}-list .table-empty-state .primary`)).toBeVisible()
  await expect(page.locator(`.kong-ui-entities-${entity}-list .table-empty-state .empty-state-title`)).toHaveText(description)
}

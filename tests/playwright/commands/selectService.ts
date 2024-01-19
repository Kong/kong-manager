import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export const selectService = async (page: Page, serviceId: string) => {
  const locator = page.locator('.k-select').filter({ hasText: 'Service' })

  await expect(locator.locator('[data-testid="route-form-service-id"]')).toBeVisible()
  await locator.locator('[data-testid="route-form-service-id"]').click()
  await locator.locator(`[data-testid="select-item-${serviceId}"]`).click()
}

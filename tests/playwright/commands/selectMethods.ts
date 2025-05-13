import { type Page } from '@playwright/test'

export const selectMethods = async (page: Page, methods: string[]) => {
  await page.getByTestId('route-form-methods').getByTestId('multiselect-trigger').click()

  for (const method of methods) {
    const locator = page.getByTestId('route-form-methods').getByTestId(`multiselect-item-${method}`)
    await locator.scrollIntoViewIfNeeded()
    await locator.click()
  }
}

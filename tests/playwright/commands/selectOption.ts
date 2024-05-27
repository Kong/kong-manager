import type { Locator } from '@playwright/test'

export const selectOption = async (locator: Locator, option: string) => {
  const selectRoot = locator.locator('.k-select').or(locator)
  const selectTrigger = selectRoot.locator('.k-input.select-input')

  await selectTrigger.click()
  await selectRoot.locator(`.select-item[data-testid="select-item-${option}"]`).click()
}

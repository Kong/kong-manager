import type { Locator } from '@playwright/test'

export const selectOption = async (locator: Locator, option: string) => {
  const selectRoot = locator.locator('.k-select').or(locator)
  const selectTrigger = selectRoot.locator('.k-input-wrapper.k-select-input')

  await selectTrigger.click()
  await selectRoot.locator(`.k-select-item[data-testid="k-select-item-${option}"]`).click()
}

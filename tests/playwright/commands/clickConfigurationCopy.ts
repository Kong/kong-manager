import type { Page, Locator } from '@playwright/test'
import { selectOption } from './selectOption'

export const clickConfigurationCopy = async (pageOrLocator: Page | Locator, entity: string) => {
  const configCardLocator = pageOrLocator.locator(`.kong-ui-${entity}-entity-config-card`)

  await selectOption(configCardLocator.locator('.config-card-actions'), 'json')
  await configCardLocator.getByTestId('k-code-block-copy-button').click()
}

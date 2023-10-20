import type { Page, Locator } from '@playwright/test'
import { selectOption } from './selectOption'

export const clickConfigurationCopy = async (pageOrLocator: Page | Locator, entity: string) => {
  await selectOption(pageOrLocator.locator(`.kong-ui-${entity}-entity-config-card .config-card-actions`), 'json')
}

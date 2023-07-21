export const clickConfigurationCopy = async (pageOrLocator: Page | Locator, entity: string) => {
  await pageOrLocator.locator(`.kong-ui-${entity}-entity-config-card`)
    .locator('.config-card-actions')
    .locator('[data-testid="json-copy-button"]')
    .click()
}
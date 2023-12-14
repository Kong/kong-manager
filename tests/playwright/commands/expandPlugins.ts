import type { Page } from '@playwright/test'

// This command expands all plugins in the plugin select page
export const expandPlugins = async (page: Page) => {
  await page.waitForSelector('.plugin-select-grid')
  const expandTriggers = page.locator('.plugins-collapse .k-collapse-trigger-content')

  for (let i = 0; i < await expandTriggers.count(); i++) {
    await expandTriggers.nth(i).click()
  }
}

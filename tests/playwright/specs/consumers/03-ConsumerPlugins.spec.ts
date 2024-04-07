import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'
import { clearKongResources } from '@pw/commands/clearKongResources'
import { clickEntityListAction } from '@pw/commands/clickEntityListAction'
import { createKongResource } from '@pw/commands/createKongResource'
import { expandAdvancedFields } from '@pw/commands/expandAdvancedFields'
import { switchDetailTab } from '@pw/commands/switchDetailTab'
import { withNavigation } from '@pw/commands/withNavigation'
import { ConsumerListPage } from '@pw/pages/consumers'
import { PluginListPage } from '@pw/pages/plugins'

const mockConsumerName = 'testUser'
const mockTag = 'testTag'

const test = baseTest()

test.describe('consumer plugins', () => {
  test.beforeAll(async () => {
    await clearKongResources('/consumers')
    await clearKongResources('/plugins')
    await createKongResource('/consumers', {
      username: mockConsumerName,
    })
  })

  test.beforeEach(async ({ page }) => {
    await new ConsumerListPage(page).goto()
  })

  test.afterAll(async () => {
    await clearKongResources('/consumers')
    await clearKongResources('/plugins')
  })

  test('install a plugin from the Plugins tab', async ({ page }) => {
    await withNavigation(page, async () => await clickEntityListAction(page, 'view'))
    const uuid = await page.locator('.copy-container').innerText()

    await switchDetailTab(page, 'plugins')
    await withNavigation(
      page,
      async () => await page.locator('.empty-state-action .primary').click()
    )
    await withNavigation(
      page,
      async () => await page.getByTestId('datadog-card').click()
    )
    await expect(page.locator('.autosuggest #consumer-id')).toBeVisible()
    await expect(page.locator('.autosuggest #consumer-id')).toHaveValue(new RegExp(`${mockConsumerName}\\s*-\\s*${uuid}`))
    await withNavigation(
      page,
      async () => await page.locator('[data-testid="form-actions"] .primary').click()
    )
  })

  test('submit/cancel plugin editing', async ({ page }) => {
    await withNavigation(page, async () => await clickEntityListAction(page, 'view'))
    await switchDetailTab(page, 'plugins')
    await clickEntityListAction(page, 'edit')
    await expandAdvancedFields(page)
    await page.locator('#tags').fill(mockTag)
    await withNavigation(
      page,
      () => page.locator('[data-testid="form-actions"] .primary').click(),
    )
    await expect(page.locator('.k-table [data-testid="tags"]')).toHaveText(mockTag)

    await withNavigation(page, () => clickEntityListAction(page, 'edit'))
    await expandAdvancedFields(page)
    await page.locator('#tags').fill(`${mockTag}${mockTag}`)
    await withNavigation(
      page,
      async () => await page.locator('[data-testid="form-cancel"]').click()
    )
    await expect(page.locator('.k-table [data-testid="tags"]')).toHaveText(mockTag)
  })

  test('change scope from global to scoped', async ({ page }) => {
    await clearKongResources('/plugins')
    await clearKongResources('/consumers')
    await createKongResource('/consumers', {
      username: mockConsumerName,
    })

    const consumerListPage = new ConsumerListPage(page)
    const pluginListPage = new PluginListPage(page)

    // create a global plugin
    await pluginListPage.goto()
    await withNavigation(page, async () => await page.locator('.kong-ui-entities-plugins-list [data-testid="new-plugin"]').click())
    await page.locator('[data-testid="Rate Limiting"]').click()
    await page.waitForSelector('.kong-ui-entities-plugin-form-container')
    await expandAdvancedFields(page)
    await page.locator('#config-second').fill('30')
    await withNavigation(
      page,
      async () => await page.locator('[data-testid="form-actions"] .primary').click()
    )
    await expect(page.locator('.kong-ui-entities-plugins-list [data-testid="appliedTo"] .k-badge')).toContainText('Global')

    // Update plugin and scope it to consumer
    await withNavigation(page, () => clickEntityListAction(page, 'edit'))
    await page.waitForSelector('.kong-ui-entities-plugin-form-container')
    await page.click('.selection-group .Scoped-check')
    await page.click('#consumer-id')
    await page.fill('#consumer-id', mockConsumerName)
    await page.waitForTimeout(300)
    await expect(page.locator('.select-item')).toContainText(mockConsumerName)
    await page.click('.select-item')
    await withNavigation(page, () => page.click(consumerListPage.$.submitButton))
    await expect(page.locator('.kong-ui-entities-plugins-list [data-testid="appliedTo"] .k-badge')).toContainText('Consumer')
  })

  test('change scope from scoped to global', async ({ page }) => {
    const consumerListPage = new ConsumerListPage(page)
    const pluginListPage = new PluginListPage(page)

    await page.waitForTimeout(100)
    await pluginListPage.goto()
    await expect(page.locator('.kong-ui-entities-plugins-list [data-testid="appliedTo"] .k-badge')).toContainText('Consumer')
    await withNavigation(page, () => clickEntityListAction(page, 'edit'))
    await page.waitForSelector('.kong-ui-entities-plugin-form-container')
    await page.click('.selection-group .Global-check')
    await withNavigation(page, () => page.click(consumerListPage.$.submitButton))
    await expect(page.locator('.kong-ui-entities-plugins-list [data-testid="appliedTo"] .k-badge')).toContainText('Global')
  })
})

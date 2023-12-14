import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'
import { autocompleteDeleteModal } from '@pw/commands/autocompleteDeleteModal'
import { clearKongResources } from '@pw/commands/clearKongResources'
import { clickEntityListAction } from '@pw/commands/clickEntityListAction'
import { createKongResource } from '@pw/commands/createKongResource'
import { expandPlugins } from '@pw/commands/expandPlugins'
import { fillEntityForm } from '@pw/commands/fillEntityForm'
import { switchDetailTab } from '@pw/commands/switchDetailTab'
import { waitAndDismissToasts } from '@pw/commands/waitAndDismissToast'
import { withNavigation } from '@pw/commands/withNavigation'
import { PluginListPage } from '@pw/pages/plugins'
import { ServiceListPage } from '@pw/pages/services'

let testService: { id: string; name: string; url: string } | undefined

const test = baseTest().extend<{
  pluginListPage: PluginListPage
  serviceListPage: ServiceListPage
}>({
  pluginListPage: async ({ page }, use) => await use(new PluginListPage(page)),
  serviceListPage: async ({ page }, use) => await use(new ServiceListPage(page)),
})

test.describe('service plugins', () => {
  test.beforeAll(async () => {
    await clearKongResources('/plugins')
    await clearKongResources('/routes')
    await clearKongResources('/services')

    testService = (await createKongResource('/services', {
      name: 'testService',
      url: 'http://example.com:8080/test',
    }))?.data
  })

  test.afterAll(async () => {
    await clearKongResources('/plugins')
    await clearKongResources('/routes')
    await clearKongResources('/services')
  })

  test('service plugin has service id prefilled', async ({ page }) => {
    await page.goto(`/services/${testService?.id}/plugins`)
    await withNavigation(page, () =>
      page.click('.kong-ui-entities-plugins-list [data-testid="new-plugin"]')
    )
    await expandPlugins(page)
    await page.getByTestId('hmac-auth-card').click()
    await expect(page.locator('.autosuggest #service-id')).toHaveValue(new RegExp(`${testService?.name}\\s*-\\s*${testService?.id}`))
  })

  test('create an service-associated plugin via tab', async ({ page, serviceListPage }) => {
    await serviceListPage.goto()
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await switchDetailTab(page, 'plugins')
    await page.waitForSelector('.kong-ui-entities-plugins-list .empty-state-wrapper')
    await withNavigation(page, () =>
      page.click('.kong-ui-entities-plugins-list [data-testid="new-plugin"]')
    )
    await withNavigation(page, () =>
      page.getByTestId('basic-auth-card').click()
    )

    await fillEntityForm({ page })
    await withNavigation(page, () => page.getByTestId('form-footer-actions').locator('.k-button.primary').click())
    await waitAndDismissToasts(page)

    await page.waitForSelector('.kong-ui-entities-plugins-list')
  })

  test('status label in list item should work', async ({ page }) => {
    const row = page.locator('.kong-ui-entities-plugins-list tr[data-testid="basic-auth"]')
    const statusLabel = row.locator('.k-input-switch .toggle-label')
    const statusSwitch = row.locator('.k-input-switch .switch-control')

    await expect(statusLabel).toHaveText('Enabled')
    await statusSwitch.click()

    await page
      .locator('.k-modal-dialog')
      .locator('.k-button.k-prompt-proceed').click()

    await expect(statusLabel).toHaveText('Disabled')
  })

  test("edit action should bring the user to the plugin's edit page", async ({ page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'edit'))
    await page.waitForSelector('.plugin-form')
  })

  test('cancel button on the edit page should bring the user back to the plugin tab', async ({ page }) => {
    await withNavigation(page, () =>
      page
        .locator('[data-testid="form-footer-actions"]')
        .locator('[data-testid="form-footer-action-cancel"]')
        .click()
    )
    await page.waitForSelector('.kong-ui-entities-plugins-list')
  })

  test('delete the plugin', async ({ page, serviceListPage }) => {
    await serviceListPage.goto()
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await switchDetailTab(page, 'plugins')
    await page.waitForSelector('.kong-ui-entities-plugins-list')
    await clickEntityListAction(page, 'delete')
    await autocompleteDeleteModal(page)
  })

  test('change scope from global to scoped', async ({ page, pluginListPage, serviceListPage }) => {
    await clearKongResources('/plugins')
    await clearKongResources('/services')
    await createKongResource('/services', {
      name: 'test_service',
      url: 'http://tester.com/test',
    })

    // create a global plugin
    await pluginListPage.goto()
    await withNavigation(page, async () => await page.locator('.kong-ui-entities-plugins-list [data-testid="new-plugin"]').click())
    await expandPlugins(page)
    await page.getByTestId('key-auth-card').click()
    await page.waitForSelector('.entity-form')
    await withNavigation(page, async () => await page.click(serviceListPage.$.submitButton))
    await expect(page.locator('.kong-ui-entities-plugins-list [data-testid="appliedTo"] .k-badge')).toContainText('Global')

    // Update plugin and scope it to service
    await withNavigation(page, () => clickEntityListAction(page, 'edit'))
    await page.waitForSelector('.entity-form')
    await page.click('.selection-group .Scoped-check')
    await page.click('#service-id')
    await page.fill('#service-id', 'test_service')
    await page.waitForTimeout(300)
    await expect(page.locator('.k-select-item')).toContainText('test_service')
    await page.click('.k-select-item')
    await page.click(serviceListPage.$.submitButton)
    await withNavigation(page, () => page.click('.k-modal .k-modal-footer .k-button.primary'))
    await expect(page.locator('.kong-ui-entities-plugins-list [data-testid="appliedTo"] .k-badge')).toContainText('Service')
  })

  test('change scope from scoped to global', async ({ page, serviceListPage }) => {
    await expect(page.locator('.kong-ui-entities-plugins-list [data-testid="appliedTo"] .k-badge')).toContainText('Service')
    await withNavigation(page, () => clickEntityListAction(page, 'edit'))
    await page.waitForSelector('.entity-form')
    await page.click('.selection-group .Global-check')
    await page.click(serviceListPage.$.submitButton)
    await withNavigation(page, () => page.click('.k-modal .k-modal-footer .k-button.primary'))
    await expect(page.locator('.kong-ui-entities-plugins-list [data-testid="appliedTo"] .k-badge')).toContainText('Global')
  })
})

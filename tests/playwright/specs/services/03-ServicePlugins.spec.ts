import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'
import { autocompleteDeleteModal } from '@pw/commands/autocompleteDeleteModal'
import { clearKongResources } from '@pw/commands/clearKongResources'
import { clickEntityListAction } from '@pw/commands/clickEntityListAction'
import { createKongResource } from '@pw/commands/createKongResource'
import { fillEntityForm } from '@pw/commands/fillEntityForm'
import { switchDetailTab } from '@pw/commands/switchDetailTab'
import { waitAndDismissToasts } from '@pw/commands/waitAndDismissToast'
import { withNavigation } from '@pw/commands/withNavigation'
import { PluginListPage } from '@pw/pages/plugins'
import { ServiceListPage } from '@pw/pages/services'

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

    await createKongResource('/services', {
      name: 'testService',
      url: 'http://example.com:8080/test',
    })
  })

  test.afterAll(async () => {
    await clearKongResources('/plugins')
    await clearKongResources('/routes')
    await clearKongResources('/services')
  })

  test('create an service-associated plugin via tab', async ({ page, serviceListPage }) => {
    await serviceListPage.goto()
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await switchDetailTab(page, 'plugins')
    await page.waitForSelector('.kong-ui-entities-plugins-list .k-empty-state')
    await withNavigation(page, () =>
      page.click('.kong-ui-entities-plugins-list [data-testid="empty-state-action"]'),
    )
    await withNavigation(page, () =>
      page.getByTestId('basic-auth-card').click(),
    )

    await page.waitForSelector('.vue-form-generator')
    await fillEntityForm({ page })
    await withNavigation(page, () => page.getByTestId('form-actions').locator('.k-button.primary').click())
    await waitAndDismissToasts(page)

    await page.waitForSelector('.kong-ui-entities-plugins-list')
  })

  test('status label in list item should work', async ({ page }) => {
    const row = page.locator('.kong-ui-entities-plugins-list tr[data-testid="basic-auth"]')
    const statusInput = row.locator('.k-input-switch input')
    const statusSwitch = row.locator('.k-input-switch .switch-control')

    await expect(statusInput).toBeChecked()
    await statusSwitch.click()

    await page
      .locator('.modal-container')
      .locator('.k-button[data-testid="modal-action-button"]').click()

    await expect(statusInput).not.toBeChecked()
  })

  test("edit action should bring the user to the plugin's edit page", async ({ page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'edit'))
    await page.waitForSelector('.kong-ui-entities-plugin-form-container')
  })

  test('cancel button on the edit page should bring the user back to the plugin tab', async ({ page }) => {
    await withNavigation(page, () =>
      page
        .locator('[data-testid="form-actions"]')
        .locator('[data-testid="plugin-edit-form-cancel"]')
        .click(),
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
    await withNavigation(page, async () => await page.locator('.kong-ui-entities-plugins-list [data-testid="empty-state-action"]').click())
    await page.getByTestId('key-auth-card').click()
    await page.waitForSelector('.kong-ui-entities-plugin-form-container')
    await withNavigation(page, async () => await page.click(serviceListPage.$.submitButton))
    await pluginListPage.goto()
    await expect(page.locator('.kong-ui-entities-plugins-list [data-testid="appliedTo"] .k-badge')).toContainText('Global')

    // Update plugin and scope it to service
    await withNavigation(page, () => clickEntityListAction(page, 'edit'))
    await page.waitForSelector('.kong-ui-entities-plugin-form-container')
    await page.click('.selection-group .Scoped-check')
    await page.click('input#service-id')
    await page.fill('input#service-id', 'test_service')
    await page.waitForTimeout(300)
    await expect(page.locator('.select-item')).toContainText('test_service')
    await page.click('.select-item')
    await withNavigation(page, () => page.click(serviceListPage.$.submitButton))
    await pluginListPage.goto()
    await expect(page.locator('.kong-ui-entities-plugins-list [data-testid="appliedTo"] .k-badge')).toContainText('Service')
  })

  test('change scope from scoped to global', async ({ page, pluginListPage, serviceListPage }) => {
    await expect(page.locator('.kong-ui-entities-plugins-list [data-testid="appliedTo"] .k-badge')).toContainText('Service')
    await withNavigation(page, () => clickEntityListAction(page, 'edit'))
    await page.waitForSelector('.kong-ui-entities-plugin-form-container')
    await page.click('.selection-group .Global-check')
    await withNavigation(page, () => page.click(serviceListPage.$.submitButton))
    await pluginListPage.goto()
    await expect(page.locator('.kong-ui-entities-plugins-list [data-testid="appliedTo"] .k-badge')).toContainText('Global')
  })
})

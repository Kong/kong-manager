import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'
import { clearKongResources } from '@pw/commands/clearKongResources'
import { clickEntityListAction } from '@pw/commands/clickEntityListAction'
import { createKongResource } from '@pw/commands/createKongResource'
import { withNavigation } from '@pw/commands/withNavigation'
import { ConsumerListPage } from '@pw/pages/consumers'
import { PluginListPage } from '@pw/pages/plugins'
import { ServiceListPage } from '@pw/pages/services'

const mockPluginName = 'prometheus'
const mockConsumerName = 'testUser'

const test = baseTest().extend<{
  consumerListPage: ConsumerListPage,
  pluginListPage: PluginListPage
  serviceListPage: ServiceListPage
}>({
  consumerListPage: async ({ page }, use) => use(new ConsumerListPage(page)),
  pluginListPage: async ({ page }, use) => use(new PluginListPage(page)),
  serviceListPage: async ({ page }, use) => use(new ServiceListPage(page)),
})

test.describe('plugin orderings', () => {
  test.beforeAll(async () => {
    await clearKongResources('/plugins')
    await clearKongResources('/consumers')
  })

  test.afterEach(async () => {
    await clearKongResources('/plugins')
    await clearKongResources('/consumers')
  })

  test('view plugin ordering - empty', async ({ page, pluginListPage }) => {
    await createKongResource('/plugins', {
      name: mockPluginName,
      enabled: true,
    })

    await pluginListPage.goto()
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await withNavigation(page, () => page.locator('#ordering-tab').click())
    await expect(page.locator('.plugin-ordering-empty')).toHaveCount(1)
    await expect(page.locator('.plugin-ordering-empty')).toContainText('No dynamic ordering applied')
  })

  test('view plugin ordering - with only `before.access`', async ({ page, pluginListPage }) => {
    await createKongResource('/plugins', {
      name: mockPluginName,
      enabled: true,
      ordering: {
        before: {
          access: ['basic-auth'],
        },
      },
    })

    await pluginListPage.goto()
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await withNavigation(page, () => page.locator('#ordering-tab').click())
    await expect(page.locator('.plugin-ordering-name')).toContainText('basic-auth')
    await expect(page.locator('.plugin-ordering-empty')).toHaveCount(1)
    await expect(page.locator('.plugin-ordering-empty')).toContainText('No dynamic ordering applied')
  })

  test('view plugin ordering - with only `after.access`', async ({ page, pluginListPage }) => {
    await createKongResource('/plugins', {
      name: mockPluginName,
      enabled: true,
      ordering: {
        after: {
          access: ['basic-auth'],
        },
      },
    })

    await pluginListPage.goto()
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await withNavigation(page, () => page.locator('#ordering-tab').click())
    await expect(page.locator('.plugin-ordering-name')).toContainText('basic-auth')
    await expect(page.locator('.plugin-ordering-empty')).toHaveCount(1)
    await expect(page.locator('.plugin-ordering-empty')).toContainText('No dynamic ordering applied')
  })

  test('view plugin ordering - with both `before.access` and `after.access`', async ({ page, pluginListPage }) => {
    await createKongResource('/plugins', {
      name: mockPluginName,
      enabled: true,
      ordering: {
        before: {
          access: ['cors'],
        },
        after: {
          access: ['basic-auth'],
        },
      },
    })

    await pluginListPage.goto()
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await withNavigation(page, () => page.locator('#ordering-tab').click())
    await expect(page.locator('.plugin-ordering-name').nth(0)).toContainText('cors')
    await expect(page.locator('.plugin-ordering-name').nth(1)).toContainText('basic-auth')
    await expect(page.locator('.plugin-ordering-empty')).not.toBeVisible()
  })

  test('view plugin ordering - disabled when plugin is consumer-scoped', async ({ page, pluginListPage }) => {
    const consumer = await createKongResource('/consumers', {
      username: mockConsumerName,
    })

    await createKongResource('/plugins', {
      name: 'datadog',
      enabled: true,
      consumer: {
        id: consumer?.data.id,
      },
    })

    await pluginListPage.goto()
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await withNavigation(page, () => page.locator('#ordering-tab').click())
    await expect(page.locator('.plugin-ordering-empty .plugin-ordering-empty-button')).toBeDisabled()
    await expect(page.getByTestId('edit-ordering-button')).toBeDisabled()
  })

  test('edit plugin ordering - add', async ({ page, pluginListPage }) => {
    await createKongResource('/plugins', {
      name: mockPluginName,
      enabled: true,
    })

    await pluginListPage.goto()
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await withNavigation(page, () => page.locator('#ordering-tab').click())
    await withNavigation(page, () => page.locator('.plugin-ordering-empty .plugin-ordering-empty-button').click())
    await page.click('[data-testid="plugin-ordering-before"] .ordering-plugin-add')
    await page.click('#before-0')
    await page.click('[data-testid="k-select-item-basic-auth"]')
    await withNavigation(page, () => page.locator('.ordering-form-footer button.primary').click())
    await expect(page.locator('.plugin-ordering-name')).toContainText('basic-auth')

    await withNavigation(page, () => page.getByTestId('edit-ordering-button').click())
    await page.click('[data-testid="plugin-ordering-before"] .ordering-plugin-add')
    await page.click('#before-1')
    await page.click('[data-testid="k-select-item-cors"]')
    await withNavigation(page, () => page.locator('.ordering-form-footer button.primary').click())
    await expect(page.locator('.plugin-ordering-name').nth(1)).toContainText('cors')
  })

  test('edit plugin ordering - change', async ({ page, pluginListPage }) => {
    await createKongResource('/plugins', {
      name: mockPluginName,
      enabled: true,
      ordering: {
        before: {
          access: ['cors'],
        },
      },
    })

    await pluginListPage.goto()
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await withNavigation(page, () => page.locator('#ordering-tab').click())
    await withNavigation(page, () => page.locator('.plugin-ordering-empty .plugin-ordering-empty-button').click())
    await page.click('#before-0')
    await page.click('[data-testid="k-select-item-basic-auth"]')
    await withNavigation(page, () => page.locator('.ordering-form-footer button.primary').click())
    await expect(page.locator('.plugin-ordering-name')).toContainText('basic-auth')
  })

  test('edit plugin ordering - remove', async ({ page, pluginListPage }) => {
    await createKongResource('/plugins', {
      name: mockPluginName,
      enabled: true,
      ordering: {
        before: {
          access: ['cors'],
        },
      },
    })

    await pluginListPage.goto()
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await withNavigation(page, () => page.locator('#ordering-tab').click())
    await withNavigation(page, () => page.getByTestId('edit-ordering-button').click())
    await page.click('[data-testid="plugin-ordering-before"] .ordering-plugin-select button.delete')
    await withNavigation(page, () => page.locator('.ordering-form-footer button.primary').click())
    await expect(page.locator('.plugin-ordering-name')).toHaveCount(0)
  })

  test('edit plugin ordering - listing correct options', async ({ page, pluginListPage }) => {
    await createKongResource('/plugins', {
      name: mockPluginName,
      enabled: true,
    })

    await pluginListPage.goto()
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await withNavigation(page, () => page.locator('#ordering-tab').click())
    await withNavigation(page, () => page.getByTestId('edit-ordering-button').click())
    await page.click('[data-testid="plugin-ordering-before"] .ordering-plugin-add')
    await page.click('#before-0')
    await expect(page.locator(`[data-testid="before-0"] [data-testid="k-select-item-${mockPluginName}"] button`)).toBeDisabled()
    await page.click('[data-testid="k-select-item-basic-auth"]')
    await page.click('[data-testid="plugin-ordering-before"] .ordering-plugin-add')
    await page.click('#before-1')
    await expect(page.locator('[data-testid="before-1"] [data-testid="k-select-item-basic-auth"] button')).toBeDisabled()
    await expect(page.locator('[data-testid="before-1"] [data-testid="k-select-item-cors"] button')).toBeEnabled()
    await page.click('#before-1')
    await page.click('[data-testid="plugin-ordering-after"] .ordering-plugin-add')
    await page.click('#after-0')
    await expect(page.locator('[data-testid="after-0"] [data-testid="k-select-item-basic-auth"] button')).toBeDisabled()
    await expect(page.locator('[data-testid="after-0"] [data-testid="k-select-item-cors"] button')).toBeEnabled()
  })
})

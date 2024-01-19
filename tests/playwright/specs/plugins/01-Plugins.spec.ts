import { expect, type Locator } from '@playwright/test'
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
import { getPropertyValue } from '@pw/commands/getPropertyValue'
import { ConsumerListPage } from '@pw/pages/consumers'
import { PluginListPage } from '@pw/pages/plugins'
import { RouteListPage } from '@pw/pages/routes'
import { ServiceListPage } from '@pw/pages/services'

const mockConsumerName = 'testUser'
const mockRouteName = 'testRoute'
const mockServiceName = 'testService'
const mockTag = 'testTag'
const mockPluginName = 'prometheus'
const mockInstanceName = 'myCustomName'

const test = baseTest().extend<{
  consumerListPage: ConsumerListPage,
  pluginListPage: PluginListPage
  serviceListPage: ServiceListPage
  routeListPage: RouteListPage
}>({
  consumerListPage: async ({ page }, use) => use(new ConsumerListPage(page)),
  pluginListPage: async ({ page }, use) => use(new PluginListPage(page)),
  serviceListPage: async ({ page }, use) => use(new ServiceListPage(page)),
  routeListPage: async ({ page }, use) => use(new RouteListPage(page)),
})

test.describe('plugins', () => {
  test.beforeAll(async () => {
    await clearKongResources('/routes')
    await clearKongResources('/services')
    await clearKongResources('/consumers')
    await clearKongResources('/plugins')
  })

  test.beforeEach(async ({ pluginListPage }) => {
    await pluginListPage.goto()
  })

  test.afterAll(async () => {
    await clearKongResources('/routes')
    await clearKongResources('/services')
    await clearKongResources('/consumers')
    await clearKongResources('/plugins')
  })

  test('plugin list should be empty now', async ({ page }) => {
    const emptyState = page.locator('.kong-ui-entities-plugins-list .empty-state-wrapper')

    await expect(emptyState).toBeVisible()
    await expect(emptyState).toContainText('Configure a New Plugin')
  })

  test('install a plugin when the scope is "service"', async ({ page, serviceListPage }) => {
    await createKongResource('/services', {
      name: mockServiceName,
      url: 'http://example.com:8080/test',
    })

    await serviceListPage.goto()
    await withNavigation(page, async () => await clickEntityListAction(page, 'view'))
    const uuid = await page.locator('.uuid-container').innerText()

    await switchDetailTab(page, 'plugins')

    await withNavigation(
      page,
      async () => await page.click('.kong-ui-entities-plugins-list [data-testid="new-plugin"]')
    )

    await expandPlugins(page)
    await withNavigation(
      page,
      async () => await page.getByTestId('basic-auth-card').click()
    )

    await expect(page.locator('.autosuggest #service-id')).toBeVisible()
    await expect(page.locator('.autosuggest #service-id')).toHaveValue(new RegExp(`${mockServiceName}\\s*-\\s*${uuid}`))

    await page.locator('#config-anonymous').type('anon')
    await page.locator('#config-hide_credentials').check()

    await withNavigation(
      page,
      async () => await page.locator('[data-testid="form-actions"] .primary').click()
    )
    await expect(page.locator('.k-table tbody tr')).toHaveCount(1)
    await expect(page.locator('td[data-testid="name"]')).toContainText('Basic Authentication')
  })

  test('plugin list should have one plugin now', async ({ page }) => {
    await expect(page.locator('.kong-ui-entities-plugins-list .k-table tbody tr')).toHaveCount(1)
  })

  test('plugin icons - plugin select', async ({ browserName, page }) => {
    await withNavigation(
      page,
      async () => await page.click('.kong-ui-entities-plugins-list [data-testid="toolbar-add-plugin"]')
    )

    const pluginIcon = page.locator('.plugin-select-card [data-testid="Basic Authentication"] img.plugin-card-icon')

    await expect(pluginIcon).toBeVisible()

    if (browserName !== 'webkit') {
      expect(await pluginIcon.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBeGreaterThan(0)
      expect(/basic-auth|data:image/.test((await pluginIcon.getAttribute('src')) || '')).toBeTruthy()
    }
  })

  test('plugin icons - plugins list', async ({ browserName, page }) => {
    const pluginIcon = page.locator('.name-cell-wrapper img.plugin-icon')

    await expect(pluginIcon).toBeVisible()

    if (browserName !== 'webkit') {
      expect(await pluginIcon.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBeGreaterThan(0)
      expect(/basic-auth|data:image/.test((await pluginIcon.getAttribute('src')) || '')).toBeTruthy()
    }
  })

  test('plugin icons - plugin detail', async ({ browserName, page }) => {
    await withNavigation(page, async () => await clickEntityListAction(page, 'view'))
    const pluginIcon = page.locator('.page-header img.plugin-detail-icon')

    await expect(pluginIcon).toBeVisible()

    if (browserName !== 'webkit') {
      expect(await pluginIcon.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBeGreaterThan(0)
      expect(/basic-auth|data:image/.test((await pluginIcon.getAttribute('src')) || '')).toBeTruthy()
    }
  })

  test('copy JSON action in list actions should work', async ({ browserName, page }) => {
    await clickEntityListAction(page, 'copy-id')

    await waitAndDismissToasts(page)

    if (browserName !== 'webkit') {
      const copiedUUID = await page.evaluate(() => navigator.clipboard.readText())

      expect(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(copiedUUID)).toEqual(true)
    }
  })

  test('status switch in list item should work', async ({ page }) => {
    const row = page.locator('.kong-ui-entities-plugins-list tr[data-testid="basic-auth"]')
    const statusLabel = row.locator('.k-input-switch .toggle-label')
    const statusSwitch = row.locator('.k-input-switch .switch-control')

    await expect(statusLabel).toHaveText('Enabled')
    await statusSwitch.click()

    await page
      .locator('.k-modal-dialog')
      .locator('.k-button.k-prompt-proceed').click()

    await waitAndDismissToasts(page)
    await expect(statusLabel).toHaveText('Disabled')
  })

  test('install a plugin when the scope is "route"', async ({ page, routeListPage }) => {
    const res = await createKongResource('/services', {
      name: `${mockServiceName}-1`,
      url: 'http://example.com:8080/test',
    })

    await createKongResource('/routes', {
      name: mockRouteName,
      service: { id: res?.data.id },
      hosts: ['example.com'],
    })

    await routeListPage.goto()
    await withNavigation(page, async () => await clickEntityListAction(page, 'view'))
    const uuid = await page.locator('.uuid-container').innerText()

    await switchDetailTab(page, 'plugins')

    await withNavigation(
      page,
      async () => await page.click('.kong-ui-entities-plugins-list [data-testid="new-plugin"]')
    )

    await withNavigation(
      page,
      async () => await page.getByTestId('basic-auth-card').click()
    )

    await expect(page.locator('.autosuggest #route-id')).toBeVisible()
    await expect(page.locator('.autosuggest #route-id')).toHaveValue(new RegExp(`${mockRouteName}\\s*-\\s*${uuid}`))

    await withNavigation(
      page,
      async () => await page.locator('[data-testid="form-actions"] .primary').click()
    )
    await expect(page.locator('.k-table tbody tr')).toHaveCount(1)
    await expect(page.locator('td[data-testid="name"]')).toContainText('Basic Authentication')
  })

  test('install plugin when the scope is "consumer"', async ({ page, consumerListPage }) => {
    await createKongResource('/consumers', {
      username: mockConsumerName,
    })

    await consumerListPage.goto()

    await withNavigation(page, async () => await clickEntityListAction(page, 'view'))
    const uuid = await page.locator('.uuid-container').innerText()

    await switchDetailTab(page, 'plugins')
    await withNavigation(
      page,
      async () => await page.locator('.empty-state-content .primary').click()
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
    await expect(page.locator('.k-table tbody tr')).toHaveCount(1)
    await expect(page.locator('td[data-testid="name"]')).toContainText('Datadog')
  })

  test("updating scoped plugin's consumer field should cause no errors", async ({ page, pluginListPage }) => {
    await clearKongResources('/plugins')
    await clearKongResources('/consumers')

    const res1 = await createKongResource('/consumers', {
      username: 'oneConsumer',
    })

    const res2 = await createKongResource('/consumers', {
      username: 'anotherConsumer',
    })

    await createKongResource('/plugins', {
      enabled: true,
      name: 'ip-restriction',
      config: { allow: ['0.0.0.0/0'] },
      consumer: { id: res1?.data.id },
    })

    await pluginListPage.goto()
    await withNavigation(page, async () => await clickEntityListAction(page, 'edit'))

    await expect(page.locator('.autosuggest #consumer-id')).toBeVisible()
    await page.locator('.autosuggest #consumer-id').click()
    await page.locator('.autosuggest #consumer-id').fill('')
    await page.locator('.autosuggest #consumer-id').type('another')
    await page.locator(`[data-testid="select-item-${res2?.data.id}"]`).click()

    await withNavigation(page, async () =>
      await fillEntityForm({
        page,
        withAction: 'submit',
      }))

    await withNavigation(page, async () => await clickEntityListAction(page, 'view'))

    await expect(getPropertyValue(page, 'consumer')).toContainText(res2?.data.id)
  })

  test('view the plugin detail page', async ({ page, pluginListPage }) => {
    await clearKongResources('/plugins')
    await createKongResource('/plugins', {
      name: mockPluginName,
      enabled: true,
    })
    await pluginListPage.goto()

    await withNavigation(page, async () => await clickEntityListAction(page, 'view'))
    await expect(page.locator('.page-header .title')).toContainText(new RegExp(mockPluginName, 'i'))
    await expect(getPropertyValue(page, 'name')).toContainText(new RegExp(mockPluginName, 'i'))
  })

  test('plugin protocols', async ({ page, pluginListPage }) => {
    await clearKongResources('/plugins')
    await pluginListPage.goto()

    await withNavigation(
      page,
      async () => await page.locator('.empty-state-content .primary').click()
    )
    await withNavigation(
      page,
      async () => await page.getByTestId('basic-auth-card').click()
    )

    await page.click('.plugin-protocols-select .multiselect-trigger')
    await page.click('.multiselect-item[data-testid="multiselect-item-grpcs"]')
    await page.click('.multiselect-item[data-testid="multiselect-item-https"]')
    await page.click('.plugin-protocols-select .multiselect-trigger')

    await withNavigation(
      page,
      async () => await page.locator('[data-testid="form-actions"] .primary').click()
    )
    await withNavigation(page, async () => await clickEntityListAction(page, 'view'))

    await expect(page.getByTestId('protocols-property-value')).toContainText('http')
    await expect(page.getByTestId('protocols-property-value')).toContainText('grpc')
    await expect(page.getByTestId('protocols-property-value').locator('.config-badge')).toHaveCount(2)
  })

  test('submit/cancel plugin editing using footer actions', async ({ page }) => {
    await withNavigation(page, async () => await clickEntityListAction(page, 'edit'))
    await withNavigation(
      page,
      async () =>
        await fillEntityForm({
          page,
          formData: {
            tags: mockTag,
          },
          withAction: 'submit',
        })
    )

    let row = page.locator('.kong-ui-entities-plugins-list').locator('tr').nth(1)

    await expect(row.locator('[data-testid="tags"]')).toHaveText(mockTag)

    await clickEntityListAction(page, 'edit')
    await withNavigation(
      page,
      async () =>
        await fillEntityForm({
          page,
          formData: {
            tags: `${mockTag}${mockTag}`,
          },
          withAction: 'cancel',
        })
    )

    row = page.locator('.kong-ui-entities-plugins-list').locator('tr').nth(1)

    await expect(row.locator('[data-testid="tags"]')).toHaveText(mockTag)
  })

  test('delete the plugin', async ({ page }) => {
    await clickEntityListAction(page, 'delete')
    await expect(page.locator('.kong-ui-entity-delete-modal .k-modal-dialog')).toBeVisible()
    await autocompleteDeleteModal(page)
    await waitAndDismissToasts(page)
  })

  test('supports empty instance name', async ({ page, pluginListPage }) => {
    await clearKongResources('/plugins')
    await createKongResource('/plugins', {
      name: mockPluginName,
      enabled: true,
    })
    await pluginListPage.goto()

    await expect(page.locator('.kong-ui-entities-plugins-list .info-name')).toContainText('Prometheus')
    await expect(page.locator('.kong-ui-entities-plugins-list .info-type')).not.toBeVisible()
    await withNavigation(page, async () => await clickEntityListAction(page, 'view'))
    await expect(getPropertyValue(page, 'instance_name')).toContainText('')
    await withNavigation(page, async () => await page.getByTestId('header-edit-button').click())
    await expect(page.locator('#instance_name')).toHaveValue('')
  })

  test('supports instance_name param', async ({ page, pluginListPage }) => {
    await clearKongResources('/plugins')
    await createKongResource('/plugins', {
      name: mockPluginName,
      instance_name: mockInstanceName,
      enabled: true,
    })
    await pluginListPage.goto()

    await expect(page.locator('.kong-ui-entities-plugins-list .info-name')).toContainText(mockInstanceName)
    await expect(page.locator('.kong-ui-entities-plugins-list .info-type')).toBeVisible()
    await withNavigation(page, async () => await clickEntityListAction(page, 'view'))
    await expect(getPropertyValue(page, 'instance_name')).toContainText(mockInstanceName)
    await withNavigation(page, async () => await page.getByTestId('header-edit-button').click())
    await expect(page.locator('#instance_name')).toHaveValue(mockInstanceName)
  })

  test('filter should work in plugin select page', async ({ page }) => {
    const filterInput = page.locator('[data-testid="plugins-filter"]')

    await withNavigation(page, async () => await page.locator('.kong-ui-entities-plugins-list [data-testid="toolbar-add-plugin"]').click())
    await expect(filterInput).toBeVisible()
    await filterInput.fill('traf')
    await expect(page.getByTestId('k-collapse-title')).toHaveCount(1)
    await expect(page.getByTestId('k-collapse-title')).toContainText('Traffic Control')

    await filterInput.fill('bas')
    await expect(page.getByTestId('k-collapse-title')).toHaveCount(1)
    await expect(page.getByTestId('k-collapse-title')).toContainText('Authentication')
    await expect(page.locator('.plugin-select-card')).toHaveCount(1)
    await expect(page.locator('.plugin-select-card .plugin-card-title')).toContainText('Basic Authentication')

    await filterInput.fill('sad')
    await expect(page.getByTestId('plugins-empty-state')).toBeVisible()
    await expect(page.getByTestId('k-collapse-title')).not.toBeVisible()
    await expect(page.locator('[data-testid="plugins-empty-state"] .k-empty-state-message')).toContainText('No results found')
  })

  test('for plugin "key-auth", the default array field should have value', async ({ page, pluginListPage }) => {
    await clearKongResources('/plugins')
    await pluginListPage.goto()

    await withNavigation(page, async () => await page.locator('.kong-ui-entities-plugins-list [data-testid="new-plugin"]').click())
    await page.locator('[data-testid="Key Authentication"]').click()
    await page.waitForSelector('.kong-ui-entities-plugin-form-container')
    await page.waitForSelector('[data-testid="config-key_names-item-0"]')
    await expect(page.locator('[data-testid="config-key_names-item-0"] input')).toHaveValue('apikey')
  })

  test('by using plugin "ip-restriction" as example, service, route and consumer should be auto completed', async ({ page }) => {
    await clearKongResources('/plugins')
    await clearKongResources('/routes')
    await clearKongResources('/services')
    await clearKongResources('/consumers')

    const [service, route, consumer] = await Promise.all([
      createKongResource('/services', {
        name: 'test_service',
        url: 'http://tester.com/test',
      }),
      createKongResource('/routes', {
        name: 'test_route',
        protocols: ['http'],
        methods: ['GET'],
      }),
      createKongResource('/consumers', {
        username: 'test_consumer',
      }),
    ])

    let selectItem: Locator

    await withNavigation(page, async () => await page.locator('.kong-ui-entities-plugins-list [data-testid="new-plugin"]').click())
    await page.locator('[data-testid="IP Restriction"]').click()

    await page.waitForSelector('.kong-ui-entities-plugin-form-container')
    await expect(page.locator('#service-id')).not.toBeVisible()
    await expect(page.locator('#route-id')).not.toBeVisible()
    await expect(page.locator('#consumer-id')).not.toBeVisible()

    await page.click('.selection-group .Scoped-check')

    await page.click('#service-id')
    await page.fill('#service-id', 'test_service')
    await page.waitForTimeout(300)
    selectItem = page.locator('[data-testid="select-wrapper"]').nth(0).locator('.select-item')
    await expect(selectItem).toContainText(`${service?.data.name}`)
    await expect(selectItem).toContainText(`${service?.data.id}`)
    await selectItem.click()
    await expect(page.locator('#service-id')).toHaveValue(`${service?.data.name} - ${service?.data.id}`)

    await page.click('#route-id')
    await page.fill('#route-id', 'test_route')
    await page.waitForTimeout(300)
    selectItem = page.locator('[data-testid="select-wrapper"]').nth(1).locator('.select-item')
    await expect(selectItem).toContainText(`${route?.data.name}`)
    await expect(selectItem).toContainText(`${route?.data.id}`)
    await selectItem.click()
    await expect(page.locator('#route-id')).toHaveValue(`${route?.data.name} - ${route?.data.id}`)

    await page.click('#consumer-id')
    await page.fill('#consumer-id', 'test_consumer')
    await page.waitForTimeout(300)
    selectItem = page.locator('[data-testid="select-wrapper"]').nth(2).locator('.select-item')
    await expect(selectItem).toContainText(`${consumer?.data.username}`)
    await expect(selectItem).toContainText(`${consumer?.data.id}`)
    await selectItem.click()
    await expect(page.locator('#consumer-id')).toHaveValue(`${consumer?.data.username} - ${consumer?.data.id}`)

    await withNavigation(page, async () =>
      await fillEntityForm({
        page,
        formData: { 'config-allow': ['0.0.0.0/32'] },
        withAction: 'submit',
      })
    )

    await clickEntityListAction(page, 'edit')
    await page.waitForSelector('.kong-ui-entities-plugin-form-container')

    await expect(page.locator('#service-id')).toBeVisible()
    await expect(page.locator('#route-id')).toBeVisible()
    await expect(page.locator('#consumer-id')).toBeVisible()

    await expect(page.locator('#service-id')).toHaveValue(`${service?.data.name} - ${service?.data.id}`)
    await expect(page.locator('#route-id')).toHaveValue(`${route?.data.name} - ${route?.data.id}`)
    await expect(page.locator('#consumer-id')).toHaveValue(`${consumer?.data.username} - ${consumer?.data.id}`)
  })

  test('the "Applied To" column should be able to click and navigate to the entity', async ({ page, pluginListPage }) => {
    for (const type of ['service', 'route', 'consumer']) {
      await pluginListPage.goto()
      await withNavigation(page, () => page.locator(`.k-badge:has-text("${type}")`).click())
      await expect(page).toHaveURL(new RegExp(`/${type}s/`, 'i'))
    }
  })

  test('plugin should be saved as global even if scoped toggled', async ({ page, pluginListPage }) => {
    await clearKongResources('/services')
    await clearKongResources('/routes')
    await clearKongResources('/consumers')
    await clearKongResources('/plugins')

    const service = (await createKongResource('/services', {
      name: 'test_service',
      url: 'http://tester.com/test',
    }))?.data

    await pluginListPage.goto()
    await withNavigation(page, async () => await page.locator('.kong-ui-entities-plugins-list [data-testid="new-plugin"]').click())
    await page.getByTestId('basic-auth-card').click()
    await page.waitForSelector('.kong-ui-entities-plugin-form-container')
    await expect(page.locator('#service-id')).not.toBeVisible()

    // click scoped & select a service
    await page.click('.selection-group .Scoped-check')
    await page.click('#service-id')
    await page.fill('#service-id', 'test_service')
    await page.waitForTimeout(300)
    await expect(page.locator('.select-item')).toContainText('test_service')
    await page.click('.select-item')
    await expect(page.locator('#service-id')).toHaveValue(`test_service - ${service?.id}`)

    // switch back to global
    await page.click('.selection-group .Global-check')
    await expect(page.locator('#service-id')).not.toBeVisible()

    // submit form
    await withNavigation(page, async () =>
      await fillEntityForm({
        page,
        withAction: 'submit',
      })
    )

    // verify the created plugin is global
    await expect(page.locator('.kong-ui-entities-plugins-list [data-testid="appliedTo"] .k-badge')).toContainText('Global')
    await clickEntityListAction(page, 'edit')
    await page.waitForSelector('.kong-ui-entities-plugin-form-container')
    await expect(page.locator('#service-id')).not.toBeVisible()
    await page.click('.selection-group .Scoped-check')
    await expect(page.locator('#service-id')).toHaveValue('')
  })

  test('can delete service id from a plugin', async ({ page, pluginListPage }) => {
    await clearKongResources('/plugins')
    await clearKongResources('/services')

    await createKongResource('/services', {
      name: 'test_service',
      url: 'http://tester.com/test',
    })

    await pluginListPage.goto()

    // create a scoped plugin
    await withNavigation(page, async () => await page.locator('.kong-ui-entities-plugins-list [data-testid="new-plugin"]').click())
    await page.getByTestId('basic-auth-card').click()
    await page.waitForSelector('.kong-ui-entities-plugin-form-container')
    await page.click('.selection-group .Scoped-check')
    await page.click('#service-id')
    await page.fill('#service-id', 'test_service')
    await page.waitForTimeout(300)
    await expect(page.locator('.select-item')).toContainText('test_service')
    await page.click('.select-item')
    await withNavigation(page, async () => await fillEntityForm({
      page,
      withAction: 'submit',
    }))

    // delete service id and submit
    await clickEntityListAction(page, 'edit')
    await page.locator('[data-testid="select-wrapper"]').nth(0).locator('.close-icon').click()
    await withNavigation(page, async () => await fillEntityForm({
      page,
      withAction: 'submit',
    }))

    // it should back to global
    await expect(page.locator('.kong-ui-entities-plugins-list [data-testid="appliedTo"] .k-badge')).toContainText('Global')
  })
})

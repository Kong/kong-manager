import { expect, type Page } from '@playwright/test'
import baseTest from '@pw/base-test'
import { autocompleteDeleteModal } from '@pw/commands/autocompleteDeleteModal'
import { clearKongResources } from '@pw/commands/clearKongResources'
import { clickEntityListAction } from '@pw/commands/clickEntityListAction'
import { createKongResource } from '@pw/commands/createKongResource'
import { expectEmptyEntityList } from '@pw/commands/expectEmptyEntityList'
import { fillEntityForm } from '@pw/commands/fillEntityForm'
import { selectMethods } from '@pw/commands/selectMethods'
import { selectService } from '@pw/commands/selectService'
import { switchDetailTab } from '@pw/commands/switchDetailTab'
import { waitAndDismissToasts } from '@pw/commands/waitAndDismissToast'
import { withNavigation } from '@pw/commands/withNavigation'
import { RouteListPage } from '@pw/pages/routes'

const mockRouteName = 'testRoute'
const mockTag = 'testTag'
const mockPaths = ['/test1', '/test2']
const mockServiceName = 'testService'

const test = baseTest().extend<{
  routeListPage: RouteListPage
}>({
  routeListPage: async ({ page }, use) => use(new RouteListPage(page)),
})

const fillArrayField = async (page: Page, key: string, values: string[], is_enabled = false) => {
  if (!is_enabled) {
    await page.locator(`[data-testid="routing-rule-${key}"]`).click()
  }

  await Promise.all(values.map(async (value, index) => {
    await page.waitForSelector(`[data-testid="route-form-${key}-input-${index + 1}"]`)
    await page.fill(`[data-testid="route-form-${key}-input-${index + 1}"]`, value)
    await page.getByTestId(`add-${key}`).last().click()
  }))
}

const selectProtocols = async (page: Page, protocol: string) => {
  const locator = page.locator('.k-select').filter({ hasText: 'Protocols' })

  await expect(locator.locator('[data-testid="route-form-protocols"]')).toBeVisible()
  await locator.locator('.k-input.select-input').click()

  await expect(locator.locator('.popover-content .select-items-container')).toBeVisible()
  await locator.locator(`[data-testid="select-item-${protocol}"]`).click()
}

test.describe('routes', () => {
  let service
  let serviceWithNoName

  test.beforeAll(async () => {
    await clearKongResources('/routes')
    await clearKongResources('/services')

    const res = await createKongResource('/services', {
      name: mockServiceName,
      url: 'http://example.com:8080/test',
    })

    service = res?.data

    const resNoName = await createKongResource('/services', {
      url: 'http://example.com:8080/test',
    })

    serviceWithNoName = resNoName?.data
  })

  test.beforeEach(async ({ routeListPage }) => {
    await routeListPage.goto()
  })

  test.afterAll(async () => {
    await clearKongResources('/routes')
    await clearKongResources('/services')
  })

  test('route list is empty', async ({ page }) => {
    await expectEmptyEntityList(page, 'routes', 'Configure a New Route')
  })

  test('route create - cancel button', async ({ page }) => {
    await withNavigation(page, () =>
      page.locator('.table-empty-state .primary').click(),
    )
    await page.locator('[data-testid="route-create-form-cancel"]').click()
    await expectEmptyEntityList(page, 'routes', 'Configure a New Route')
  })

  test('route create - save button is disabled', async ({ page }) => {
    await withNavigation(page, () =>
      page.locator('.table-empty-state .primary').click(),
    )

    await expect(page.locator('[data-testid="route-create-form-submit"]')).toBeDisabled()
  })

  test('route create - cannot submit if only protocol is clicked', async ({ page }) => {
    await withNavigation(page, () =>
      page.locator('.table-empty-state .primary').click(),
    )

    await page.locator('[data-testid="route-form-protocols"]').fill('http')
    await expect(page.locator('[data-testid="route-create-form-submit"]')).toBeDisabled()
  })

  test('route create - fail with invalid paths', async ({ page }) => {
    await withNavigation(page, () =>
      page.locator('.table-empty-state .primary').click(),
    )

    await fillArrayField(page, 'paths', ['kong(-ee){0,1}.com'], true)

    await fillEntityForm({
      page,
      formData: {
        'route-form-name': 'n1',
      },
      withAction: 'submit',
    })
    await expect(page.locator('[data-testid="form-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="form-error"] .alert-message')).toHaveText('schema violation (paths.1: should start with: / (fixed path) or ~/ (regex path))')
  })

  test('route create - can open/close advanced fields', async ({ page }) => {
    await withNavigation(page, () =>
      page.locator('.table-empty-state .primary').click(),
    )

    // default the advanced field status
    await expect(page.locator('[data-testid="collapse-trigger-content"] .chevron-right-icon')).toBeVisible()
    await expect(page.locator('[data-testid="collapse-trigger-content"] .chevron-right-icon')).not.toHaveClass(/collapse-expanded/)
    await expect(page.locator('[data-testid="collapse-hidden-content"]')).toHaveAttribute('style', 'display: none;')

    // open the advanced field
    await page.locator('[data-testid="collapse-trigger-label"]').click()
    await expect(page.locator('[data-testid="collapse-trigger-content"] .chevron-right-icon')).toHaveClass(/collapse-expanded/)
    await expect(page.locator('[data-testid="collapse-hidden-content"]')).toHaveAttribute('style', '')

    // hide the advanced field
    await page.locator('[data-testid="collapse-trigger-label"]').click()
    await expect(page.locator('[data-testid="collapse-trigger-content"] .chevron-right-icon')).not.toHaveClass(/collapse-expanded/)
    await expect(page.locator('[data-testid="collapse-hidden-content"]')).toHaveAttribute('style', 'display: none;')
  })

  const testProtocols = [
    {
      protocols: ['https', 'grpcs', 'http,https', 'grpc,grpcs'],
      sni: true,
    },
    {
      protocols: ['grpc', 'tcp', 'http'],
      sni: false,
    },
  ]

  for (const { protocols, sni } of testProtocols) {
    for (const protocol of protocols) {
      test(`route create - sni field appears and hide correctly with protocols (${protocol})`, async ({ page }) => {
        await withNavigation(page, () =>
          page.locator('.table-empty-state .primary').click(),
        )

        await selectProtocols(page, `${protocol}`)
        if (sni) {
          await expect(page.locator('[data-testid="routing-rule-snis"]')).toHaveAttribute('aria-disabled', 'false')
        } else {
          await expect(page.locator('[data-testid="routing-rule-snis"]')).toHaveCount(0)
        }
      })
    }
  }

  test('route create - successful create', async ({ page }) => {
    await withNavigation(
      page,
      async () => await page.locator('.kong-ui-entities-routes-list .table-empty-state .primary').click(),
    )

    await page.waitForSelector('.k-breadcrumbs', { state: 'hidden' })

    await selectService(page, service.id)
    await fillArrayField(page, 'hosts', ['example.com'])

    await fillEntityForm({
      page,
      formData: {
        'route-form-name': mockRouteName,
      },
      withAction: 'submit',
    })

    await waitAndDismissToasts(page)
    await expect(page.getByTestId('name-property-value')).toContainText(mockRouteName)
  })

  test('copy id action in list actions should work', async ({ browserName, page, routeListPage }) => {
    await clearKongResources('/routes')
    const res = await createKongResource('/routes', {
      name: mockRouteName,
      hosts: ['example.com'],
      service: { id: service.id },
    })

    await routeListPage.goto()

    await clickEntityListAction(page, 'copy-id')

    await waitAndDismissToasts(page)

    if (browserName !== 'webkit') {
      const copiedData = await page.evaluate(() => navigator.clipboard.readText())

      expect(copiedData).toEqual(res?.data.id)
    }
  })

  test(`view the route "${mockRouteName}" detail page`, async ({ page }) => {
    await withNavigation(page, async () => await clickEntityListAction(page, 'view'))
    await expect(page.getByTestId('name-property-value')).toContainText(mockRouteName)
  })

  test('routes show - links to service with a name', async ({ page }) => {
    await withNavigation(page, async () => await clickEntityListAction(page, 'view'))

    await page.getByTestId('service-property-value').locator('.navigation-button').click()

    await expect(page.getByTestId('name-property-value')).toContainText(mockServiceName)
  })

  test(`cancel the route "${mockRouteName}" editing`, async ({ page }) => {
    await withNavigation(page, async () => await clickEntityListAction(page, 'edit'))
    await fillArrayField(page, 'paths', mockPaths)
    await withNavigation(
      page,
      async () =>
        await fillEntityForm({
          page,
          formData: {
            'route-form-tags': mockTag,
          },
          withAction: 'cancel',
        }),
    )

    await expect(page.locator('.entity-record [data-testid="tags"] .k-badge')).toHaveCount(0)
  })

  test(`submit the route "${mockRouteName}" editing`, async ({ page }) => {
    await withNavigation(page, async () => await clickEntityListAction(page, 'edit'))
    await fillArrayField(page, 'paths', mockPaths)

    await withNavigation(
      page,
      async () => {
        await fillEntityForm({
          page,
          formData: {
            'route-form-tags': mockTag,
          },
          withAction: 'submit',
        })
      })

    await expect(page.getByTestId('tags-property-value')).toContainText(mockTag)
    await expect(page.getByTestId('paths-property-value')).toContainText(mockPaths[0])
    await expect(page.getByTestId('paths-property-value')).toContainText(mockPaths[1])
    await expect(page.getByTestId('paths-property-value').locator('.badge-styles')).toHaveCount(mockPaths.length)
  })

  test('route update changing protocols from http to grpc - successful', async ({ page }) => {
    await withNavigation(page, async () => await clickEntityListAction(page, 'edit'))
    await selectProtocols(page, 'grpc')
    await fillArrayField(page, 'hosts', ['url.com'], true)
    await withNavigation(
      page,
      async () => {
        await fillEntityForm({
          page,
          formData: {},
          withAction: 'submit',
        })
      },
    )
    await waitAndDismissToasts(page)
  })

  test(`delete the route "${mockRouteName}"`, async ({ page }) => {
    await clickEntityListAction(page, 'delete')

    await expect(page.locator('.kong-ui-entity-delete-modal .modal-container')).toBeVisible()
    await autocompleteDeleteModal(page)
    await waitAndDismissToasts(page)
  })

  test("updating scoped route's field should cause no errors", async ({ page, routeListPage }) => {
    await clearKongResources('/routes')

    const svc1 = (await createKongResource('/services', {
      name: 'service1',
      url: 'http://service1',
    }))?.data

    const svc2 = (await createKongResource('/services', {
      name: 'service2',
      url: 'http://service2',
    }))?.data

    await createKongResource('/routes', {
      name: 'test',
      protocols: ['http', 'https'],
      methods: ['GET'],
      service: { id: svc1.id },
    })

    await routeListPage.goto()
    await withNavigation(page, async () => await clickEntityListAction(page, 'edit'))

    await selectService(page, svc2.id)

    await withNavigation(page, () =>
      fillEntityForm({
        page,
        withAction: 'submit',
      }))

    await expect(page.getByTestId('service-property-value')).toHaveText('service2')
  })

  const createRoute = async (page, init, data, verify) => {
    await clearKongResources('/routes')
    await new RouteListPage(page).goto()

    await withNavigation(
      page,
      async () => await page.locator('.table-empty-state .primary').click(),
    )

    await init()

    await page.waitForSelector('.k-breadcrumbs', { state: 'hidden' })

    await fillEntityForm({
      page,
      formData: data,
      withAction: 'submit',
    })

    await waitAndDismissToasts(page)

    await verify()
    await clearKongResources('/routes')
  }

  test('route create - successful with "http", "https"', async ({ page }) => {
    const protocols = ['http', 'https', 'http,https']
    const data = {
      'route-form-name': `route_name_${Date.now()}`,
      'route-form-tags': 'tag1,tag2',
    }

    for (let index = 0, len = protocols.length; index < len; index++) {
      const protocol = protocols[index]
      const isStripPath = index % 2 === 0

      await createRoute(page, async () => {
        await selectService(page, service.id)
        await selectProtocols(page, protocol)
        await selectMethods(page, ['GET'])
        if (protocol.includes('https')) {
          await fillArrayField(page, 'snis', ['snis'])
        }

        await expect(page.locator('[data-testid="collapse-trigger-content"] .chevron-right-icon')).not.toHaveClass(/collapse-expanded/)
        await expect(page.locator('[data-testid="collapse-hidden-content"]')).toHaveAttribute('style', 'display: none;')

        // open the advanced field
        await page.locator('[data-testid="collapse-trigger-label"]').click()
        if (!isStripPath) {
          await page.getByTestId('route-form-strip-path').click()
        }
      }, data,
      async () => {
        await expect(page.getByTestId('strip_path-property-value')).toContainText(`${isStripPath}`)
        await expect(page.getByTestId('methods-property-value')).toContainText(['GET'])
        await expect(page.getByTestId('tags-property-value')).toContainText(['tag1tag2'])
      })
    }
  })

  test('route create - successful with "grpc", "grpcs"', async ({ page }) => {
    const protocols = ['grpc', 'grpcs', 'grpc,grpcs']
    const data = {
      'route-form-name': `route_name_${Date.now()}`,
      'route-form-tags': 'tag1,tag2',
    }

    for (let index = 0, len = protocols.length; index < len; index++) {
      const protocol = protocols[index]

      await createRoute(page, async () => {
        await selectService(page, service.id)
        await selectProtocols(page, protocol)
        if (protocol.includes('grpcs')) {
          await fillArrayField(page, 'snis', ['snis'])
        }

        await fillArrayField(page, 'hosts', ['google.com'])
        await expect(page.getByTestId('routing-rule-methods')).toHaveCount(0)

        await expect(page.locator('[data-testid="collapse-trigger-content"] .chevron-right-icon')).not.toHaveClass(/collapse-expanded/)
        await expect(page.locator('[data-testid="collapse-hidden-content"]')).toHaveAttribute('style', 'display: none;')

        // open the advanced field
        await page.locator('[data-testid="collapse-trigger-label"]').click()

        await expect(page.getByTestId('route-form-strip-path')).not.toBeVisible()
      }, data,
      async () => {
        await expect(page.getByTestId('protocols-property-value')).toContainText(`${protocol}`.replace(',', ''))
        await expect(page.getByTestId('methods-property-value')).toContainText(' – ') // todo: this property should not visible here
        await expect(page.getByTestId('strip_path-property-value')).toContainText('false') // todo: this property should not visible here
      })
    }
  })

  test('route create - successful with "tls", "tcp"', async ({ page }) => {
    const protocols = ['tcp', 'tls', 'tcp,tls,udp']
    const data = {
      'route-form-name': `route_name_${Date.now()}`,
      'route-form-tags': 'tag1,tag2',
    }

    for (let index = 0, len = protocols.length; index < len; index++) {
      const protocol = protocols[index]

      await createRoute(page, async () => {
        await selectService(page, service.id)
        await selectProtocols(page, protocol)
        if (protocol.includes('tls')) {
          await fillArrayField(page, 'snis', ['snis'])
        }

        await expect(page.getByTestId('routing-rule-hosts')).toHaveCount(0)
        await expect(page.getByTestId('routing-rule-methods')).toHaveCount(0)

        await expect(page.getByTestId('routing-rule-sources')).toHaveAttribute('aria-disabled', 'false')
        await expect(page.getByTestId('routing-rule-destinations')).toHaveAttribute('aria-disabled', 'false')

        await page.getByTestId('routing-rule-sources').click()
        await page.getByTestId('route-form-sources-ip-input-1').fill('10.1.0.0/16')
        await page.getByTestId('route-form-sources-port-input-1').fill('1234')

        await page.getByTestId('add-sources').click()
        await page.getByTestId('route-form-sources-ip-input-2').fill('10.1.0.0/16')
        await page.getByTestId('route-form-sources-port-input-2').fill('4321')
      }, data,
      async () => {
        await expect(page.getByTestId('protocols-property-value')).toContainText(`${protocol}`.replace(/,/g, ''))
        await expect(page.getByTestId('methods-property-value')).toContainText(' – ') // todo: this property should not visible here
        await expect(page.getByTestId('hosts-property-value')).toContainText(' – ') // todo: this property should not visible here
      })
    }
  })

  test('route create changing protocols from tcp to http - successful', async ({ page }) => {
    const data = {
      'route-form-name': `route_name_${Date.now()}`,
      'route-form-tags': 'tag1,tag2',
    }

    await createRoute(page, async () => {
      await selectService(page, service.id)
      await selectProtocols(page, 'tcp')
      await expect(page.getByTestId('routing-rule-sources')).toHaveAttribute('aria-disabled', 'false')

      await page.getByTestId('routing-rule-sources').click()
      await expect(page.getByTestId('route-form-sources-ip-input-1')).toBeVisible()
      await page.getByTestId('route-form-sources-ip-input-1').fill('10.1.0.0/16')
      await page.getByTestId('route-form-sources-port-input-1').fill('1234')

      await page.getByTestId('add-sources').click()
      await expect(page.getByTestId('route-form-sources-ip-input-2')).toBeVisible()
      await page.getByTestId('route-form-sources-ip-input-2').fill('10.1.0.0/16')
      await page.getByTestId('route-form-sources-port-input-2').fill('4321')

      // change protocol
      await selectProtocols(page, 'http')
      await expect(page.getByTestId('routing-rule-sources')).toHaveCount(0)
      await fillArrayField(page, 'hosts', ['localhost'])
      await selectMethods(page, ['GET'])
    }, data,
    async () => {
      await expect(page.getByTestId('protocols-property-value')).toContainText('http')
      await expect(page.getByTestId('methods-property-value')).toContainText(['GET'])
      await expect(page.getByTestId('sources-property-value')).toContainText(' – ') // todo: this property should not visible here
    })
  })

  test('route create with http protocol by default - successful', async ({ page }) => {
    const data = {
      'route-form-name': `route_name_${Date.now()}`,
      'route-form-tags': 'tag1,tag2',
    }

    await createRoute(page, async () => {
      await selectService(page, service.id)
      await fillArrayField(page, 'hosts', ['localhost'])
    }, data,
    async () => {
      await expect(page.getByTestId('protocols-property-value')).toContainText('httphttps')
    })
  })

  test('route create with https protocol if selected - successful', async ({ page }) => {
    const data = {
      'route-form-name': `route_name_${Date.now()}`,
      'route-form-tags': 'tag1,tag2',
    }

    await createRoute(page, async () => {
      await selectService(page, service.id)
      await selectProtocols(page, 'https')
      await fillArrayField(page, 'hosts', ['localhost'])
    }, data,
    async () => {
      await expect(page.getByTestId('protocols-property-value')).toContainText('https')
    })
  })

  test('route create - with valid regex paths - successful', async ({ page }) => {
    const data = {
      'route-form-name': `route_name_${Date.now()}`,
      'route-form-tags': 'tag1,tag2',
    }

    await createRoute(page, async () => {
      await selectService(page, service.id)

      await fillArrayField(page, 'paths', ['/kong(-ee){0,1}.com'], true)
    }, data,
    async () => {
      await expect(page.getByTestId('paths-property-value')).toContainText(['/kong(-ee){0,1}.com'])
    })
  })

  test('routes show - links to service without a name', async ({ page }) => {
    const data = {
      'route-form-name': `route_name_${Date.now()}`,
      'route-form-tags': 'tag1,tag2',
    }

    await createRoute(page, async () => {
      await selectService(page, serviceWithNoName.id)
      await selectMethods(page, ['GET'])
    }, data,
    async () => {
      await expect(page.getByTestId('service-property-value')).toContainText(serviceWithNoName.id)
    })
  })

  test('create route - with pre-populated service.id - select service is hidden', async ({ page }) => {
    await clearKongResources('/services')

    await createKongResource('/services', {
      name: 'service1',
      url: 'http://service1',
    })

    await page.goto('/services')
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await switchDetailTab(page, 'routes')
    await page.click('.kong-ui-entities-routes-list .table-empty-state .primary')
    await expect(page.locator('[data-testid="route-form-service-id"]')).not.toBeVisible()
  })

  test('removing scoped route\'s service field should cause no errors', async ({ page, routeListPage }) => {
    await clearKongResources('/services')
    await clearKongResources('/routes')

    const svc = await createKongResource('/services', {
      name: 's1',
      url: 'http://s',
    })

    const route = await createKongResource('/routes', {
      name: 'test',
      protocols: ['http', 'https'],
      methods: ['GET'],
      service: { id: svc?.data.id },
    })

    await routeListPage.goto()
    await withNavigation(page, async () => await clickEntityListAction(page, 'edit'))

    await expect(page.locator('[data-testid="route-form-service-id"]')).toBeVisible()
    await page.locator('.kui-icon.close-icon').click()

    await withNavigation(page, () =>
      fillEntityForm({
        page,
        withAction: 'submit',
      }),
    )

    await page.goto(`/routes/${route?.data.id}`)

    await expect(page.getByTestId('service-property-value')).toContainText('-')
  })
})

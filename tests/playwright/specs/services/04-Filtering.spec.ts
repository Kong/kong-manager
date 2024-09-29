import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'
import { clearKongResources } from '@pw/commands/clearKongResources'
import { createKongResource } from '@pw/commands/createKongResource'
import { ServiceListPage } from '@pw/pages/services'

const test = baseTest().extend<{
  serviceListPage: ServiceListPage
}>({
  serviceListPage: async ({ page }, use) => await use(new ServiceListPage(page)),
})

test.beforeAll(async () => {
  await clearKongResources('/services')

  for (let i = 0; i <= 10; i++) {
    await createKongResource('/services', {
      name: `service-${i}`,
      enabled: i % 2 === 0,
      protocol: i % 2 === 0 ? 'http' : 'https',
      host: `${i}.kong-manager.local`,
      port: i,
      path: `/path-${i}`,
    })
  }
})

test.afterAll(async () => {
  await clearKongResources('/services')
})

test.describe('Filtering', () => {
  test('displays all services before search', async ({ page, serviceListPage }) => {
    await serviceListPage.goto()
    for (let i = 0; i <= 10; i++) {
      await expect(page.locator(`.kong-ui-entities-gateway-services-list tr[data-testid="service-${i}"]`)).toBeVisible()
    }
  })

  test('Exact matching and displays only the result after search', async ({ page, serviceListPage }) => {
    await serviceListPage.goto()

    const inputWrapper = page.locator('.kong-ui-entity-filter-input')

    await inputWrapper.click()
    await inputWrapper.locator('input').type('service-9')

    await expect(page.locator('tbody tr:first-child [data-testid="name"]')).toContainText('service-9')
    await expect(page.locator('tbody tr')).toHaveCount(1)
  })

  test('displays error if no results for services', async ({ page, serviceListPage }) => {
    await serviceListPage.goto()

    const inputWrapper = page.locator('.kong-ui-entity-filter-input')

    await inputWrapper.click()
    await inputWrapper.locator('input').type('foo')

    await expect(page.locator('.empty-state-title')).toHaveText('No results found')
  })
})

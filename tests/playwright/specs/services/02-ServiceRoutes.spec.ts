import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'
import { autocompleteDeleteModal } from '@pw/commands/autocompleteDeleteModal'
import { clearKongResources } from '@pw/commands/clearKongResources'
import { clickEntityListAction } from '@pw/commands/clickEntityListAction'
import { createKongResource } from '@pw/commands/createKongResource'
import { expectEmptyEntityList } from '@pw/commands/expectEmptyEntityList'
import { fillEntityForm } from '@pw/commands/fillEntityForm'
import { selectMethods } from '@pw/commands/selectMethods'
import { switchDetailTab } from '@pw/commands/switchDetailTab'
import { waitAndDismissToasts } from '@pw/commands/waitAndDismissToast'
import { withNavigation } from '@pw/commands/withNavigation'
import { ServiceListPage } from '@pw/pages/services'

const testRoute = {
  'route-form-name': 'testRoute',
}

const test = baseTest().extend<{
  serviceListPage: ServiceListPage
}>({
  serviceListPage: async ({ page }, use) => await use(new ServiceListPage(page)),
})

test.describe('service routes', () => {
  test.beforeAll(async () => {
    await clearKongResources('/routes')
    await clearKongResources('/services')
    await createKongResource('/services', {
      name: 'testService',
      url: 'http://example.com:8080/test',
    })
  })

  test.beforeEach(async ({ serviceListPage }) => {
    await serviceListPage.goto()
  })

  test.afterAll(async () => {
    await clearKongResources('/routes')
    await clearKongResources('/services')
  })

  test('service routes list is empty', async ({ page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await switchDetailTab(page, 'routes')
    await expectEmptyEntityList(page, 'routes', 'Configure a New Route')
  })

  test('service route create - cancel button', async ({ page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await switchDetailTab(page, 'routes')
    await page.waitForSelector('.kong-ui-entities-routes-list .table-empty-state')
    await withNavigation(page, () =>
      page.locator('.kong-ui-entities-routes-list .table-empty-state .primary').click(),
    )

    await expect(page.locator('.kong-ui-entities-route-form')).toBeVisible()
    await page.locator('[data-testid="route-create-form-cancel"]').click()

    await expectEmptyEntityList(page, 'routes', 'Configure a New Route')
  })

  test('create an service-associated route with empty methods - save button is disabled', async ({ page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await switchDetailTab(page, 'routes')
    await page.waitForSelector('.kong-ui-entities-routes-list .table-empty-state')
    await withNavigation(page, () =>
      page.locator('.kong-ui-entities-routes-list .table-empty-state .primary').click(),
    )

    await expect(page.locator('[data-testid="route-create-form-submit"]')).toBeDisabled()
  })

  test('create an service-associated route via tab', async ({ page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await switchDetailTab(page, 'routes')
    await page.waitForSelector('.kong-ui-entities-routes-list .table-empty-state')
    await withNavigation(page, () =>
      page.locator('.kong-ui-entities-routes-list .table-empty-state .primary').click(),
    )

    await selectMethods(page, ['GET'])
    await withNavigation(page, () =>
      fillEntityForm({
        page,
        formData: testRoute,
        withAction: 'submit',
      }),
    )
    await waitAndDismissToasts(page)

    await page.waitForSelector('.kong-ui-entities-routes-list')
    await clickEntityListAction(page, 'delete')
    await autocompleteDeleteModal(page)
  })

  test('create an service-associated route with empty name', async ({ page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await switchDetailTab(page, 'routes')
    await page.waitForSelector('.kong-ui-entities-routes-list .table-empty-state')
    await withNavigation(page, () =>
      page.locator('.kong-ui-entities-routes-list .table-empty-state .primary').click(),
    )

    await selectMethods(page, ['GET'])
    await withNavigation(page, () =>
      fillEntityForm({
        page,
        formData: {},
        withAction: 'submit',
      }),
    )
    await waitAndDismissToasts(page)

    await page.waitForSelector('.kong-ui-entities-routes-list')
    await clickEntityListAction(page, 'delete')
    await autocompleteDeleteModal(page)
  })

  test('update route of a service via the route detail page, redirect back to the route detail page', async ({ page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await switchDetailTab(page, 'routes')
    await page.waitForSelector('.kong-ui-entities-routes-list .table-empty-state')
    await withNavigation(page, () =>
      page.locator('.kong-ui-entities-routes-list .table-empty-state .primary').click(),
    )

    await selectMethods(page, ['GET'])
    await withNavigation(page, () =>
      fillEntityForm({
        page,
        formData: {},
        withAction: 'submit',
      }),
    )
    await waitAndDismissToasts(page)

    await withNavigation(page, () => clickEntityListAction(page, 'edit'))
    await withNavigation(page, () =>
      fillEntityForm({
        page,
        formData: {
          'route-form-name': 'test.111',
        },
        withAction: 'submit',
      }),
    )
    await page.waitForSelector('.kong-ui-entities-routes-list')
    await expect(page.locator('tr[data-testid="test.111"]')).toBeVisible()
    await expect(page.locator('tr[data-testid="test.111"] [data-testid="name"]')).toContainText('test.111')
  })

  test("edit action should bring the user to the route's edit page", async ({ page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await switchDetailTab(page, 'routes')
    await withNavigation(page, () => clickEntityListAction(page, 'edit'))
    await page.waitForSelector('.kong-ui-entities-route-form')
  })

  test('cancel button on the edit page should bring the user back to the route tab', async ({ page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await switchDetailTab(page, 'routes')
    await withNavigation(page, () => clickEntityListAction(page, 'edit'))
    await withNavigation(page, () =>
      fillEntityForm({
        page,
        withAction: 'cancel',
      }))
    await page.waitForSelector('.kong-ui-entities-routes-list')
  })

  test('delete the route', async ({ page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await switchDetailTab(page, 'routes')
    await page.waitForSelector('.kong-ui-entities-routes-list')
    await clickEntityListAction(page, 'delete')
    await autocompleteDeleteModal(page)
    // redirects back to the route tab
    await expectEmptyEntityList(page, 'routes', 'Configure a New Route')
  })
})

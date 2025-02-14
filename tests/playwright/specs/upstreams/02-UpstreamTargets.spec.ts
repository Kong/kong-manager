import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'
import { clearKongResources } from '@pw/commands/clearKongResources'
import { clickEntityListAction } from '@pw/commands/clickEntityListAction'
import { createKongResource } from '@pw/commands/createKongResource'
import { fillEntityForm } from '@pw/commands/fillEntityForm'
import { switchDetailTab } from '@pw/commands/switchDetailTab'
import { waitAndDismissToasts } from '@pw/commands/waitAndDismissToast'
import { withNavigation } from '@pw/commands/withNavigation'
import { UpstreamListPage } from '@pw/pages/upstreams'

const mockUpstreamName = 'localhost'
const mockTarget = '1.2.3.4'

const test = baseTest()

test.describe('upstreams', () => {
  test.beforeAll(async () => {
    await clearKongResources('/upstreams')
    await createKongResource('/upstreams', {
      name: mockUpstreamName,
    })
  })

  test.beforeEach(async ({ page }) => {
    await new UpstreamListPage(page).goto()
  })

  test.afterAll(async () => {
    await clearKongResources('/upstreams')
  })

  test('create a target successful', async ({ page }) => {
    await withNavigation(page, async () => await clickEntityListAction(page, 'view'))
    await switchDetailTab(page, 'targets')
    await page.locator('.empty-state-action .primary').click()
    await page.waitForSelector('.kong-ui-entities-target-form')
    await page.locator('[data-testid="target-form-target"]').type(mockTarget)
    await page.locator('.k-prompt [data-testid="modal-action-button"]').click()
    await expect(page.locator('.kong-ui-entities-targets-list')).toContainText(mockTarget)
  })

  test('create a target fail', async ({ page }) => {
    await withNavigation(page, async () => await clickEntityListAction(page, 'view'))
    await switchDetailTab(page, 'targets')
    await page.locator('.toolbar-container .primary').click()
    await page.waitForSelector('.kong-ui-entities-target-form')
    await page.locator('[data-testid="target-form-target"]').type('123')
    await page.locator('.k-prompt [data-testid="modal-action-button"]').click()
    await expect(page.locator('.kong-ui-entities-target-form [data-testid="form-error"]')).toBeVisible()
    await expect(page.locator('.kong-ui-entities-target-form [data-testid="form-error"]')).toHaveText('schema violation (target: Invalid target (\'123\'); not a valid hostname or ip address)')
  })

  test('mark healthy/unhealthy should not appear in the menu', async ({ page }) => {
    await withNavigation(page, async () => await clickEntityListAction(page, 'view'))
    await switchDetailTab(page, 'targets')
    const row = page.locator('.kong-ui-entities-targets-list').locator('tbody tr').first()

    await row.locator('[data-testid="row-actions-dropdown-trigger"]').click()
    await expect(row.locator('[data-testid="action-target-mark-healthy"]')).not.toBeVisible()
    await expect(row.locator('[data-testid="action-target-mark-unhealthy"]')).not.toBeVisible()
  })

  test('enable active healthcheck, mark healthy/unhealthy should appear in the menu', async ({ page }) => {
    await withNavigation(page, async () => await clickEntityListAction(page, 'edit'))

    await expect(page.locator('.kong-ui-entities-upstreams-active-healthcheck')).not.toBeVisible()
    await expect(page.locator('.kong-ui-entities-upstreams-passive-healthcheck')).not.toBeVisible()
    await page.locator('.active-health-switch .switch-control').click()
    await expect(page.locator('.kong-ui-entities-upstreams-active-healthcheck')).toBeVisible()
    await expect(page.locator('.kong-ui-entities-upstreams-passive-healthcheck')).not.toBeVisible()

    await fillEntityForm({
      page,
      formData: {},
      withAction: 'submit',
    })
    await waitAndDismissToasts(page)

    await switchDetailTab(page, 'targets')
    const row = page.locator('.kong-ui-entities-targets-list').locator('tbody tr').first()

    await row.locator('[data-testid="row-actions-dropdown-trigger"]').click()
    await expect(row.locator('[data-testid="action-target-mark-healthy"]')).toBeVisible()
    await expect(row.locator('[data-testid="action-target-mark-unhealthy"]')).toBeVisible()
  })

  test('enable passive healthcheck, mark healthy/unhealthy should appear in the menu', async ({ page }) => {
    await withNavigation(page, async () => await clickEntityListAction(page, 'edit'))

    await expect(page.locator('.kong-ui-entities-upstreams-active-healthcheck')).toBeVisible()
    await expect(page.locator('.kong-ui-entities-upstreams-passive-healthcheck')).not.toBeVisible()
    await page.locator('.active-health-switch .switch-control').click()
    await page.locator('.passive-health-switch .switch-control').click()
    await expect(page.locator('.kong-ui-entities-upstreams-active-healthcheck')).not.toBeVisible()
    await expect(page.locator('.kong-ui-entities-upstreams-passive-healthcheck')).toBeVisible()

    await fillEntityForm({
      page,
      formData: {},
      withAction: 'submit',
    })
    await waitAndDismissToasts(page)

    await switchDetailTab(page, 'targets')
    const row = page.locator('.kong-ui-entities-targets-list').locator('tbody tr').first()

    await row.locator('[data-testid="row-actions-dropdown-trigger"]').click()
    await expect(row.locator('[data-testid="action-target-mark-healthy"]')).toBeVisible()
    await expect(row.locator('[data-testid="action-target-mark-unhealthy"]')).toBeVisible()
  })

  test('enable active+passive healthcheck, mark healthy/unhealthy should appear in the menu', async ({ page }) => {
    await withNavigation(page, async () => await clickEntityListAction(page, 'edit'))

    await expect(page.locator('.kong-ui-entities-upstreams-active-healthcheck')).not.toBeVisible()
    await expect(page.locator('.kong-ui-entities-upstreams-passive-healthcheck')).toBeVisible()
    await page.locator('.active-health-switch .switch-control').click()
    await expect(page.locator('.kong-ui-entities-upstreams-active-healthcheck')).toBeVisible()
    await expect(page.locator('.kong-ui-entities-upstreams-passive-healthcheck')).toBeVisible()

    await fillEntityForm({
      page,
      formData: {},
      withAction: 'submit',
    })
    await waitAndDismissToasts(page)

    await switchDetailTab(page, 'targets')
    const row = page.locator('.kong-ui-entities-targets-list').locator('tbody tr').first()

    await row.locator('[data-testid="row-actions-dropdown-trigger"]').click()
    await expect(row.locator('[data-testid="action-target-mark-healthy"]')).toBeVisible()
    await expect(row.locator('[data-testid="action-target-mark-unhealthy"]')).toBeVisible()
  })

  test('hybrid mode: mark healthy/unhealthy should not appear in the menu', async ({ page }) => {
    await page.route('http://localhost:8001/', async (route) => {
      const response = await route.fetch()
      const json = await response.json()

      // mock for control_plane in hybrid mode
      json.configuration.role = 'control_plane'
      await route.fulfill({ response, json })
    })

    await new UpstreamListPage(page).goto()

    await withNavigation(page, async () => await clickEntityListAction(page, 'view'))

    await switchDetailTab(page, 'targets')
    const row = page.locator('.kong-ui-entities-targets-list').locator('tbody tr').first()

    await row.locator('[data-testid="row-actions-dropdown-trigger"]').click()
    await expect(row.locator('[data-testid="action-target-mark-healthy"]')).not.toBeVisible()
    await expect(row.locator('[data-testid="action-target-mark-unhealthy"]')).not.toBeVisible()
  })
})

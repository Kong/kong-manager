import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'
import { clearKongResources } from '@pw/commands/clearKongResources'
import { clickEntityListAction } from '@pw/commands/clickEntityListAction'
import { createKongResource } from '@pw/commands/createKongResource'
import { switchDetailTab } from '@pw/commands/switchDetailTab'
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
    await page.locator('.empty-state-content .primary').click()
    await page.waitForSelector('.kong-ui-entities-target-form')
    await page.locator('[data-testid="target-form-target"]').type(mockTarget)
    await page.locator('.k-prompt .k-prompt-proceed').click()
    await expect(page.locator('.kong-ui-entities-targets-list')).toContainText(mockTarget)
  })

  test('create a target fail', async ({ page }) => {
    await withNavigation(page, async () => await clickEntityListAction(page, 'view'))
    await switchDetailTab(page, 'targets')
    await page.locator('.toolbar-container .primary').click()
    await page.waitForSelector('.kong-ui-entities-target-form')
    await page.locator('[data-testid="target-form-target"]').type('123')
    await page.locator('.k-prompt .k-prompt-proceed').click()
    await expect(page.locator('.kong-ui-entities-target-form [data-testid="form-error"]')).toBeVisible()
    await expect(page.locator('.kong-ui-entities-target-form [data-testid="form-error"]')).toHaveText(`schema violation (target: Invalid target ('123'); not a valid hostname or ip address)`)
  })
})

import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'
import { clearKongResources } from '@pw/commands/clearKongResources'
import { createKongResource } from '@pw/commands/createKongResource'
import { UpstreamListPage } from '@pw/pages/upstreams'

const test = baseTest()

test.describe('upstreams filter', () => {
  test.beforeAll(async () => {
    await clearKongResources('/upstreams')
    await createKongResource('/upstreams', { name: 'upstreamA' })
    await createKongResource('/upstreams', { name: 'upstreamB' })
  })

  test.beforeEach(async ({ page }) => {
    await new UpstreamListPage(page).goto()
  })

  test.afterAll(async () => {
    await clearKongResources('/upstreams')
  })

  test('displays all upstreams before search', async ({ page }) => {
    await expect(page.locator('.kong-ui-entities-upstreams-list tr [data-testid="upstreamA"]')).toBeVisible()
    await expect(page.locator('.kong-ui-entities-upstreams-list tr [data-testid="upstreamB"]')).toBeVisible()
  })

  test('displays only the result after searching for upstream', async ({ page }) => {
    await expect(page.locator('.kong-ui-entity-filter-input')).toBeVisible()
    await page.fill('[data-testid="search-input"]', 'upstreamA')
    await expect(page.locator('.kong-ui-entities-upstreams-list tr [data-testid="upstreamB"]')).not.toBeVisible()
    await expect(page.locator('.kong-ui-entities-upstreams-list tr [data-testid="upstreamA"]')).toBeVisible()
  })

  test('displays error if no results for upstream', async ({ page }) => {
    await expect(page.locator('.kong-ui-entity-filter-input')).toBeVisible()
    await page.fill('[data-testid="search-input"]', 'foo')
    await expect(page.locator('.empty-state-title .k-empty-state-title-header')).toHaveText('No results found')
    // clear the filter
    await page.locator('[data-testid="clear"]').click()
    await expect(page.locator('.kong-ui-entities-upstreams-list tr [data-testid="upstreamA"]')).toBeVisible()
    await expect(page.locator('.kong-ui-entities-upstreams-list tr [data-testid="upstreamB"]')).toBeVisible()
  })
})

import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'
import { clearKongResources } from '@pw/commands/clearKongResources'
import { createKongResource } from '@pw/commands/createKongResource'
import certificates from '@pw/fixtures/certificates'
import { SniListPage } from '@pw/pages/snis'

const test = baseTest().extend<{
  sniListPage: SniListPage
}>({
  sniListPage: async ({ page }, use) => await use(new SniListPage(page)),
})

test.describe('snis filter', () => {
  test.beforeAll(async () => {
    await clearKongResources('/snis')
    await clearKongResources('/certificates')
    const certificate = (await createKongResource('/certificates', {
      cert: certificates.legacy.cert,
      key: certificates.legacy.key,
    }))?.data

    await createKongResource('/snis', { name: 'snisa', certificate })
    await createKongResource('/snis', { name: 'snisb', certificate })
  })

  test.beforeEach(async ({ sniListPage }) => {
    await sniListPage.goto()
  })

  test.afterAll(async () => {
    await clearKongResources('/snis')
    await clearKongResources('/certificates')
  })

  test('displays all snis before search', async ({ page }) => {
    await expect(page.locator('.kong-ui-entities-snis-list tr[data-testid="snisa"]')).toBeVisible()
    await expect(page.locator('.kong-ui-entities-snis-list tr[data-testid="snisb"]')).toBeVisible()
  })

  test('displays only the result after search for upstream', async ({ page }) => {
    await expect(page.locator('.kong-ui-entity-filter-input')).toBeVisible()
    await page.fill('[data-testid="search-input"]', 'snisa')
    await expect(page.locator('.kong-ui-entities-snis-list tr[data-testid="snisb"]')).not.toBeVisible()
    await expect(page.locator('.kong-ui-entities-snis-list tr[data-testid="snisa"]')).toBeVisible()
  })

  test('displays error if no results for upstream', async ({ page }) => {
    await expect(page.locator('.kong-ui-entity-filter-input')).toBeVisible()
    await page.fill('[data-testid="search-input"]', 'foo')
    await expect(page.locator('.empty-state-title')).toHaveText('No results found')
    // clear the filter
    await page.locator('[data-testid="empty-state-action"]').click()
    await expect(page.locator('.kong-ui-entities-snis-list tr[data-testid="snisa"]')).toBeVisible()
    await expect(page.locator('.kong-ui-entities-snis-list tr[data-testid="snisb"]')).toBeVisible()
  })
})

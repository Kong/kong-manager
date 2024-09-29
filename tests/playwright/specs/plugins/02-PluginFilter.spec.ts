import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'
import { clearKongResources } from '@pw/commands/clearKongResources'
import { createKongResource } from '@pw/commands/createKongResource'
import { PluginListPage } from '@pw/pages/plugins'

const test = baseTest()

test.describe('plugins filter', () => {
  test.beforeAll(async () => {
    await clearKongResources('/plugins')
    await createKongResource('/plugins', { name: 'basic-auth', instance_name: 'basic-auth' })
    await createKongResource('/plugins', { name: 'hmac-auth', instance_name: 'hmac-auth' })
  })

  test.beforeEach(async ({ page }) => {
    await new PluginListPage(page).goto()
  })

  test.afterAll(async () => {
    await clearKongResources('/plugins')
  })

  test('displays all plugins before search', async ({ page }) => {
    await expect(page.locator('.kong-ui-entities-plugins-list table tbody tr')).toHaveCount(2)
    await expect(page.locator('.kong-ui-entities-plugins-list tr[data-testid="basic-auth"]')).toBeVisible()
    await expect(page.locator('.kong-ui-entities-plugins-list tr[data-testid="hmac-auth"]')).toBeVisible()
  })

  test('displays only the result after search for plugin', async ({ page }) => {
    await expect(page.locator('.kong-ui-entity-filter-input')).toBeVisible()
    await page.fill('[data-testid="search-input"]', 'basic-auth')
    await expect(page.locator('.kong-ui-entities-plugins-list tr[data-testid="hmac-auth"]')).not.toBeVisible()
    await expect(page.locator('.kong-ui-entities-plugins-list tr[data-testid="basic-auth"]')).toBeVisible()
  })

  test('displays error if no results for plugin', async ({ page }) => {
    await expect(page.locator('.kong-ui-entity-filter-input')).toBeVisible()
    await page.fill('[data-testid="search-input"]', 'foo')
    await expect(page.locator('.empty-state-title')).toHaveText('No results found')
    // clear the filter
    await page.locator('[data-testid="empty-state-action"]').click()
    await expect(page.locator('.kong-ui-entities-plugins-list tr[data-testid="basic-auth"]')).toBeVisible()
    await expect(page.locator('.kong-ui-entities-plugins-list tr[data-testid="hmac-auth"]')).toBeVisible()
  })
})

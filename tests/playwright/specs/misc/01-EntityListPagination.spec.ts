import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'
import { clearKongResources } from '@pw/commands/clearKongResources'
import { createKongResource } from '@pw/commands/createKongResource'
import { ConsumerListPage } from '@pw/pages/consumers'

const test = baseTest()

test.describe('entity list pagination', () => {
  test.beforeAll(async () => {
    await clearKongResources('/consumers')
    await Promise.all(
      Array(50).fill(0).map((_, i) =>
        createKongResource('/consumers', {
          username: `consumer-${i.toString().padStart(3, '0')}`,
        }),
      ),
    )
  })

  test.beforeEach(async ({ page }) => {
    await new ConsumerListPage(page).goto()
  })

  test.afterAll(async () => {
    await clearKongResources('/consumers')
  })

  test('should have default page size of 100', async ({ page }) => {
    const innerText = await page.locator('[data-testid="page-size-dropdown"]').innerText()

    expect(innerText, 'should have default page size of 30').toContain('30 items per page')
  })

  test('should persist page size', async ({ page }) => {
    const pageSizeSelect = page.locator('[data-testid="page-size-dropdown"]')

    await pageSizeSelect.locator('[data-testid="dropdown-trigger"] > button').click()
    await pageSizeSelect.locator('button[value="100"]').click()

    expect(await pageSizeSelect.innerText(), 'should have page size of 100').toContain('100 items per page')

    await page.reload()

    expect(await pageSizeSelect.innerText(), 'should persist page size of 100').toContain('100 items per page')
  })
})

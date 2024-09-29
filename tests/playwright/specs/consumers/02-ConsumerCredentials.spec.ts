import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'
import { clearKongResources } from '@pw/commands/clearKongResources'
import { clickEntityListAction } from '@pw/commands/clickEntityListAction'
import { createKongResource } from '@pw/commands/createKongResource'
import { switchDetailTab } from '@pw/commands/switchDetailTab'
import { withNavigation } from '@pw/commands/withNavigation'
import { ConsumerListPage } from '@pw/pages/consumers'

const mockConsumerName = 'testUser'
const mockCredential = 'testCredential'
const mockCredentialPassword = 'testCredentialPassword'

const test = baseTest()

test.describe('consumer credentials', () => {
  test.beforeAll(async () => {
    await clearKongResources('/consumers')
    await clearKongResources('/plugins')
    await createKongResource('/consumers', {
      username: mockConsumerName,
    })
  })

  test.beforeEach(async ({ page }) => {
    await new ConsumerListPage(page).goto()
  })

  test.afterAll(async () => {
    await clearKongResources('/consumers')
    await clearKongResources('/plugins')
  })

  test('consumer show - can add a credential, basic-auth', async ({ page }) => {
    await createKongResource('/plugins', { name: 'basic-auth' })

    await withNavigation(page, async () => await clickEntityListAction(page, 'view'))
    await switchDetailTab(page, 'credentials')

    const basicAuthLocator = page.locator('.credential-list-wrapper').filter({ hasText: 'Basic Authentication' })

    await basicAuthLocator.locator('[data-testid="empty-state-action"]').click()
    await page.locator('#username').fill(mockCredential)
    await page.locator('#password').fill(mockCredentialPassword)
    await page.locator('[data-testid="form-actions"] .primary').click()
    await expect(basicAuthLocator.locator('table [data-testid="username"]')).toContainText(mockCredential)
  })

  test('consumer show - can delete a credential', async ({ page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await switchDetailTab(page, 'credentials')
    await clickEntityListAction(page, 'delete')
    await expect(page.locator('.modal-container')).toBeVisible()
    await page.locator('.modal-footer .footer-actions .danger').click()
    const basicAuthLocator = page.locator('.credential-list-wrapper').filter({ hasText: 'Basic Authentication' })

    await expect(basicAuthLocator.locator('.empty-state-action .primary')).toContainText('New Basic Auth Credential')
  })
})

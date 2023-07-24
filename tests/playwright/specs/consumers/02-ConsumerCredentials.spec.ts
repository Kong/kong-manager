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

    const basic_auth_locator = page.locator('.credential-list-wrapper').filter({ hasText: 'Basic Authentication' })

    await basic_auth_locator.locator('[data-testid="new-basic-auth-credential"]').click()
    await page.locator('#username').fill(mockCredential)
    await page.locator('#password').fill(mockCredentialPassword)
    await page.locator('[data-testid="form-footer-actions"] .primary').click()
    await expect(basic_auth_locator.locator('table [data-testid="username"]')).toContainText(mockCredential)
  })

  test('consumer show - can delete a credential', async ({ page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await switchDetailTab(page, 'credentials')
    await withNavigation(page, () => clickEntityListAction(page, 'delete'))
    await expect(page.locator('.k-modal-dialog.modal-dialog')).toBeVisible()
    await page.locator('.k-prompt-action-buttons .danger').click()
    const basic_auth_locator = page.locator('.credential-list-wrapper').filter({ hasText: 'Basic Authentication' })

    await expect(basic_auth_locator.locator('.empty-state-content .primary')).toContainText('New Basic Auth Credential')
  })
})

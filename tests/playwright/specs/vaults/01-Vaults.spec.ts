import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'
import { autocompleteDeleteModal } from '@pw/commands/autocompleteDeleteModal'
import { clearKongResources } from '@pw/commands/clearKongResources'
import { clickEntityListAction } from '@pw/commands/clickEntityListAction'
import { fillEntityForm } from '@pw/commands/fillEntityForm'
import { waitAndDismissToasts } from '@pw/commands/waitAndDismissToast'
import { withNavigation } from '@pw/commands/withNavigation'
import { VaultListPage } from '@pw/pages/vaults'

const mockVaultName = 'env'
const mockPrefix = 'not-env'
const mockTag = 'env.tag'

const test = baseTest()

test.describe('vaults', () => {
  test.beforeAll(async () => {
    await clearKongResources('/vaults')
  })

  test.beforeEach(async ({ page }) => {
    await new VaultListPage(page).goto()
  })

  test.afterAll(async () => {
    await clearKongResources('/vaults')
  })

  test('create a vault successful', async ({ page }) => {
    await withNavigation(
      page,
      async () => await page.locator('.table-empty-state .primary').click(),
    )

    await expect(page.locator('.vault-form-provider-cards-container')).toBeVisible()
    await page.getByTestId('provider-select').click()
    await page.click('[data-testid="vault-form-provider-env"]')
    await fillEntityForm({
      page,
      formData: {
        'vault-form-prefix': mockPrefix,
        'vault-form-config-kong-prefix': '_ssl',
      },
      withAction: 'submit',
    })
    await waitAndDismissToasts(page)
    await expect(page.locator('.kong-ui-vault-entity-config-card')).toBeVisible()
    await expect(page.locator('[data-testid="name-plain-text"]')).toHaveText(mockVaultName)
    await expect(page.locator('.config-card-details-basic-props [data-testid="prefix-plain-text"]')).toHaveText(mockPrefix)
    await expect(page.locator('.config-card-details-advanced-props [data-testid="prefix-plain-text"]')).toHaveText('_ssl')
  })

  test('view vaults detail page', async ({ page }) => {
    await withNavigation(page, async () => await clickEntityListAction(page, 'view'))
    await expect(page.locator('.kong-ui-vault-entity-config-card')).toBeVisible()
    await expect(page.locator('[data-testid="name-plain-text"]')).toHaveText(mockVaultName)
    await expect(page.locator('.config-card-details-basic-props [data-testid="prefix-plain-text"]')).toHaveText(mockPrefix)
    await expect(page.locator('.config-card-details-advanced-props [data-testid="prefix-plain-text"]')).toHaveText('_ssl')
  })

  test('submit vault editing', async ({ page }) => {
    await withNavigation(page, async () => await clickEntityListAction(page, 'edit'))
    await withNavigation(
      page,
      async () =>
        await fillEntityForm({
          page,
          formData: {
            'vault-form-tags': mockTag,
          },
          withAction: 'submit',
        }),
    )
    await expect(page.getByTestId('tags-property-value')).toContainText(mockTag)
  })

  test('cancel vault editing', async ({ page }) => {
    await clickEntityListAction(page, 'edit')
    await withNavigation(
      page,
      async () =>
        await fillEntityForm({
          page,
          formData: {
            'vault-form-tags': `${mockTag}${mockTag}`,
          },
          withAction: 'cancel',
        }),
    )
    await expect(page.locator('.k-table-data .table-wrapper [data-testid="tags"]')).toHaveText(mockTag)
  })

  test('delete a vault', async ({ page }) => {
    await clickEntityListAction(page, 'delete')
    await expect(page.locator('.kong-ui-entity-delete-modal [data-testid="confirmation-input"]')).toBeVisible()
    await autocompleteDeleteModal(page)
    await waitAndDismissToasts(page)
  })

  test('create a vault failure when prefix is "env"', async ({ page }) => {
    await withNavigation(
      page,
      async () => await page.locator('.table-empty-state .primary').click(),
    )

    await expect(page.locator('.vault-form-provider-cards-container')).toBeVisible()
    await page.getByTestId('provider-select').click()
    await page.click('[data-testid="vault-form-provider-env"]')
    await fillEntityForm({
      page,
      formData: {
        'vault-form-prefix': 'env',
        'vault-form-config-kong-prefix': '_ssl',
      },
      withAction: 'submit',
    })
    await expect(page.locator('[data-testid="form-error"] .alert-message')).toBeVisible()
    await expect(page.locator('[data-testid="form-error"] .alert-message')).toContainText('schema violation (prefix: must not be one of: env)')
  })
})

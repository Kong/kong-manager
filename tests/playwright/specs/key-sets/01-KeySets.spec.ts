import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'
import { autocompleteDeleteModal } from '@pw/commands/autocompleteDeleteModal'
import { clearKongResources } from '@pw/commands/clearKongResources'
import { clickEntityListAction } from '@pw/commands/clickEntityListAction'
import { fillEntityForm } from '@pw/commands/fillEntityForm'
import { waitAndDismissToasts } from '@pw/commands/waitAndDismissToast'
import { withNavigation } from '@pw/commands/withNavigation'
import { KeySetListPage } from '@pw/pages/key-sets'

const mockName = 'ks12'
const mockTags = 'ktags'

const test = baseTest()

test.describe('keySets', () => {
  test.beforeAll(async () => {
    await clearKongResources('/key-sets')
  })

  test.beforeEach(async ({ page }) => {
    await new KeySetListPage(page).goto()
  })

  test.afterAll(async () => {
    await clearKongResources('/key-sets')
  })

  test('cancel the creation of a key set', async ({ page }) => {
    await expect(page.locator('.table-empty-state')).toBeVisible()
    await withNavigation(page, () => page.locator('.table-empty-state .primary').click())
    await withNavigation(page, () => page.locator('.form-actions [data-testid="set-create-form-cancel"]').click())
    await expect(page.locator('.table-empty-state')).toBeVisible()
  })

  test('create a key set', async ({ page }) => {
    await withNavigation(page, () => page.locator('.table-empty-state .primary').click())
    await withNavigation(page, () => fillEntityForm({
      page,
      formData: {
        'key-set-form-name': mockName,
      },
      method: 'fill',
      withAction: 'submit',
    }))
    await waitAndDismissToasts(page)

    await expect(page.locator('.page-header .title')).toHaveText(`Key Set: ${mockName}`)
    await expect(page.locator('[data-testid="name-plain-text"]')).toHaveText(mockName)
  })

  test('view key set detail page', async ({ page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await expect(page.locator('.page-header .title')).toHaveText(`Key Set: ${mockName}`)
    await expect(page.locator('[data-testid="name-plain-text"]')).toHaveText(mockName)
  })

  test('submit key set editing', async ({ page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'edit'))
    await withNavigation(page, () => fillEntityForm({
      page,
      formData: {
        'key-set-form-tags': mockTags,
      },
      method: 'fill',
      withAction: 'submit',
    }))

    await expect(page.locator('.page-header .title')).toHaveText(`Key Set: ${mockName}`)
    await expect(page.locator('[data-testid="name-plain-text"]')).toHaveText(mockName)
    await expect(page.locator('.badge-content-wrapper')).toHaveText(mockTags)
  })

  test('cancel key set editing', async ({ page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'edit'))
    await withNavigation(page, () => fillEntityForm({
      page,
      formData: {
        'key-set-form-tags': mockTags + ',tag-should-not-appear',
      },
      method: 'fill',
      withAction: 'cancel',
    }))

    await expect(page.locator('.k-table-data .table-wrapper [data-testid="name"]')).toContainText(mockName)
    await expect(page.locator('.k-table-data .table-wrapper [data-testid="tags"]')).toHaveText(mockTags)
    await expect(page.locator('.k-table-data tbody tr')).toHaveCount(1)
  })

  test('delete a key set', async ({ page }) => {
    await clickEntityListAction(page, 'delete')
    await expect(page.locator('.kong-ui-entity-delete-modal .modal-container')).toBeVisible()
    await autocompleteDeleteModal(page)
    await waitAndDismissToasts(page)
    await expect(page.locator('.table-empty-state')).toBeVisible()
  })
})

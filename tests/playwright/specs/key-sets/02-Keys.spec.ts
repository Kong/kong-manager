import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'
import { clearKongResources } from '@pw/commands/clearKongResources'
import { clickEntityListAction } from '@pw/commands/clickEntityListAction'
import { createKongResource } from '@pw/commands/createKongResource'
import { fillEntityForm } from '@pw/commands/fillEntityForm'
import { switchDetailTab } from '@pw/commands/switchDetailTab'
import { waitAndDismissToasts } from '@pw/commands/waitAndDismissToast'
import { withNavigation } from '@pw/commands/withNavigation'
import { KeySetListPage } from '@pw/pages/key-sets'

const mockName = 'ks12'
const mockJwName = 'jwk-key'
const mockJwKid = 'jwk'
const mockJwk = '{"kty":"EC", "crv":"P-256", "x":"f83OJ3D2xF1Bg8vub9tLe1gHMzV76e8Tus9uPHvRVEU", "y":"x_FEzRu9m36HLN_tue659LNpXW6pCyStikYjKIWI5a0", "kid":"jwk" }'

const test = baseTest()

test.describe('key-set keys tab', () => {
  test.beforeAll(async () => {
    await clearKongResources('/key-sets')
    await clearKongResources('/keys')
    await createKongResource('/key-sets', {
      name: mockName,
    })
  })

  test.beforeEach(async ({ page }) => {
    await new KeySetListPage(page).goto()
  })

  test.afterAll(async () => {
    await clearKongResources('/keys')
    await clearKongResources('/key-sets')
  })

  test(`create key "${mockJwName}" from the Keys tab `, async ({ page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await switchDetailTab(page, 'keys')
    await withNavigation(page, () => page.locator('.k-empty-state-cta [data-testid="new-key"]').click())

    withNavigation(page, () => fillEntityForm({
      page,
      formData: {
        'key-form-name': mockJwName,
        'key-form-id': mockJwKid,
        'key-format-container': 'jwk',
        'key-form-jwk': mockJwk,
      },
      method: 'fill',
      withAction: 'submit',
    }))

    await waitAndDismissToasts(page)

    await expect(page.locator('.k-table [data-testid="name"]')).toContainText(mockJwName)
    await expect(page.locator('.k-table tbody tr')).toHaveCount(1)
  })

  test('view keys detail page', async ({ page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await switchDetailTab(page, 'keys')

    await withNavigation(page, () => clickEntityListAction(page, 'view'))

    await expect(page.locator('.page-header .title')).toHaveText(`Key: ${mockJwName}`)
    await expect(page.locator('[data-testid="name-plain-text"]')).toHaveText(mockJwName)
  })

  test('delete a keys from the key-sets', async ({ page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await switchDetailTab(page, 'keys')
    await clickEntityListAction(page, 'delete')
    await expect(page.locator('.kong-ui-entity-delete-modal .k-modal-dialog')).toBeVisible()
    await page.locator('.kong-ui-entity-delete-modal .k-prompt-proceed').click()
    await waitAndDismissToasts(page)
    await expect(page.locator('.k-table-empty-state')).toBeVisible()
  })
})

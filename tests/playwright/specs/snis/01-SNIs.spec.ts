import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'
import { clearKongResources } from '@pw/commands/clearKongResources'
import { clickEntityListAction } from '@pw/commands/clickEntityListAction'
import { createKongResource } from '@pw/commands/createKongResource'
import { expectEmptyEntityList } from '@pw/commands/expectEmptyEntityList'
import { fillEntityForm } from '@pw/commands/fillEntityForm'
import { waitAndDismissToasts } from '@pw/commands/waitAndDismissToast'
import { withNavigation } from '@pw/commands/withNavigation'
import certificates from '@pw/fixtures/certificates'
import { SniListPage } from '@pw/pages/snis'

const mockSniName = 'testSni'
const mockTag = 'testTag'

const test = baseTest().extend<{
  sniListPage: SniListPage
}>({
  sniListPage: async ({ page }, use) => await use(new SniListPage(page)),
})

test.describe('snis', () => {
  let certificate: { id: string }

  test.beforeAll(async () => {
    await clearKongResources('/snis')
    await clearKongResources('/certificates')
    const res = await createKongResource('/certificates', {
      cert: certificates.san.cert,
      key: certificates.san.key,
    })

    certificate = res?.data
  })

  test.beforeEach(async ({ sniListPage }) => {
    await sniListPage.goto()
  })

  test.afterAll(async () => {
    await clearKongResources('/snis')
    await clearKongResources('/certificates')
  })

  test('sni list is empty', async ({ page }) => {
    await expectEmptyEntityList(page, 'snis', 'Configure a New SNI')
  })

  test('create an sni - fail', async ({ page }) => {
    await withNavigation(
      page,
      async () => await page.locator('.table-empty-state .primary').click(),
    )

    await expect(page.locator('[data-testid="sni-form-certificate-id"]')).toBeVisible()
    await (await page.waitForSelector('[data-testid="sni-form-certificate-id"]')).click()
    await page.locator('[data-testid="sni-form-certificate-id"]').fill(certificate.id)
    await (await page.waitForSelector(`[data-testid="select-item-${certificate.id}"]`)).click()

    await expect(page.locator('[data-testid="sni-create-form-submit"]')).toBeDisabled()
  })

  test('create an sni', async ({ page }) => {
    await withNavigation(
      page,
      async () => await page.locator('.table-empty-state .primary').click(),
    )

    await expect(page.locator('[data-testid="sni-form-certificate-id"]')).toBeVisible()
    await (await page.waitForSelector('[data-testid="sni-form-certificate-id"]')).click()
    await page.locator('[data-testid="sni-form-certificate-id"]').fill(certificate.id)
    await (await page.waitForSelector(`[data-testid="select-item-${certificate.id}"]`)).click()
    await fillEntityForm({
      page,
      formData: {
        'sni-form-name': mockSniName,
      },
      withAction: 'submit',
    })
    await waitAndDismissToasts(page)
  })

  test('submit/cancel sni editing', async ({ page }) => {
    await withNavigation(page, async () => await clickEntityListAction(page, 'edit'))
    await withNavigation(
      page,
      async () =>
        await fillEntityForm({
          page,
          formData: {
            'sni-form-tags': mockTag,
          },
          withAction: 'submit',
        }),
    )
    await expect(page.locator('.k-table-data .table-wrapper [data-testid="tags"]')).toHaveText(mockTag)

    await clickEntityListAction(page, 'edit')
    await withNavigation(
      page,
      async () =>
        await fillEntityForm({
          page,
          formData: {
            'sni-form-tags': `${mockTag}${mockTag}`,
          },
          withAction: 'cancel',
        }),
    )
    await expect(page.locator('.k-table-data .table-wrapper [data-testid="tags"]')).toHaveText(mockTag)
  })

  test('delete an sni', async ({ page }) => {
    await clickEntityListAction(page, 'delete')
    await expect(page.locator('.kong-ui-entity-delete-modal .modal-container')).toBeVisible()
    await page.locator('.modal-footer .footer-actions .danger').click()
    await expectEmptyEntityList(page, 'snis', 'Configure a New SNI')
  })
})

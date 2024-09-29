import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'
import { clearKongResources } from '@pw/commands/clearKongResources'
import { clickEntityListAction } from '@pw/commands/clickEntityListAction'
import { expectEmptyEntityList } from '@pw/commands/expectEmptyEntityList'
import { fillEntityForm } from '@pw/commands/fillEntityForm'
import { getPageHeaderAction } from '@pw/commands/getPageHeaderAction'
import { getPropertyValue } from '@pw/commands/getPropertyValue'
import { waitAndDismissToasts } from '@pw/commands/waitAndDismissToast'
import certificates from '@pw/fixtures/certificates'
import { CACertificateListPage } from '@pw/pages/ca-certificates'

const mockTag = 'testTag'

const test = baseTest()

test.describe('CA certificates', () => {
  test.use({ timezoneId: 'UTC' })

  test.beforeAll(async () => {
    await clearKongResources('/ca_certificates')
  })

  test.beforeEach(async ({ page }) => {
    await new CACertificateListPage(page).goto()
  })

  test.afterAll(async () => {
    await clearKongResources('/ca_certificates')
  })

  test('ca certificate list should be empty', async ({ page }) => {
    await expectEmptyEntityList(page, 'ca-certificates', 'Configure a New CA Certificate')
  })

  test('create a CA certificate - fail', async ({ page }) => {
    await page.getByTestId('empty-state-action').click()
    await expect(page.getByTestId('ca_certificate-create-form-submit')).toBeDisabled()
  })

  test('create a CA certificate', async ({ page }) => {
    await page.getByTestId('empty-state-action').click()
    await fillEntityForm({
      page,
      formData: {
        'ca-certificate-form-cert': certificates.ca.cert,
      },
      method: 'fill',
      withAction: 'submit',
    })
    await waitAndDismissToasts(page)
    await expect(page.locator('.kong-ui-ca-certificate-entity-config-card')).toBeVisible()
  })

  test('CA certificate list page should show correct issuer and expiry', async ({ page }) => {
    const row = page.locator('.kong-ui-entities-ca-certificates-list tbody tr').first()

    await expect(row.getByTestId('issuer')).toContainText(certificates.ca.issuer)
    await expect(row.getByTestId('expiry')).toHaveText(certificates.ca.notAfterFormattedUTC)
  })

  test('CA certificate detail page should show correct subject, issuer, SAN, expiry, and key usage', async ({ page }) => {
    await clickEntityListAction(page, 'view')
    await expect(getPropertyValue(page, 'issuer')).toHaveText(certificates.ca.issuer)
    await expect(getPropertyValue(page, 'expiry')).toHaveText(certificates.ca.notAfterFormattedUTC)
    await expect(getPropertyValue(page, 'key_usages').locator('.k-badge')).toContainText(certificates.ca.keyUsages)
  })

  test('submit/cancel ca certificate editing - from list page', async ({ page }) => {
    await clickEntityListAction(page, 'edit')
    await fillEntityForm({
      page,
      formData: {
        'ca-certificate-form-tags': mockTag,
      },
      method: 'fill',
      withAction: 'submit',
    })
    await waitAndDismissToasts(page)
    await expect(getPropertyValue(page, 'tags')).toHaveText(mockTag)

    await new CACertificateListPage(page).goto()
    await clickEntityListAction(page, 'edit')
    await fillEntityForm({
      page,
      formData: {
        'ca-certificate-form-tags': 'something',
      },
      method: 'fill',
      withAction: 'cancel',
    })
    await expect(page.locator('tr td[data-testid="tags"] .k-badge')).toHaveText(mockTag)
  })

  test('submit/cancel ca certificate editing - from detail page', async ({ page }) => {
    await clickEntityListAction(page, 'view')
    await getPageHeaderAction(page, 'edit').click()
    await fillEntityForm({
      page,
      formData: {
        'ca-certificate-form-tags': 'foo',
      },
      method: 'fill',
      withAction: 'submit',
    })
    await waitAndDismissToasts(page)
    await expect(getPropertyValue(page, 'tags')).toHaveText('foo')

    await getPageHeaderAction(page, 'edit').click()
    await fillEntityForm({
      page,
      formData: {
        'ca-certificate-form-tags': 'bar',
      },
      method: 'fill',
      withAction: 'cancel',
    })
    await expect(getPropertyValue(page, 'tags')).toHaveText('foo')
  })

  test('delete a ca certificate', async ({ page }) => {
    await clickEntityListAction(page, 'delete')
    await expect(page.locator('.kong-ui-entity-delete-modal .modal-container')).toBeVisible()
    await page.locator('.kong-ui-entity-delete-modal [data-testid="modal-action-button"]').click()
    await waitAndDismissToasts(page)
  })
})

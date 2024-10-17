import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'
import { clearKongResources } from '@pw/commands/clearKongResources'
import { clickEntityListAction } from '@pw/commands/clickEntityListAction'
import { getPageHeaderAction } from '@pw/commands/getPageHeaderAction'
import { expectEmptyEntityList } from '@pw/commands/expectEmptyEntityList'
import { fillEntityForm } from '@pw/commands/fillEntityForm'
import { getPropertyValue } from '@pw/commands/getPropertyValue'
import { waitAndDismissToasts } from '@pw/commands/waitAndDismissToast'
import certificates from '@pw/fixtures/certificates'
import { CertificateListPage } from '@pw/pages/certificates'

const mockTag = 'testTag'

const test = baseTest()

test.describe('certificates', () => {
  test.use({ timezoneId: 'UTC' })

  test.beforeAll(async () => {
    await clearKongResources('/certificates')
  })

  test.beforeEach(async ({ page }) => {
    await new CertificateListPage(page).goto()
  })

  test.afterAll(async () => {
    await clearKongResources('/certificates')
  })

  test('certificate list should be empty', async ({ page }) => {
    await expectEmptyEntityList(page, 'certificates', 'Configure a New Certificate')
  })

  test('create a certificate - fail', async ({ page }) => {
    await page.getByTestId('empty-state-action').click()
    await page.waitForSelector('.k-breadcrumbs', { state: 'hidden' })
    await expect(page.getByTestId('certificate-create-form-submit')).toBeDisabled()
  })

  test('create a certificate', async ({ page }) => {
    await page.getByTestId('empty-state-action').click()
    await page.waitForSelector('.k-breadcrumbs', { state: 'hidden' })
    await fillEntityForm({
      page,
      formData: {
        'certificate-form-cert': certificates.legacy.cert,
        'certificate-form-key': certificates.legacy.key,
      },
      method: 'fill',
      withAction: 'submit',
    })
    await waitAndDismissToasts(page)
    await expect(page.locator('.kong-ui-certificate-entity-config-card')).toBeVisible()
  })

  test('submit/cancel certificate editing - from list page', async ({ page }) => {
    await clickEntityListAction(page, 'edit')
    await fillEntityForm({
      page,
      formData: {
        'certificate-form-tags': mockTag,
      },
      method: 'fill',
      withAction: 'submit',
    })
    await waitAndDismissToasts(page)
    await expect(getPropertyValue(page, 'tags')).toHaveText(mockTag)

    await new CertificateListPage(page).goto()
    await clickEntityListAction(page, 'edit')
    await fillEntityForm({
      page,
      formData: {
        'certificate-form-tags': 'something',
      },
      method: 'fill',
      withAction: 'cancel',
    })
    await expect(page.locator('tr td[data-testid="tags"] .k-badge')).toHaveText(mockTag)
  })

  test('submit/cancel certificate editing - from detail page', async ({ page }) => {
    await clickEntityListAction(page, 'view')
    await getPageHeaderAction(page, 'edit').click()
    await fillEntityForm({
      page,
      formData: {
        'certificate-form-tags': 'foo',
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
        'certificate-form-tags': 'bar',
      },
      method: 'fill',
      withAction: 'cancel',
    })
    await expect(getPropertyValue(page, 'tags')).toHaveText('foo')
  })

  test('delete a certificate', async ({ page }) => {
    await clickEntityListAction(page, 'delete')
    await expect(page.locator('.kong-ui-entity-delete-modal .modal-container')).toBeVisible()
    await page.locator('.kong-ui-entity-delete-modal [data-testid="modal-action-button"]').click()
    await waitAndDismissToasts(page)
  })

  test('create a certificate with subject alternative name (SAN) extension', async ({ page }) => {
    await page.getByTestId('empty-state-action').click()
    await fillEntityForm({
      page,
      formData: {
        'certificate-form-cert': certificates.san.cert,
        'certificate-form-key': certificates.san.key,
      },
      method: 'fill',
      withAction: 'submit',
    })
    await waitAndDismissToasts(page)
  })

  test('list page should show correct subject, SAN, and expiry', async ({ page }) => {
    const row = page.locator('.kong-ui-entities-certificates-list tbody tr').first()

    await expect(row.getByTestId('subject')).toContainText(certificates.san.subject)
    await expect(row.getByTestId('expiry')).toHaveText(certificates.san.notAfterFormattedUTC)
    await expect(row.getByTestId('san')).toHaveText(certificates.san.subjectAltNameFormatted)
  })

  test('detail page should show correct subject, issuer, SAN, expiry, and key usage', async ({ page }) => {
    await clickEntityListAction(page, 'view')
    await expect(getPropertyValue(page, 'subject')).toHaveText(certificates.san.subject)
    await expect(getPropertyValue(page, 'issuer')).toHaveText(certificates.san.issuer)
    await expect(getPropertyValue(page, 'san_names')).toHaveText(certificates.san.subjectAltNameFormatted)
    await expect(getPropertyValue(page, 'expiry')).toHaveText(certificates.san.notAfterFormattedUTC)
    await expect(getPropertyValue(page, 'key_usages').locator('.k-badge')).toContainText(certificates.san.keyUsages)
  })
})

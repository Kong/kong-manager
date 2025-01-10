import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'
import { autocompleteDeleteModal } from '@pw/commands/autocompleteDeleteModal'
import { clearKongResources } from '@pw/commands/clearKongResources'
import { clickHeaderAction } from '@pw/commands/clickHeaderAction'
import { clickEntityListAction } from '@pw/commands/clickEntityListAction'
import { createKongResource } from '@pw/commands/createKongResource'
import { deleteKongResource } from '@pw/commands/deleteKongResource'
import { expectEmptyEntityList } from '@pw/commands/expectEmptyEntityList'
import { fillEntityForm } from '@pw/commands/fillEntityForm'
import { waitAndDismissToasts } from '@pw/commands/waitAndDismissToast'
import { withNavigation } from '@pw/commands/withNavigation'
import certificates from '@pw/fixtures/certificates'
import { ServiceListPage } from '@pw/pages/services'

const testService: { id?: string, name: string, url: string } = {
  name: 'testService',
  url: 'http://example.com:8080/test',
}

const test = baseTest().extend<{
  serviceListPage: ServiceListPage
}>({
  serviceListPage: async ({ page }, use) => await use(new ServiceListPage(page)),
})

test.describe('services', () => {
  test.beforeAll(async () => {
    await clearKongResources('/routes')
    await clearKongResources('/plugins')
    await clearKongResources('/services')
  })

  test.beforeEach(async ({ serviceListPage }) => {
    await serviceListPage.goto()
  })

  test.afterAll(async () => {
    await clearKongResources('/routes')
    await clearKongResources('/plugins')
    await clearKongResources('/services')
  })

  test('service list should be empty', async ({ page }) => {
    await expectEmptyEntityList(page, 'gateway-services', 'Configure a New Gateway Service')
  })

  test('service create - cancel button', async ({ page }) => {
    await withNavigation(page, () =>
      page.locator('.table-empty-state .primary').click(),
    )
    await page.getByTestId('service-create-form-cancel').click()
    await expectEmptyEntityList(page, 'gateway-services', 'Configure a New Gateway Service')
  })

  test('service create - fail with required field', async ({ page }) => {
    await withNavigation(page, () =>
      page.locator('.table-empty-state .primary').click(),
    )
    await fillEntityForm({
      page,
      formData: { 'gateway-service-name-input': 'mockbin.service' },
    })
    await expect(page.getByTestId('service-create-form-submit')).toBeDisabled()
  })

  test('service create - successful create', async ({ page }) => {
    await withNavigation(page, () =>
      page.locator('.table-empty-state .primary').click(),
    )
    await withNavigation(page, () =>
      fillEntityForm({
        page,
        formData: {
          'gateway-service-name-input': testService.name,
          'gateway-service-url-input': testService.url,
        },
        withAction: 'submit',
      }),
    )
    await waitAndDismissToasts(page)
    await page.waitForSelector('.kong-ui-gateway-service-entity-config-card')
  })

  test('status badge in list item should work', async ({ page }) => {
    const row = page.locator('.kong-ui-entities-gateway-services-list tr')
    const statusBadge = row.locator('[data-testid="enabled"] .content-wrapper .k-input-switch')
    const statusInput = row.locator('input')

    await expect(statusInput).toBeChecked()
    await statusBadge.locator('.switch-control').click()

    await page
      .locator('.modal-container')
      .locator('.k-button[data-testid="modal-action-button"]').click()

    await expect(statusInput).not.toBeChecked()

    // reset service status to 'enabled'
    await statusBadge.locator('.switch-control').click()

    await page
      .locator('.modal-container')
      .locator('.k-button[data-testid="modal-action-button"]').click()
  })

  test('back button on the detail page should bring the user back to the list page', async ({ page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await withNavigation(page, () =>
      page
        .locator('.page-header')
        .locator('[type="button"]:has-text("Back")')
        .click(),
    )
    await page.waitForSelector('.kong-ui-entities-gateway-services-list')
  })

  test('copy id action in list actions should work', async ({ browserName, page, serviceListPage }) => {
    await clearKongResources('/services')
    await page.waitForTimeout(5000)
    const res = await createKongResource('/services', testService)

    await serviceListPage.goto()

    await clickEntityListAction(page, 'copy-id')

    await waitAndDismissToasts(page)

    if (browserName !== 'webkit') {
      const copiedData = await page.evaluate(() => navigator.clipboard.readText())

      expect(copiedData).toEqual(res?.data.id)
    }
  })

  test('service create - fail with duplicate name', async ({ page }) => {
    await withNavigation(page, () =>
      page.locator('.toolbar-button-container .primary').click(),
    )
    await fillEntityForm({
      page,
      formData: {
        'gateway-service-name-input': 'testService',
        'gateway-service-url-input': 'http://example.com:8080/test',
      },
      withAction: 'submit',
    })

    await expect(page.getByTestId('form-error')).toBeVisible()
    await expect(page.getByTestId('form-error')).toHaveText('UNIQUE violation detected on \'{name="testService"}\'')
  })

  test('service create - fail & fix with invalid info', async ({ page }) => {
    await withNavigation(page, () =>
      page.locator('.toolbar-button-container .primary').click(),
    )
    await fillEntityForm({
      page,
      formData: {
        'gateway-service-name-input': 'wrong.service',
        'gateway-service-url-input': 'wrongurl.com',
      },
      withAction: 'submit',
    })

    await expect(page.getByTestId('form-error')).toBeVisible()
    // Error message differs in different browsers
    await expect(page.getByTestId('form-error')).toHaveText(/(.*\bURL\b.*)/gi)

    await withNavigation(page, () =>
      fillEntityForm({
        page,
        formData: {
          'gateway-service-name-input': 'fixed.service',
          'gateway-service-url-input': 'http://fixedurl.com',
        },
        withAction: 'submit',
      }),
    )
    await waitAndDismissToasts(page)
    await deleteKongResource('/services', 'fixed.service')
  })

  test('service create - success without name set', async ({ page }) => {
    await withNavigation(page, () =>
      page.locator('.toolbar-button-container .primary').click(),
    )
    await withNavigation(page, () =>
      fillEntityForm({
        page,
        formData: {
          'gateway-service-url-input': 'http://mockbin.org:80',
        },
        withAction: 'submit',
      }),
    )
    const serviceId = (await page
      .locator('[data-testid="id-property-value"]')
      .locator('.copy-container')
      .textContent() ?? '').trim()

    await waitAndDismissToasts(page)
    await deleteKongResource('/services', serviceId)
  })

  test('service create - fail with illegal optional field', async ({ page }) => {
    await withNavigation(page, () =>
      page.locator('.toolbar-button-container .primary').click(),
    )

    await expect(page.getByTestId('collapse-trigger-content')).toBeVisible()
    await page.getByTestId('collapse-trigger-content').click()

    await fillEntityForm({
      page,
      formData: {
        'gateway-service-url-input': 'http://mockbin.org:80',
        'gateway-service-connTimeout-input': '',
      },
      method: 'fill',
      withAction: 'submit',
    })

    await expect(page.getByTestId('form-error')).toBeVisible()
    await expect(page.getByTestId('form-error')).toHaveText('schema violation (connect_timeout: value should be between 1 and 2147483646)')
  })

  const protocols = ['grpc', 'grpcs', 'http', 'tcp', 'tls']

  for (const protocol of protocols) {
    test(`service create - successful with current selected radio group (${protocol})`, async ({ page }) => {
      await withNavigation(page, () =>
        page.locator('.toolbar-button-container .primary').click(),
      )
      const data = {
        'gateway-service-name-input': `test_protocol_${protocol}`,
        'gateway-service-host-input': `www.test_protocal_${protocol}.com`,
        'gateway-service-port-input': '80',
        ...!['grpc', 'grpcs', 'tcp', 'tls'].includes(protocol)
          ? { 'gateway-service-path-input': '/' }
          : null,
      }

      await page.getByTestId('gateway-service-protocol-radio').click()
      await page.getByTestId('gateway-service-protocol-select').click({ force: true })
      await page.locator(`.select-item[data-testid="select-item-${protocol}"]`).click()
      if (['grpc', 'grpcs', 'tcp', 'tls'].includes(protocol)) {
        await expect(page.getByTestId('gateway-service-path-input')).not.toBeVisible()
      }

      await withNavigation(page, () =>
        fillEntityForm({
          page,
          formData: data,
          withAction: 'submit',
        }),
      )
      const serviceId = (await page
        .locator('[data-testid="id-property-value"]')
        .locator('.copy-container')
        .textContent() ?? '').trim()

      await waitAndDismissToasts(page)
      await deleteKongResource('/services', serviceId)
    })
  }

  test('service create with CA certificates and TLS verify', async ({ page, serviceListPage }) => {
    await clearKongResources('/services')
    await clearKongResources('/ca_certificates')

    const certificate = await createKongResource('/ca_certificates', { cert: certificates.ca.cert })

    await serviceListPage.goto()
    await withNavigation(page, () =>
      page.locator('.table-empty-state .primary').click(),
    )

    await page.getByTestId('collapse-trigger-content').click()

    await withNavigation(page, () => fillEntityForm({
      page,
      formData: {
        'gateway-service-name-input': 'testService',
        'gateway-service-url-input': 'https://mockbin.org:80',
        'gateway-service-ca-certs-input': `${certificate?.data.id}`,
      },
      withAction: 'submit',
    }))

    await expect(page.locator('[data-testid="ca_certificates-property-value"]')).toContainText(certificate?.data.id)
    await expect(page.locator('[data-testid="tls_verify-property-value"]')).toHaveText('Use default system setting')

    await withNavigation(page, () => clickHeaderAction(page, 'edit'))
    await page.getByTestId('collapse-trigger-content').click()

    await expect(page.getByTestId('gateway-service-tls-verify-checkbox')).not.toBeChecked()
    await page.getByTestId('gateway-service-tls-verify-checkbox').click()
    await page.getByTestId('gateway-service-tls-verify-false-option').click()
    await withNavigation(page, () => page.getByTestId('service-edit-form-submit').click())
    await expect(page.locator('[data-testid="tls_verify-property-value"]')).toHaveText('Off')
    await waitAndDismissToasts(page)

    await withNavigation(page, () => clickHeaderAction(page, 'edit'))
    await page.getByTestId('collapse-trigger-content').click()

    await expect(page.getByTestId('gateway-service-tls-verify-false-option')).toBeChecked()
    await page.getByTestId('gateway-service-tls-verify-true-option').click()
    await withNavigation(page, () => page.getByTestId('service-edit-form-submit').click())
    await expect(page.locator('[data-testid="tls_verify-property-value"]')).toHaveText('On')
    await waitAndDismissToasts(page)

    await withNavigation(page, () => clickHeaderAction(page, 'edit'))
    await page.getByTestId('collapse-trigger-content').click()

    await expect(page.getByTestId('gateway-service-tls-verify-true-option')).toBeChecked()
  })

  test('service create - success without client_certificate', async ({ page, serviceListPage }) => {
    const certificate = (await createKongResource('/certificates', {
      cert: certificates.legacy.cert,
      key: certificates.legacy.key,
    }))?.data

    await serviceListPage.goto()
    await withNavigation(page, () =>
      page.locator('.toolbar-button-container .primary').click(),
    )

    await page.getByTestId('collapse-trigger-content').click()

    await withNavigation(page, () =>
      fillEntityForm({
        page,
        formData: {
          'gateway-service-name-input': 'certificate.service',
          'gateway-service-url-input': 'https://mockbin.org:80',
          'gateway-service-clientCert-input': certificate.id,
        },
        withAction: 'submit',
      }),
    )
    const serviceId = (await page
      .locator('[data-testid="id-property-value"]')
      .locator('.copy-container')
      .textContent() ?? '').trim()

    await waitAndDismissToasts(page)
    await deleteKongResource('/services', serviceId)
  })

  test('service edit - fail due to empty required field', async ({ page, serviceListPage }) => {
    await clearKongResources('/services')
    const service = (await createKongResource('/services', testService))?.data

    await serviceListPage.goto()
    await withNavigation(page, () => clickEntityListAction(page, 'edit'))

    await page.getByTestId('gateway-service-host-input').fill('')
    await fillEntityForm({
      page,
      formData: {},
      withAction: 'submit',
    })
    await expect(page.locator('.k-alert.success')).not.toBeVisible()
    await deleteKongResource('/services', service.id)
  })

  test('service edit - successful, redirects to show page if edited from there', async ({ page, serviceListPage }) => {
    const service = (await createKongResource('/services', testService))?.data

    await serviceListPage.goto()
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await withNavigation(page, () => clickHeaderAction(page, 'edit'))

    await withNavigation(page, () =>
      fillEntityForm({
        page,
        formData: {
          'gateway-service-tags-input': 'tag1,tag2,tag3',
        },
        withAction: 'submit',
      }),
    )
    await expect(page.locator('[data-testid="tags-badge-tags"] .badge-content-wrapper')).toHaveText(['tag1', 'tag2', 'tag3'])

    // update the tag
    await withNavigation(page, () => clickHeaderAction(page, 'edit'))
    await withNavigation(page, () =>
      fillEntityForm({
        page,
        formData: {
          'gateway-service-tags-input': 'tag11,tag12,tag13',
        },
        method: 'fill',
        withAction: 'submit',
      }),
    )
    await expect(page.locator('[data-testid="tags-badge-tags"] .badge-content-wrapper')).toHaveText(['tag11', 'tag12', 'tag13'])

    await deleteKongResource('/services', service.id)
  })

  test('service edit - no url field', async ({ page, serviceListPage }) => {
    const service = (await createKongResource('/services', testService))?.data

    await serviceListPage.goto()
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await withNavigation(page, () => clickHeaderAction(page, 'edit'))

    await expect(page.getByTestId('gateway-service-url-input')).not.toBeVisible()
    await deleteKongResource('/services', service.id)
  })

  test('service delete - fails with a route', async ({ page, serviceListPage }) => {
    const service = (await createKongResource('/services', testService))?.data

    await createKongResource('/routes', {
      service: { id: service.id },
      paths: ['/'],
    })

    await serviceListPage.goto()
    await clickEntityListAction(page, 'delete')
    await autocompleteDeleteModal(page)
    await expect(page.locator('.k-alert.danger')).toBeVisible()
    await deleteKongResource('/services', service.id)
  })
})

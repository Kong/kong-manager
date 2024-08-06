import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'
import { autocompleteDeleteModal } from '@pw/commands/autocompleteDeleteModal'
import { clearKongResources } from '@pw/commands/clearKongResources'
import { clickEntityListAction } from '@pw/commands/clickEntityListAction'
import { createKongResource } from '@pw/commands/createKongResource'
import { expectEmptyEntityList } from '@pw/commands/expectEmptyEntityList'
import { fillEntityForm } from '@pw/commands/fillEntityForm'
import { selectOption } from '@pw/commands/selectOption'
import { switchDetailTab } from '@pw/commands/switchDetailTab'
import { waitAndDismissToasts } from '@pw/commands/waitAndDismissToast'
import { withNavigation } from '@pw/commands/withNavigation'
import { getPropertyValue } from '@pw/commands/getPropertyValue'
import certificates from '@pw/fixtures/certificates'
import { UpstreamListPage } from '@pw/pages/upstreams'

const mockTag = 'testTag'

const test = baseTest().extend<{
  upstreamListPage: UpstreamListPage
}>({
  upstreamListPage: async ({ page }, use) => await use(new UpstreamListPage(page)),
})

const upstream_host1 = 'example1.com'
const upstream_host2 = 'example2.com'
const hash_ons = [
  { type: 'consumer', name: 'consumer', fill: false },
  { type: 'path', name: 'path', fill: false },
  { type: 'ip', name: 'ip', fill: false },
  { type: 'query_arg', name: 'query-argument', fill: true },
  { type: 'uri_capture', name: 'uri-capture', fill: true },
  { type: 'header', name: 'header', testid: 'hash-on-header', fill: true },
]
const hash_fallbacks = [
  { type: 'consumer', name: 'consumer', fill: false },
  { type: 'path', name: 'path', fill: false },
  { type: 'ip', name: 'ip', fill: false },
  { type: 'query_arg', name: 'query-argument', testid: 'hash-fallback-query-argument', fill: true },
  { type: 'uri_capture', name: 'uri-capture', testid: 'hash-fallback-uri-capture', fill: true },
  { type: 'header', name: 'header', testid: 'hash-fallback-header', fill: true },
  { type: 'cookie', name: 'cookie', testid: 'hash-on-cookie', fill: true },
]

const check_types = [
  { protocol: 'http', ssl: false },
  { protocol: 'https', ssl: true },
  { protocol: 'grpc', ssl: false },
  { protocol: 'grpcs', ssl: true },
]

let service_host1: { id: string }, service_host2: { id: string }

test.describe('upstreams', () => {
  test.beforeAll(async () => {
    await clearKongResources('/upstreams')
    await clearKongResources('/routes')
    await clearKongResources('/services')
    service_host1 = (await createKongResource('/services', {
      name: 'testService1',
      url: `http://${upstream_host1}:8080/test`,
    }))?.data

    service_host2 = (await createKongResource('/services', {
      name: 'testService2',
      url: `http://${upstream_host2}:8080/test`,
    }))?.data
  })

  test.beforeEach(async ({ upstreamListPage }) => {
    await upstreamListPage.goto()
  })

  test.afterAll(async () => {
    await clearKongResources('/upstreams')
    await clearKongResources('/services')
  })

  test('upstream list is empty', async ({ page }) => {
    await expectEmptyEntityList(page, 'upstreams', 'Configure a New Upstream')
  })

  test('create an upstream', async ({ page }) => {
    await withNavigation(
      page,
      async () => await page.locator('.kong-ui-entities-upstreams-list .table-empty-state .primary').click(),
    )

    await selectOption(page.locator('.k-select.name-select'), service_host1.id)
    // hash-fallback is disabled when hash-on is none
    await selectOption(page.locator('.k-select.hash-on-select'), 'none')
    await expect(page.locator('.k-select.hash-fallback-select [data-testid="select-input"]')).toBeDisabled()
    await fillEntityForm({
      page,
      formData: {},
      withAction: 'submit',
    })
    await waitAndDismissToasts(page)
  })

  test('upstream create - failure with the same upstream host', async ({ page }) => {
    await withNavigation(
      page,
      async () => await page.getByTestId('toolbar-add-upstream').click(),
    )

    await selectOption(page.locator('.k-select.name-select'), service_host1.id)

    await fillEntityForm({
      page,
      formData: {},
      withAction: 'submit',
    })

    await expect(page.locator('.alert-content')).toBeVisible()
    await expect(page.locator('.alert-content')).toHaveText(`UNIQUE violation detected on '{name="${upstream_host1}"}'`)
  })

  test('view upstream detail page', async ({ page }) => {
    await withNavigation(page, async () => await clickEntityListAction(page, 'view'))
    await expect(page.locator('.page-header .title')).toHaveText(`Upstream: ${upstream_host1}`)

    // switch targets tab
    await switchDetailTab(page, 'targets')
    await expect(page.locator('.kong-ui-entities-targets-list .table-empty-state .primary')).toBeVisible()
    await expect(page.locator('.kong-ui-entities-targets-list .table-empty-state .empty-state-title')).toHaveText('Configure a New Target')
  })

  test('submit/cancel upstream editing', async ({ page }) => {
    await withNavigation(page, async () => await clickEntityListAction(page, 'edit'))
    await withNavigation(
      page,
      async () =>
        await fillEntityForm({
          page,
          formData: {
            'upstreams-form-tags': mockTag,
          },
          withAction: 'submit',
        }),
    )
    await expect(page.locator('.k-table .table-wrapper [data-testid="tags"]')).toHaveText(mockTag)

    await clickEntityListAction(page, 'edit')
    await withNavigation(
      page,
      async () =>
        await fillEntityForm({
          page,
          formData: {
            'upstreams-form-tags': `${mockTag}${mockTag}`,
          },
          withAction: 'cancel',
        }),
    )
    await expect(page.locator('.k-table .table-wrapper [data-testid="tags"]')).toHaveText(mockTag)
  })

  test('delete an upstream', async ({ page }) => {
    await clickEntityListAction(page, 'delete')
    await expect(page.locator('.kong-ui-entity-delete-modal .modal-container')).toBeVisible()
    await autocompleteDeleteModal(page)
    await waitAndDismissToasts(page)
  })

  test('create upstream with a client_certificate', async ({ page }) => {
    const certificate = (await createKongResource('/certificates', {
      cert: certificates.legacy.cert,
      key: certificates.legacy.key,
    }))?.data

    await withNavigation(
      page,
      async () => await page.locator('.kong-ui-entities-upstreams-list .table-empty-state .primary').click(),
    )

    await selectOption(page.locator('.k-select.name-select'), service_host1.id)
    await selectOption(page.locator('.k-select.certificate-select'), certificate.id)
    await fillEntityForm({
      page,
      formData: {},
      withAction: 'submit',
    })
    await waitAndDismissToasts(page)
  })

  test('copy id action in list actions should work', async ({ browserName, page, upstreamListPage }) => {
    await clearKongResources('/upstreams')
    const res = await createKongResource('/upstreams', {
      name: upstream_host1,
    })

    await upstreamListPage.goto()

    await clickEntityListAction(page, 'copy-id')

    await waitAndDismissToasts(page)

    if (browserName !== 'webkit') {
      const copiedData = await page.evaluate(() => navigator.clipboard.readText())

      expect(copiedData).toEqual(res?.data.id)
    }
  })


  const create_upstream = async (page, upstreamListPage, init, data, verify, is_success = true) => {
    await clearKongResources('/upstreams')
    await upstreamListPage.goto()

    await withNavigation(
      page,
      async () => await page.locator('.table-empty-state .primary').click(),
    )

    await init()

    await fillEntityForm({
      page,
      formData: data,
      withAction: 'submit',
      method: 'fill',
    })

    if (is_success) {
      await waitAndDismissToasts(page)
      await withNavigation(page, async () => await clickEntityListAction(page, 'view'))
    }

    await verify()
  }


  const update_upstream = async (page, upstreamListPage, init, data, verify, is_success = true) => {
    await upstreamListPage.goto()

    await withNavigation(page, async () => await clickEntityListAction(page, 'edit'))
    await init()

    await fillEntityForm({
      page,
      formData: data,
      withAction: 'submit',
      method: 'fill',
    })

    if (is_success) {
      await waitAndDismissToasts(page)
      await withNavigation(page, async () => await clickEntityListAction(page, 'view'))
    }

    await verify()
  }

  // hash-on is none, and then select the algorithm
  const algorithms = [
    { name: 'round-robin', expect: 'round-robin' },
    { name: 'least-connections', expect: 'least-connections' },
    { name: 'consistent-hashing', expect: 'round-robin' },
    { name: 'latency', expect: 'latency' },
  ]

  for (let index = 0, len = algorithms.length; index < len; index++) {
    const algorithm = algorithms[index]

    test(`upstream create - successful with algorithm '${algorithm.name}' when the hash_on is none`, async ({ page, upstreamListPage }) => {
      await create_upstream(
        page, upstreamListPage,
        async () => {
          await selectOption(page.locator('.k-select.name-select'), service_host2.id)
          await selectOption(page.locator('.k-select.algorithm-select'), algorithm.name)
        },
        {},
        async () => {
          await expect(getPropertyValue(page, 'name')).toHaveText(upstream_host2)
          await expect(getPropertyValue(page, 'algorithm')).toHaveText(algorithm.expect)
        },
      )
    })
  }

  // hash-on is not none, and then select the algorithm
  const algorithm_with_hashons = [
    { name: 'round-robin', expect: 'consistent-hashing', hash: true },
    { name: 'least-connections', expect: 'least-connections', hash: false },
    { name: 'consistent-hashing', expect: 'consistent-hashing', hash: true },
    { name: 'latency', expect: 'latency', hash: false },
  ]

  for (let index = 0, len = algorithm_with_hashons.length; index < len; index++) {
    const algorithm = algorithm_with_hashons[index]

    test(`upstream create - successful with algorithm '${algorithm.name}' when the hash_on is not 'none'`, async ({ page, upstreamListPage }) => {
      await create_upstream(
        page, upstreamListPage,
        async () => {
          await selectOption(page.locator('.k-select.name-select'), service_host2.id)
          await selectOption(page.locator('.k-select.algorithm-select'), algorithm.name)
          await selectOption(page.locator('.k-select.hash-on-select'), 'ip')
        },
        {},
        async () => {
          await expect(getPropertyValue(page, 'name')).toHaveText(upstream_host2)
          await expect(getPropertyValue(page, 'algorithm')).toHaveText(algorithm.expect)
          const hash_on = algorithm.hash ? 'ip' : 'none'

          await expect(getPropertyValue(page, 'hash_on')).toHaveText(hash_on)
        },
      )
    })
  }

  for (let index = 0, len = hash_ons.length; index < len; index++) {
    const entity = hash_ons[index]

    test(`upstream create - successful with hash-on '${entity.type}'`, async ({ page, upstreamListPage }) => {
      await create_upstream(
        page, upstreamListPage,
        async () => {
          await selectOption(page.locator('.k-select.name-select'), service_host2.id)
          await selectOption(page.locator('.k-select.hash-on-select'), entity.type)
          if (entity.fill) {
            await expect(page.getByTestId(`upstreams-form-${entity.testid ? entity.testid : entity.name}`)).toBeVisible()
            await page.getByTestId(`upstreams-form-${entity.testid ? entity.testid : entity.name}`).fill(entity.type)
          }
        },
        {},
        async () => {
          await expect(getPropertyValue(page, 'name')).toHaveText(upstream_host2)
          await expect(getPropertyValue(page, 'hash_on')).toHaveText(entity.type)
          if (entity.fill) {
            await expect(getPropertyValue(page, `hash_on_${entity.type}`)).toHaveText(entity.type)
          }
        },
      )
    })
  }

  for (let index = 0, len = hash_fallbacks.length; index < len; index++) {
    const fallback = hash_fallbacks[index]

    const hashs = hash_ons.filter((item) => {
      return item.type !== fallback.type
    })

    for (let k = 0, len = hashs.length; k < len; k++) {
      const hashon = hashs[k]

      test(`upstream create - successful with hash-fallback '${fallback.type}' and hash-on '${hashon.type}'`, async ({ page, upstreamListPage }) => {
        await create_upstream(
          page, upstreamListPage,
          async () => {
            await selectOption(page.locator('.k-select.name-select'), service_host2.id)
            // set hash-on
            await selectOption(page.locator('.k-select.hash-on-select'), hashon.type)
            if (hashon.fill) {
              const testid = hashon.testid ? hashon.testid : hashon.name

              await expect(page.getByTestId(`upstreams-form-${testid}`)).toBeVisible()
              await page.getByTestId(`upstreams-form-${testid}`).fill(hashon.type)
            }

            // set hash-fallback
            await selectOption(page.locator('.k-select.hash-fallback-select'), fallback.type)
            if (fallback.fill) {
              const testid = fallback.testid ? fallback.testid : fallback.name

              await expect(page.getByTestId(`upstreams-form-${testid}`)).toBeVisible()
              await page.getByTestId(`upstreams-form-${testid}`).fill(fallback.type)
            }
          },
          {},
          async () => {
            await expect(getPropertyValue(page, 'name')).toHaveText(upstream_host2)
            // verify hash-on
            await expect(getPropertyValue(page, 'hash_on')).toHaveText(hashon.type)
            if (hashon.fill) {
              await expect(getPropertyValue(page, `hash_on_${hashon.type}`)).toHaveText(hashon.type)
            }

            // verify hash-fallback
            await expect(getPropertyValue(page, 'hash_fallback')).toHaveText(fallback.type)
            if (fallback.fill) {
              const testid = fallback.type === 'cookie' ? 'hash_on_cookie' : `hash_fallback_${fallback.type}`

              await expect(getPropertyValue(page, testid)).toHaveText(fallback.type)
            }
          },
        )
      })
    }
  }

  const full_hashs = {
    consumer: ['none', 'ip', 'header', 'cookie', 'path', 'query_arg', 'uri_capture'],
    ip: ['none', 'consumer', 'header', 'cookie', 'path', 'query_arg', 'uri_capture'],
    path: ['none', 'consumer', 'header', 'cookie', 'query_arg', 'ip', 'uri_capture'],
  }

  // set hash-fallback and hash-on with the same hash type
  for (let index = 0, len = hash_fallbacks.length; index < len; index++) {
    const fallback = hash_fallbacks[index]
    const hashon = hash_ons[index]
    // ignore cookie
    if (fallback.type === 'cookie') continue

    test(`upstream create - failure with hash-fallback '${fallback.type}' and hash-on '${fallback.type}'`, async ({ page, upstreamListPage }) => {
      await create_upstream(
        page, upstreamListPage,
        async () => {
          await selectOption(page.locator('.k-select.name-select'), service_host2.id)

          // set hash-on
          await selectOption(page.locator('.k-select.hash-on-select'), hashon.type)
          if (hashon.fill) {
            const testid = hashon.testid ? hashon.testid : hashon.name

            await expect(page.getByTestId(`upstreams-form-${testid}`)).toBeVisible()
            await page.getByTestId(`upstreams-form-${testid}`).fill(hashon.type)
          }

          // set fallback
          await selectOption(page.locator('.k-select.hash-fallback-select'), fallback.type)
          if (fallback.fill) {
            const testid = fallback.testid ? fallback.testid : fallback.name

            await expect(page.getByTestId(`upstreams-form-${testid}`)).toBeVisible()
            await page.getByTestId(`upstreams-form-${testid}`).fill(fallback.type)
          }
        },
        {},
        async () => {
          await expect(page.locator('.alert-content')).toBeVisible()

          if (fallback.fill) {
            await expect(page.locator('.alert-content')).toHaveText(`schema violation (values of these fields must be distinct: 'hash_on_${fallback.type}', 'hash_fallback_${fallback.type}')`)
          } else {
            const expect_hashs = full_hashs[fallback.type]

            await expect(page.locator('.alert-content')).toHaveText(`2 schema violations (failed conditional validation given value of field 'hash_on'; hash_fallback: expected one of: ${expect_hashs.join(', ')})`)
          }
        },
        false,
      )
    })
  }

  test(`upstream create - successful with hash-on 'cookie',hash-fallback is disabled`, async ({ page, upstreamListPage }) => {
    await create_upstream(
      page, upstreamListPage,
      async () => {
        await selectOption(page.locator('.k-select.name-select'), service_host2.id)
        // set hash-on
        await selectOption(page.locator('.k-select.hash-on-select'), 'cookie')
        await expect(page.getByTestId('upstreams-form-hash-on-cookie')).toBeVisible()
        await page.getByTestId('upstreams-form-hash-on-cookie').fill('cookie')

        await expect(page.locator('.k-select.hash-fallback-select [data-testid="select-input"]')).toBeDisabled()
      },
      {},
      async () => {
        await expect(getPropertyValue(page, 'name')).toHaveText(upstream_host2)
        // verify hash-on
        await expect(getPropertyValue(page, 'hash_on')).toHaveText('cookie')
        await expect(getPropertyValue(page, 'hash_on_cookie')).toHaveText('cookie')
        await expect(getPropertyValue(page, 'hash_on_cookie_path')).toHaveText('/')
      },
    )
  })

  test('upstream create - successful enbale/disbale active or passive health check', async ({ page, upstreamListPage }) => {
    test.slow()
    // create a new upstream
    await create_upstream(
      page, upstreamListPage,
      async () => {
        await selectOption(page.locator('.k-select.name-select'), service_host2.id)
      },
      {},
      async () => {
        await expect(getPropertyValue(page, 'name')).toHaveText(upstream_host2)
        await expect(getPropertyValue(page, 'threshold')).toHaveText('0')
        const passive = await getPropertyValue(page, 'passive').innerText()
        const active = await getPropertyValue(page, 'active').innerText()

        expect(JSON.parse(passive)).toEqual(JSON.parse('{"type": "http", "healthy": {"successes": 0, "http_statuses": [200, 201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301, 302, 303, 304, 305, 306, 307, 308]}, "unhealthy": {"http_statuses": [429, 500, 503], "tcp_failures": 0, "timeouts": 0, "http_failures": 0}}'))
        expect(JSON.parse(active)).toEqual(JSON.parse('{"concurrency": 10, "healthy": {"interval": 0, "http_statuses": [200, 302], "successes": 0}, "unhealthy": {"interval": 0, "tcp_failures": 0, "timeouts": 0, "http_failures": 0, "http_statuses": [429, 404, 500, 501, 502, 503, 504, 505]}, "headers": null, "type": "http", "https_sni": null, "https_verify_certificate": true, "http_path": "/", "timeout": 1}'))
      },
    )

    // enable active health check
    await update_upstream(
      page, upstreamListPage,
      async () => {
        await page.locator('.active-health-switch .switch-control-wrapper').click({ timeout: 10000 })
      },
      {},
      async () => {
        await expect(getPropertyValue(page, 'threshold')).toHaveText('0')
        const passive = await getPropertyValue(page, 'passive').innerText()
        const active = await getPropertyValue(page, 'active').innerText()

        expect(JSON.parse(passive)).toEqual(JSON.parse('{"type": "http", "healthy": {"successes": 0, "http_statuses": [200, 201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301, 302, 303, 304, 305, 306, 307, 308]}, "unhealthy": {"http_statuses": [429, 500, 503], "tcp_failures": 0, "timeouts": 0, "http_failures": 0}}'))
        expect(JSON.parse(active)).toEqual(JSON.parse('{"concurrency": 10, "healthy": {"interval": 5, "http_statuses": [200, 302], "successes": 5}, "unhealthy": {"interval": 5, "tcp_failures": 5, "timeouts": 0, "http_failures": 5, "http_statuses": [429, 404, 500, 501, 502, 503, 504, 505]}, "headers": {}, "type": "http", "https_sni": null, "https_verify_certificate": true, "http_path": "/", "timeout": 1}'))
      },
    )

    // enable passive health check
    await update_upstream(
      page, upstreamListPage,
      async () => {
        await page.locator('.passive-health-switch .switch-control-wrapper').click({ timeout: 10000 })
      },
      {},
      async () => {
        await expect(getPropertyValue(page, 'threshold')).toHaveText('0')
        const passive = await getPropertyValue(page, 'passive').innerText()
        const active = await getPropertyValue(page, 'active').innerText()

        expect(JSON.parse(passive)).toEqual(JSON.parse('{"type": "http", "healthy": {"successes": 80, "http_statuses": [200, 201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301, 302, 303, 304, 305, 306, 307, 308]}, "unhealthy": {"http_statuses": [429, 500, 503], "tcp_failures": 5, "timeouts": 5, "http_failures": 5}}'))
        expect(JSON.parse(active)).toEqual(JSON.parse('{"concurrency": 10, "healthy": {"interval": 5, "http_statuses": [200, 302], "successes": 5}, "unhealthy": {"interval": 5, "tcp_failures": 5, "timeouts": 0, "http_failures": 5, "http_statuses": [429, 404, 500, 501, 502, 503, 504, 505]}, "headers": {}, "type": "http", "https_sni": null, "https_verify_certificate": true, "http_path": "/", "timeout": 1}'))
      },
    )

    // disable active health check
    await update_upstream(
      page, upstreamListPage,
      async () => {
        await page.locator('.active-health-switch .switch-control-wrapper').click({ timeout: 10000 })
      },
      {},
      async () => {
        await expect(getPropertyValue(page, 'threshold')).toHaveText('0')
        const passive = await getPropertyValue(page, 'passive').innerText()
        const active = await getPropertyValue(page, 'active').innerText()

        expect(JSON.parse(passive)).toEqual(JSON.parse('{"type": "http", "healthy": {"successes": 80, "http_statuses": [200, 201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301, 302, 303, 304, 305, 306, 307, 308]}, "unhealthy": {"http_statuses": [429, 500, 503], "tcp_failures": 5, "timeouts": 5, "http_failures": 5}}'))
        expect(JSON.parse(active)).toEqual(JSON.parse('{"concurrency": 10, "healthy": {"interval": 0, "http_statuses": [200, 302], "successes": 0}, "unhealthy": {"interval": 0, "tcp_failures": 0, "timeouts": 0, "http_failures": 0, "http_statuses": [429, 404, 500, 501, 502, 503, 504, 505]}, "headers": {}, "type": "http", "https_sni": null, "https_verify_certificate": true, "http_path": "/", "timeout": 1}'))
      },
    )

    // disable passive health check
    await update_upstream(
      page, upstreamListPage,
      async () => {
        await page.locator('.passive-health-switch .switch-control-wrapper').click({ timeout: 10000 })
      },
      {},
      async () => {
        await expect(getPropertyValue(page, 'threshold')).toHaveText('0')
        const passive = await getPropertyValue(page, 'passive').innerText()
        const active = await getPropertyValue(page, 'active').innerText()

        expect(JSON.parse(passive)).toEqual(JSON.parse('{"type": "http", "healthy": {"successes": 0, "http_statuses": [200, 201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301, 302, 303, 304, 305, 306, 307, 308]}, "unhealthy": {"http_statuses": [429, 500, 503], "tcp_failures": 0, "timeouts": 0, "http_failures": 0}}'))
        expect(JSON.parse(active)).toEqual(JSON.parse('{"concurrency": 10, "healthy": {"interval": 0, "http_statuses": [200, 302], "successes": 0}, "unhealthy": {"interval": 0, "tcp_failures": 0, "timeouts": 0, "http_failures": 0, "http_statuses": [429, 404, 500, 501, 502, 503, 504, 505]}, "headers": {}, "type": "http", "https_sni": null, "https_verify_certificate": true, "http_path": "/", "timeout": 1}'))
      },
    )
  })

  const select_statuses = async (page, selector, statuses) => {
    const locator = page.locator(selector)

    // open dropdown

    await locator.locator('.multiselect-trigger').click()
    for (let index = 0, len = statuses.length; index < len; index++) {
      await locator.locator(`.multiselect-item[data-testid="multiselect-item-${statuses[index]}"]`).click()
    }

    // close dropdown
    await locator.locator('.multiselect-trigger .selection-badges-container').click({ position: { x: 1, y: 1 } })
  }

  test(`upstream update - successful updates 'health check'`, async ({ page, upstreamListPage }) => {
    test.slow()
    // create a new upstream
    await create_upstream(
      page, upstreamListPage,
      async () => {
        await selectOption(page.locator('.k-select.name-select'), service_host2.id)
        await page.locator('.active-health-switch .switch-control-wrapper').click({ timeout: 10000 })
        await page.locator('.passive-health-switch .switch-control-wrapper').click({ timeout: 10000 })
      },
      {},
      async () => {
        await expect(getPropertyValue(page, 'name')).toHaveText(upstream_host2)
        await expect(getPropertyValue(page, 'threshold')).toHaveText('0')
        const passive = await getPropertyValue(page, 'passive').innerText()
        const active = await getPropertyValue(page, 'active').innerText()

        expect(JSON.parse(passive)).toEqual(JSON.parse('{"type": "http", "healthy": {"successes": 80, "http_statuses": [200, 201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301, 302, 303, 304, 305, 306, 307, 308]}, "unhealthy": {"http_statuses": [429, 500, 503], "tcp_failures": 5, "timeouts": 5, "http_failures": 5}}'))
        expect(JSON.parse(active)).toEqual(JSON.parse('{"concurrency": 10, "healthy": {"interval": 5, "http_statuses": [200, 302], "successes": 5}, "unhealthy": {"interval": 5, "tcp_failures": 5, "timeouts": 0, "http_failures": 5, "http_statuses": [429, 404, 500, 501, 502, 503, 504, 505]}, "headers": {}, "type": "http", "https_sni": null, "https_verify_certificate": true, "http_path": "/", "timeout": 1}'))
      },
    )

    await update_upstream(
      page, upstreamListPage,
      async () => {
        // set active check headers
        await page.getByTestId('active-healthcheck-headers-header-1').fill('h1', { timeout: 10000 })
        await page.getByTestId('active-healthcheck-headers-value-1').fill('v1,v2')
        await page.getByTestId('btn-add-header').last().click()
        await expect(page.getByTestId('active-healthcheck-headers-header-2')).toBeVisible()
        // add 100,103
        await select_statuses(page, '.active-healthcheck-http-statuses', [100, 103])
        // add 100,101
        await select_statuses(page, '.active-healthcheck-unhealthy-http-statuses', [100, 101])
        // remove all status, except for 200
        await select_statuses(page, '.passive-healthcheck-http-statuses', [201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301, 302, 303, 304, 305, 306, 307, 308])
        // add 100， 101
        await select_statuses(page, '.passive-healthcheck-unhealthy-http-statuses', [100, 101])
      },
      {
        'upstreams-form-healthchecks-threshold': '1',
        'active-healthcheck-http-path': '/path',
        'active-healthcheck-timeout': '5',
        'active-healthcheck-concurrency': '15',
        'active-healthcheck-interval': '10',
        'active-healthcheck-successes': '10',
        'active-healthcheck-unhealthy-interval': '10',
        'active-healthcheck-http-failures': '10',
        'active-healthcheck-unhealthy-timeouts': '10',
        'passive-healthcheck-successes': '8',
        'passive-healthcheck-timeouts': '10',
        'passive-healthcheck-http-failures': '10',
      },
      async () => {
        await expect(getPropertyValue(page, 'threshold')).toHaveText('1')
        const passive = await getPropertyValue(page, 'passive').innerText()
        const active = await getPropertyValue(page, 'active').innerText()

        expect(JSON.parse(passive)).toEqual(JSON.parse('{ "healthy": { "successes": 8, "http_statuses": [ 200 ] }, "type": "http", "unhealthy": { "timeouts": 10, "http_failures": 10, "http_statuses": [ 429, 500, 503, 100, 101 ], "tcp_failures": 5 } }'))
        expect(JSON.parse(active)).toEqual(JSON.parse('{ "headers": { "h1": [ "v1", "v2" ] }, "http_path": "/path", "https_sni": null, "concurrency": 15, "type": "http", "https_verify_certificate": true, "healthy": { "http_statuses": [ 200, 302, 100, 103 ], "successes": 10, "interval": 10 }, "unhealthy": { "timeouts": 10, "http_failures": 10, "http_statuses": [ 404, 429, 500, 501, 502, 503, 504, 505, 100, 101 ], "interval": 10, "tcp_failures": 5 }, "timeout": 5 }'))
      },
    )
  })

  for (let index = 0, len = check_types.length; index < len; index++) {
    const check_type = check_types[index]
    const data = {}
    let verify_ssl = true

    test(`upstream update - successful with health check type is '${check_type.protocol}'`, async ({ page, upstreamListPage }) => {
      await create_upstream(
        page, upstreamListPage,
        async () => {
          await selectOption(page.locator('.k-select.name-select'), service_host2.id)
          await page.locator('.active-health-switch .switch-control-wrapper').click({ timeout: 10000 })
          await page.locator('.passive-health-switch .switch-control-wrapper').click({ timeout: 10000 })
          await selectOption(page.locator('.k-select.active-healthcheck-type-select'), check_type.protocol)

          if (check_type.ssl) {
            await expect(page.getByTestId('active-healthcheck-https-sni')).toBeVisible()
            await page.getByTestId('active-healthcheck-https-sni').fill('sni')
            verify_ssl = await page.getByTestId('active-healthcheck-verify-ssl').isChecked()
            await expect(page.getByTestId('active-healthcheck-verify-ssl')).toBeVisible()
            await page.getByTestId('active-healthcheck-verify-ssl').click()
          } else {
            await expect(page.getByTestId('active-healthcheck-http-path')).toBeVisible()
            await expect(page.getByTestId('active-healthcheck-https-sni')).toHaveCount(0)
          }
        },
        data,
        async () => {
          await expect(getPropertyValue(page, 'name')).toHaveText(upstream_host2)
          await expect(getPropertyValue(page, 'threshold')).toHaveText('0')
          const passive = await getPropertyValue(page, 'passive').innerText()
          const active = await getPropertyValue(page, 'active').innerText()
          if (check_type.ssl) {
            expect(JSON.parse(passive)).toEqual(JSON.parse('{ "healthy": { "successes": 80, "http_statuses": [ 200, 201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301, 302, 303, 304, 305, 306, 307, 308 ] }, "type": "http", "unhealthy": { "timeouts": 5, "http_failures": 5, "http_statuses": [ 429, 500, 503 ], "tcp_failures": 5 } }'))
            expect(JSON.parse(active)).toEqual(JSON.parse(`{ "headers": {}, "http_path": "/", "https_sni": "sni", "concurrency": 10, "type": "${check_type.protocol}", "https_verify_certificate": ${!verify_ssl}, "healthy": { "http_statuses": [ 200, 302 ], "successes": 5, "interval": 5 }, "unhealthy": { "timeouts": 0, "http_failures": 5, "http_statuses": [ 429, 404, 500, 501, 502, 503, 504, 505 ], "interval": 5, "tcp_failures": 5 }, "timeout": 1 }`))
          } else {
            expect(JSON.parse(passive)).toEqual(JSON.parse('{ "healthy": { "successes": 80, "http_statuses": [ 200, 201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301, 302, 303, 304, 305, 306, 307, 308 ] }, "type": "http", "unhealthy": { "timeouts": 5, "http_failures": 5, "http_statuses": [ 429, 500, 503 ], "tcp_failures": 5 } }'))
            expect(JSON.parse(active)).toEqual(JSON.parse(`{ "headers": {}, "http_path": "/", "https_sni": null, "concurrency": 10, "type": "${check_type.protocol}", "https_verify_certificate": true, "healthy": { "http_statuses": [ 200, 302 ], "successes": 5, "interval": 5 }, "unhealthy": { "timeouts": 0, "http_failures": 5, "http_statuses": [ 429, 404, 500, 501, 502, 503, 504, 505 ], "interval": 5, "tcp_failures": 5 }, "timeout": 1 }`))
          }
        },
      )
    })
  }

  test(`upstream update - successful with active and passive health check types are all 'tcp'`, async ({ page, upstreamListPage }) => {
    await create_upstream(
      page, upstreamListPage,
      async () => {
        await selectOption(page.locator('.k-select.name-select'), service_host2.id)
        await page.locator('.active-health-switch .switch-control-wrapper').click({ timeout: 10000 })
        await page.locator('.passive-health-switch .switch-control-wrapper').click({ timeout: 10000 })
        await selectOption(page.locator('.k-select.active-healthcheck-type-select'), 'tcp')
        await selectOption(page.locator('.k-select.passive-healthcheck-type-select'), 'tcp')
        await expect(page.getByTestId('active-healthcheck-http-path')).toHaveCount(0)
      },
      {
        'active-healthcheck-tcp-failures': '6',
        'passive-healthcheck-tcp-failures': '10',
      },
      async () => {
        await expect(getPropertyValue(page, 'name')).toHaveText(upstream_host2)
        await expect(getPropertyValue(page, 'threshold')).toHaveText('0')
        const passive = await getPropertyValue(page, 'passive').innerText()
        const active = await getPropertyValue(page, 'active').innerText()

        expect(JSON.parse(passive)).toEqual(JSON.parse('{ "healthy": { "successes": 80, "http_statuses": [ 200, 201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301, 302, 303, 304, 305, 306, 307, 308 ] }, "type": "tcp", "unhealthy": { "timeouts": 5, "http_failures": 0, "http_statuses": [ 429, 500, 503 ], "tcp_failures": 10 } }'))
        expect(JSON.parse(active)).toEqual(JSON.parse('{ "headers": {}, "http_path": "/", "https_sni": null, "concurrency": 10, "type": "tcp", "https_verify_certificate": true, "healthy": { "http_statuses": [ 200, 302 ], "successes": 5, "interval": 5 }, "unhealthy": { "timeouts": 0, "http_failures": 0, "http_statuses": [ 429, 404, 500, 501, 502, 503, 504, 505 ], "interval": 5, "tcp_failures": 6 }, "timeout": 1 }'))
      },
    )
  })

  test('upstream update - display created name field', async ({ page, upstreamListPage }) => {
    const newName = 'foo'

    await create_upstream(
      page, upstreamListPage,
      async () => {
        await page.click('.k-select.name-select .k-input.select-input')
        await page.locator('.k-select.name-select input').type(newName)
        await page.getByTestId('select-add-item').click()
      },
      {},
      async () => {
        await expect(getPropertyValue(page, 'name')).toHaveText(newName)
        await page.getByTestId('header-edit-button').click()
        await expect(page.locator('.k-select.name-select input')).toHaveValue(newName)
      },
    )
  })
})

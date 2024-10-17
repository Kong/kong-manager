import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'
import { autocompleteDeleteModal } from '@pw/commands/autocompleteDeleteModal'
import { clearKongResources } from '@pw/commands/clearKongResources'
import { clickConfigurationCopy } from '@pw/commands/clickConfigurationCopy'
import { clickEntityListAction } from '@pw/commands/clickEntityListAction'
import { fillEntityForm } from '@pw/commands/fillEntityForm'
import { waitAndDismissToasts } from '@pw/commands/waitAndDismissToast'
import { switchDetailTab } from '@pw/commands/switchDetailTab'
import { withNavigation } from '@pw/commands/withNavigation'
import { ConsumerListPage } from '@pw/pages/consumers'

const mockConsumerName = 'testUser'
const mockConsumerId = 'testUserId'
const mockTag = 'testTag'

const test = baseTest()

test.describe('consumers', () => {
  test.beforeAll(async () => {
    await clearKongResources('/consumers')
    await clearKongResources('/plugins')
  })

  test.beforeEach(async ({ page }) => {
    await new ConsumerListPage(page).goto()
  })

  test.afterAll(async () => {
    await clearKongResources('/consumers')
    await clearKongResources('/plugins')
  })

  test('consumer list - empty', async ({ page }) => {
    await expect(page.locator('.k-empty-state')).toContainText('Configure a New Consumer')
  })

  test('consumer create from - entrance and exit', async ({ page }) => {
    // from create button in empty placeholder
    await withNavigation(page, () => page.click('.table-empty-state .primary'))
    await page.waitForSelector('.kong-ui-entities-consumer-form')

    // exit from cancel button
    await expect(page.locator('[data-testid="consumer-create-form-cancel"]')).toContainText('Cancel')
    await withNavigation(page, () => page.click('[data-testid="consumer-create-form-cancel"]'))
  })

  test('consumer create - save button is disabled', async ({ page }) => {
    await withNavigation(page, () => page.click('.table-empty-state .primary'))
    await page.waitForSelector('.kong-ui-entities-consumer-form')
    await expect(page.getByTestId('consumer-create-form-submit')).toBeDisabled()
  })

  test('consumer create - success', async ({ page }) => {
    await withNavigation(page, () => page.click('.table-empty-state .primary'))
    await page.waitForSelector('.kong-ui-entities-consumer-form')

    await fillEntityForm({
      page,
      formData: {
        'consumer-form-username': `${mockConsumerName}_1`,
        'consumer-form-custom-id': `${mockConsumerId}_1`,
        'consumer-form-tags': mockTag,
      },
      withAction: 'submit',
    })
    await waitAndDismissToasts(page)

    await expect(page.locator('.page-header .title')).toHaveText(`Consumer: ${mockConsumerName}_1`)
    await expect(page.locator('[data-testid="username-property-value"]')).toBeVisible()
    await expect(page.locator('[data-testid="username-plain-text"]')).toContainText(`${mockConsumerName}_1`)
  })

  test('consumer list - has one consumer', async ({ page }) => {
    await expect(page.locator('.kong-ui-entity-base-table table tbody tr')).toHaveCount(1)
  })

  test('consumer edit - use footer actions', async ({ page }) => {
    // enter edit mode then cancel
    await withNavigation(page, () => clickEntityListAction(page, 'edit'))
    await page.waitForSelector('.kong-ui-entities-consumer-form')
    await withNavigation(page, () => page.click('[data-testid="consumer-edit-form-cancel"]'))
    await page.waitForSelector('.kong-ui-entities-consumers-list')

    // enter edit mode then modify and save
    await withNavigation(page, () => clickEntityListAction(page, 'edit'))
    await page.waitForSelector('.kong-ui-entities-consumer-form')
    await fillEntityForm({
      page,
      formData: {
        'consumer-form-username': `${mockConsumerName}_1_update_1`,
      },
      method: 'fill',
      withAction: 'submit',
    })

    await waitAndDismissToasts(page)
    await page.waitForSelector('.kong-ui-consumer-entity-config-card')
  })

  test('consumer edit - remove username', async ({ page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'edit'))
    await page.waitForSelector('.kong-ui-entities-consumer-form')
    await fillEntityForm({
      page,
      formData: {
        'consumer-form-username': '',
        'consumer-form-custom-id': `${mockConsumerId}_1`,
      },
      method: 'fill',
      withAction: 'submit',
    })

    await waitAndDismissToasts(page)
    await page.waitForSelector('.kong-ui-consumer-entity-config-card')
  })

  test('consumer edit - remove custom_id', async ({ page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'edit'))
    await page.waitForSelector('.kong-ui-entities-consumer-form')
    await fillEntityForm({
      page,
      formData: {
        'consumer-form-username': `${mockConsumerName}_1_update_1`,
        'consumer-form-custom-id': '',
      },
      method: 'fill',
      withAction: 'submit',
    })

    await waitAndDismissToasts(page)
    await page.waitForSelector('.kong-ui-consumer-entity-config-card')
  })

  test('consumer detail page - render username', async ({ page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await expect(page.locator('.page-header .title')).toHaveText(`Consumer: ${mockConsumerName}_1_update_1`)
    await expect(page.locator('[data-testid="username-property-value"]')).toBeVisible()
    await expect(page.locator('[data-testid="username-plain-text"]')).toContainText(`${mockConsumerName}_1_update_1`)
  })

  test('consumer detail page - render tag', async ({ page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await expect(page.locator('[data-testid="tags-badge-tags"]')).toHaveText(['testTag'])
  })

  test('consumer detail page - copy json to clipboard', async ({ browserName, page }) => {
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await clickConfigurationCopy(page, 'consumer')

    // TODO Skip on Webkit
    if (browserName !== 'webkit') {
      const clipboard = await page.evaluate(() => navigator.clipboard.readText())
      const clipboardJSON = JSON.parse(clipboard)

      expect(clipboardJSON.username).toBe(`${mockConsumerName}_1_update_1`)
    }
  })

  test('consumer detail page - edit consumer', async ({ page }) => {
    // enter edit mode then cancel
    await withNavigation(page, () => clickEntityListAction(page, 'edit'))
    await page.waitForSelector('.kong-ui-entities-consumer-form')
    await withNavigation(page, () => page.click('[data-testid="consumer-edit-form-cancel"]'))
    await page.waitForSelector('.kong-ui-entities-consumers-list')

    // enter edit mode then modify and save
    await withNavigation(page, () => clickEntityListAction(page, 'edit'))
    await page.waitForSelector('.kong-ui-entities-consumer-form')
    await fillEntityForm({
      page,
      formData: {
        'consumer-form-username': `${mockConsumerName}_1_update_2`,
      },
      method: 'fill',
      withAction: 'submit',
    })

    await waitAndDismissToasts(page)
    await page.waitForSelector('.kong-ui-consumer-entity-config-card')
  })

  test('consumer detail page - enable key auth', async ({ page }) => {
    const consumerListPage = new ConsumerListPage(page)

    // Add the key auth plugin from the consumer show page
    await withNavigation(page, () => clickEntityListAction(page, 'view'))
    await page.waitForSelector('.kong-ui-consumer-entity-config-card')
    await switchDetailTab(page, 'credentials')
    await withNavigation(page, () => page.locator('.k-empty-state button').click())
    await withNavigation(page, () => page.locator('[data-testid="Key Authentication"]').click())
    await page.waitForSelector('#config-key_names')
    await page.click(consumerListPage.$.submitButton)
    await page.waitForSelector(consumerListPage.$.success)
    await waitAndDismissToasts(page)

    // Add an api key to the consumer from empty
    await page.click('[data-testid="empty-state-action"]')
    await page.waitForSelector('#key')
    await page.fill('#key', 'my-api-key')
    await page.click(consumerListPage.$.submitButton)
    await page.waitForSelector(consumerListPage.$.success)
    await waitAndDismissToasts(page)

    // Add key when table has data already
    const keyAuthLocator = page.locator('.credential-list-wrapper').filter({ hasText: 'Key Authentication' })

    await keyAuthLocator.locator('[data-testid="toolbar-add-credential"]').click()
    await page.waitForSelector('#key')
    await page.fill('#key', 'my-second-api-key')
    await page.click(consumerListPage.$.submitButton)
    await page.waitForSelector(consumerListPage.$.success)
    expect(await keyAuthLocator.locator('table tbody tr').count()).toBe(2)
  })

  test('consumer create - success2', async ({ page }) => {
    await withNavigation(page, () => page.click('.toolbar-container .primary'))
    await page.waitForSelector('.kong-ui-entities-consumer-form')

    await fillEntityForm({
      page,
      formData: {
        'consumer-form-username': `${mockConsumerName}_2`,
        'consumer-form-custom-id': `${mockConsumerId}_2`,
        'consumer-form-tags': mockTag,
      },
      withAction: 'submit',
    })
    await waitAndDismissToasts(page)

    await page.waitForSelector('.kong-ui-consumer-entity-config-card')
    await expect(page.locator('[data-testid="username-property-value"]')).toBeVisible()
    await expect(page.locator('[data-testid="username-plain-text"]')).toContainText(`${mockConsumerName}_2`)
    await expect(page.locator('[data-testid="custom_id-plain-text"]')).toContainText(`${mockConsumerId}_2`)
  })

  test('consumer create - success with only username', async ({ page }) => {
    await withNavigation(page, () => page.click('.toolbar-container .primary'))
    await page.waitForSelector('.kong-ui-entities-consumer-form')

    await fillEntityForm({
      page,
      formData: {
        'consumer-form-username': `${mockConsumerName}_3`,
      },
      withAction: 'submit',
    })
    await waitAndDismissToasts(page)

    await page.waitForSelector('.kong-ui-consumer-entity-config-card')
    await expect(page.locator('[data-testid="username-plain-text"]')).toContainText(`${mockConsumerName}_3`)
  })

  test('consumer create - success with only custom id', async ({ page }) => {
    await withNavigation(page, () => page.click('.toolbar-container .primary'))
    await page.waitForSelector('.kong-ui-entities-consumer-form')

    await fillEntityForm({
      page,
      formData: {
        'consumer-form-custom-id': `${mockConsumerId}_4`,
      },
      withAction: 'submit',
    })
    await waitAndDismissToasts(page)

    await page.waitForSelector('.kong-ui-consumer-entity-config-card')
    await expect(page.locator('[data-testid="custom_id-plain-text"]')).toContainText(`${mockConsumerId}_4`)
  })

  test('consumer list - has four consumers', async ({ page }) => {
    await expect(page.locator('.kong-ui-entity-base-table table tbody tr')).toHaveCount(4)
  })

  test('consumer list - search without result', async ({ page }) => {
    await page.waitForSelector('[data-testid="search-input"]')
    await page.fill('[data-testid="search-input"]', 'should-not-found')
    await page.waitForTimeout(1000)
    await expect(page.locator('.empty-state-content')).toBeVisible()
    await expect(page.locator('.empty-state-content')).toContainText('Please adjust the criteria and try again.')
  })

  test('consumer list - search with result', async ({ page }) => {
    await page.waitForSelector('[data-testid="search-input"]')
    await page.fill('[data-testid="search-input"]', `${mockConsumerName}_2`)
    await page.waitForTimeout(1000)
    await expect(page.locator('.kong-ui-entity-base-table table tbody tr')).toHaveCount(1)
    await expect(page.locator('.kong-ui-entity-base-table td:first-child', { hasText: `${mockConsumerName}_2` })).toBeVisible()
  })

  test('delete consumer - via dropdown menu in consumer list', async ({ page }) => {
    await clickEntityListAction(page, 'delete')
    await autocompleteDeleteModal(page)
    await waitAndDismissToasts(page)
    await page.waitForSelector('.kong-ui-entity-base-table')
    await expect(page.locator('.kong-ui-entity-base-table table tbody tr')).toHaveCount(3)
  })
})

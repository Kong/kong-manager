import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'
import { clearKongResources } from '@pw/commands/clearKongResources'
import { fetchKongResource } from '@pw/commands/fetchKongResource'
import { RouteCreatePage } from '@pw/pages/routes'

const test = baseTest().extend<{
  routeCreatePage: RouteCreatePage
}>({
  routeCreatePage: async ({ page }, use) => use(new RouteCreatePage(page)),
})

test.describe('route creation page', () => {
  // We assume that Gateway used to run this test group against has router_flavor = expressions
  // Otherwise, we will make it fail here ...
  test.beforeAll(async () => {
    const kongInfoRes = await fetchKongResource('')

    expect(
      kongInfoRes?.data?.configuration?.router_flavor,
      'this test group should only be performed against Gateway with router_flavor = expressions',
    ).toEqual('expressions')

    await clearKongResources('/routes')
  })

  test.beforeEach(async ({ routeCreatePage }) => {
    await routeCreatePage.goto()
  })

  test.afterAll(async () => {
    await clearKongResources('/routes')
  })

  test('tabs', async ({ page }) => {
    await page.getByTestId('form-content').isVisible()

    // tabs should be visible
    await expect(page.getByTestId('route-form-config-tabs')).toBeVisible()
    await expect(page.locator('#traditional-tab')).toBeVisible()
    await expect(page.locator('#expressions-tab')).toBeVisible()
  })

  test('submit button states', async ({ page }) => {
    await page.getByTestId('form-content').isVisible()

    // traditional tab should be active by default
    await expect(page.locator('#traditional-tab')).toHaveClass(/active/)
    // submit button should be disabled
    await expect(page.getByTestId('route-create-form-submit')).toBeDisabled()
    // fill in a path
    await page.getByTestId('route-form-paths-input-1').fill('/trad/1')
    // submit button should be enabled
    await expect(page.getByTestId('route-create-form-submit')).toBeEnabled()

    // switch to the expressions tab
    await page.locator('#expressions-tab').click()
    // submit button should be disabled again
    await expect(page.getByTestId('route-create-form-submit')).toBeDisabled()

    // switch back to the traditional tab
    await page.locator('#traditional-tab').click()
    // submit button should be enabled again
    await expect(page.getByTestId('route-create-form-submit')).toBeEnabled()

    // switch back to the expressions tab
    await page.locator('#expressions-tab').click()
    // submit button should be disabled again
    await expect(page.getByTestId('route-create-form-submit')).toBeDisabled()

    // the editor shows invalid because it is empty
    await expect(page.locator('.expression-editor')).toHaveClass(/invalid/)
    await page.waitForSelector('.monaco-editor')

    const editor = page.locator('.monaco-editor').first()

    // type a valid expression
    await editor.click()
    await page.keyboard.type('http.path == "/kong"')
    // the editor should be no longer invalid
    await expect(page.locator('.expression-editor')).not.toHaveClass(/invalid/)
    // and the submit button should be enabled
    await expect(page.getByTestId('route-create-form-submit')).toBeEnabled()

    // delete the last character
    await page.keyboard.press('Backspace')
    // the editor should be invalid again
    await expect(page.locator('.expression-editor')).toHaveClass(/invalid/)
    // but the submit button is still enabled because we let the server handle uncaught errors
    await expect(page.getByTestId('route-create-form-submit')).toBeEnabled()
  })

  test('view configuration', async ({ page }) => {
    await page.getByTestId('form-content').isVisible()

    // open the slide out
    await page.getByTestId('route-create-form-view-configuration').click()
    await page.locator('#yaml-tab').click()
    const slideOutTabs = page.getByTestId('form-view-configuration-slideout-tabs')
    const configBlock = slideOutTabs.getByTestId('k-code-block').locator('code')

    await expect(slideOutTabs).toBeVisible()
    // should not contain the expression field
    await expect(configBlock).not.toContainText(/expression:/)

    // fill in a path
    await page.getByTestId('route-form-paths-input-1').fill('/trad/1')
    // should contain the paths field
    await expect(configBlock).toContainText(/paths:/)
    // still should not contain the expression field
    await expect(configBlock).not.toContainText(/expression:/)

    // switch to the expressions tab
    await page.locator('#expressions-tab').click()
    // should not contain the paths field
    await expect(configBlock).not.toContainText(/paths:/)
    await page.waitForSelector('.monaco-editor')

    const editor = page.locator('.monaco-editor').first()

    // type a valid expression
    await editor.click()
    await page.keyboard.type('http.path == "/kong"')

    // still should not contain the paths field
    await expect(configBlock).not.toContainText(/paths:/)
    // but should contain the expression field
    await expect(configBlock).toContainText(/expression: http\.path == "\/kong"/)

    // switch back to the traditional tab
    await page.locator('#traditional-tab').click()
    // should contain the paths field
    await expect(configBlock).toContainText(/paths:/)
    await expect(configBlock).toContainText(/- \/trad\/1/)
    // should not contain the expression field
    await expect(configBlock).not.toContainText(/expression:/)

    // switch back to the expressions tab
    await page.locator('#expressions-tab').click()
    // should not contain the paths field
    await expect(configBlock).not.toContainText(/paths:/)
    // should contain the expression field
    await expect(configBlock).toContainText(/expression: http\.path == "\/kong"/)
  })

  test('create a traditional route', async ({ page }) => {
    await page.getByTestId('form-content').isVisible()

    await page.getByTestId('route-form-name').fill('trad-1')
    await page.getByTestId('route-form-paths-input-1').fill('/trad/1')
    const submit = page.getByTestId('route-create-form-submit')

    await expect(submit).toBeEnabled()
    await submit.click()

    await expect(page.getByTestId('name-property-value')).toContainText('trad-1')
    await expect(page.getByTestId('paths-property-value')).toContainText('/trad/1')
  })

  test('create an expressions route', async ({ page }) => {
    await page.getByTestId('form-content').isVisible()

    await page.getByTestId('route-form-name').fill('expr-1')

    // switch to the expressions tab
    await page.locator('#expressions-tab').click()
    await page.waitForSelector('.monaco-editor')

    const editor = page.locator('.monaco-editor').first()

    // type a valid expression
    await editor.click()
    await page.keyboard.type('http.path == "/expr/1"')

    const submit = page.getByTestId('route-create-form-submit')

    await expect(submit).toBeEnabled()
    await submit.click()

    await expect(page.getByTestId('name-property-value')).toContainText('expr-1')
    await expect(page.getByTestId('expression-property-value')).toContainText('http.path == "/expr/1"')
  })

  test('create a traditional route - also entered expressions', async ({ page }) => {
    await page.getByTestId('form-content').isVisible()

    await page.getByTestId('route-form-name').fill('trad-2')
    await page.getByTestId('route-form-paths-input-1').fill('/trad/2')

    // switch to the expressions tab
    await page.locator('#expressions-tab').click()
    await page.waitForSelector('.monaco-editor')

    const editor = page.locator('.monaco-editor').first()

    // type a valid expression
    await editor.click()
    await page.keyboard.type('http.path == "/trad/2"')

    // switch back to the traditional tab
    await page.locator('#traditional-tab').click()

    const submit = page.getByTestId('route-create-form-submit')

    await expect(submit).toBeEnabled()
    await submit.click()

    // should still create a traditional route
    await expect(page.getByTestId('name-property-value')).toContainText('trad-2')
    await expect(page.getByTestId('paths-property-value')).toContainText('/trad/2')
  })

  test('create an expressions route - also entered traditional', async ({ page }) => {
    await page.getByTestId('form-content').isVisible()

    await page.getByTestId('route-form-name').fill('expr-2')

    // switch to the expressions tab
    await page.locator('#expressions-tab').click()
    await page.waitForSelector('.monaco-editor')

    const editor = page.locator('.monaco-editor').first()

    // type a valid expression
    await editor.click()
    await page.keyboard.type('http.path == "/expr/2"')

    // switch back to the traditional tab
    await page.locator('#traditional-tab').click()

    await page.getByTestId('route-form-paths-input-1').fill('/expr/2')

    // switch to the expressions tab
    await page.locator('#expressions-tab').click()

    const submit = page.getByTestId('route-create-form-submit')

    await expect(submit).toBeEnabled()
    await submit.click()

    // should still create an expression route
    await expect(page.getByTestId('name-property-value')).toContainText('expr-2')
    await expect(page.getByTestId('expression-property-value')).toContainText('http.path == "/expr/2"')
  })

  test('create an expressions route - negative', async ({ page }) => {
    await page.getByTestId('form-content').isVisible()

    await page.getByTestId('route-form-name').fill('expr-3')

    // switch to the expressions tab
    await page.locator('#expressions-tab').click()
    await page.waitForSelector('.monaco-editor')

    const editor = page.locator('.monaco-editor').first()

    // type an invalid expression
    await editor.click()
    await page.keyboard.type('http.path == "/expr/3')

    // the editor shows invalid
    await expect(page.locator('.expression-editor')).toHaveClass(/invalid/)

    const submit = page.getByTestId('route-create-form-submit')

    // we can still submit
    await expect(submit).toBeEnabled()
    await submit.click()

    // but it will fail
    await page.getByTestId('form-error').isVisible()
  })
})

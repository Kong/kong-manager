import { expect, type Page } from '@playwright/test'
import baseTest from '@pw/base-test'

const test = baseTest()

test.describe('not found', () => {
  const expectGeneralNotFound = async (page: Page, url: string) => {
    await page.goto(url)
    await expect(page.locator('.not-found')).toBeVisible()
    await expect(page.locator('.not-found')).toContainText('404')
  }

  const expectFormNotFound = async (page: Page, url: string, expectedMessage = 'Not found') => {
    await page.goto(url)
    await expect(page.getByTestId('form-fetch-error')).toBeVisible()
    await expect(page.getByTestId('form-fetch-error').locator('.empty-state-content'))
      .toContainText(expectedMessage, { ignoreCase: true })
  }

  const expectConfigCardNotFound = async (page: Page, url: string, expectedMessage = 'Not found') => {
    await page.goto(url)
    await expect(page.locator('.k-empty-state.error')).toBeVisible()
    await expect(page.locator('.k-empty-state.error').locator('.empty-state-content'))
      .toContainText(expectedMessage, { ignoreCase: true })
  }

  test('404 renders navbar and footer', async ({ page }) => {
    await expectFormNotFound(page, '/consumers/non-existent/edit')
    await expect(page.locator('.kong-ui-app-navbar')).toBeVisible()
    await expect(page.locator('footer.make-wish-wrapper')).toBeVisible()
  })

  test('certificate edit - 404', async ({ page }) => {
    await expectFormNotFound(page, '/certificates/non-existent/edit')
  })

  test('consumer edit - 404', async ({ page }) => {
    await expectFormNotFound(page, '/consumers/non-existent/edit')
  })

  test('consumer detail - 404', async ({ page }) => {
    await expectConfigCardNotFound(page, '/consumers/non-existent')
  })

  test('plugin edit - 404', async ({ page }) => {
    await expectGeneralNotFound(page, '/plugins/non-existent/non-existent/edit')
  })

  test('plugin detail - 404', async ({ page }) => {
    await expectConfigCardNotFound(page, '/plugins/non-existent/non-existent', 'No plugin named \'non-existent\'')
  })

  test('plugins create - 404', async ({ page }) => {
    await expectGeneralNotFound(page, '/plugins/non-existent/create')
  })

  test('sni edit - 404', async ({ page }) => {
    await expectFormNotFound(page, '/snis/non-existent/edit')
  })

  test('upstream edit - 404', async ({ page }) => {
    await expectFormNotFound(page, '/upstreams/non-existent/edit')
  })
})

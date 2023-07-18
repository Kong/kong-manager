// TODO DELETE ME

import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'

const test = baseTest()

test.describe('stub', () => {
  test('main visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('kong-ui-app-layout-main')).toBeVisible()
  })
})

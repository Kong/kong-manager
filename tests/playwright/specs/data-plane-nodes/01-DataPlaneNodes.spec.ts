import { expect } from '@playwright/test'
import baseTest from '@pw/base-test'
import { DataPlaneNodesPage } from '@pw/pages/data-plane-nodes'

const test = baseTest()

test.describe('data plane nodes', () => {
  test.beforeEach(async ({ page }) => {
    await new DataPlaneNodesPage(page).goto()
  })

  test('data plane node list - has correct content', async ({ page }) => {
    const table = page.locator('.page-data-plane-nodes .k-table')

    await expect(table).toBeVisible()
    await expect(table.locator('tbody tr')).toHaveCount(3) // has 3 data planes
    const headers = [
      'selection',
      'hostname',
      'version',
      'last_seen',
      'sync_status',
      'cert_details',
      'labels',
      'actions',
    ]

    headers.forEach(async (header: string) => {
      await expect(table.getByTestId(`table-header-${header}`)).toBeVisible()
    })
  })

  test('data plane node list - selection', async ({ page }) => {
    const table = page.locator('.page-data-plane-nodes .k-table')

    await expect(table).toBeVisible()
    const globalCheckbox = table.locator('thead input[type="checkbox"]')
    const individualCheckboxes = table.locator('tbody input[type="checkbox"]')

    await individualCheckboxes.locator('nth=0').check() // check the 1st checkbox
    await expect(globalCheckbox).not.toBeChecked()
    await expect(globalCheckbox).toHaveJSProperty('indeterminate', true)

    await individualCheckboxes.locator('nth=1').check() // check the 2nd checkbox
    await expect(globalCheckbox).not.toBeChecked()
    await expect(globalCheckbox).toHaveJSProperty('indeterminate', true)

    await individualCheckboxes.locator('nth=2').check() // check the 3rd checkbox
    await expect(globalCheckbox).toBeChecked()
    await expect(globalCheckbox).toHaveJSProperty('indeterminate', false)

    await globalCheckbox.uncheck() // uncheck the global checkbox
    await expect(individualCheckboxes.locator('nth=0')).not.toBeChecked()
    await expect(individualCheckboxes.locator('nth=1')).not.toBeChecked()
    await expect(individualCheckboxes.locator('nth=2')).not.toBeChecked()
    await expect(globalCheckbox).toHaveJSProperty('indeterminate', false)

    await globalCheckbox.check() // check the global checkbox
    await expect(individualCheckboxes.locator('nth=0')).toBeChecked()
    await expect(individualCheckboxes.locator('nth=1')).toBeChecked()
    await expect(individualCheckboxes.locator('nth=2')).toBeChecked()
    await expect(globalCheckbox).toHaveJSProperty('indeterminate', false)
  })

  test('data plane node list - can change log level and revert back', async ({ page }) => {
    const table = page.locator('.page-data-plane-nodes .k-table')

    await expect(table).toBeVisible()
    const globalCheckbox = table.locator('thead input[type="checkbox"]')

    await globalCheckbox.check()
    await page.locator('.table-toolbar .dropdown-trigger').click()
    await page.locator('.table-toolbar [data-testid="dropdown-item-change-log-level"]').click()

    await expect(page.locator('.k-modal .modal-title')).toContainText('3 Nodes')
    await page.locator('.log-level-select input').click()
    await page.locator('.log-level-select [data-testid="select-item-debug"]').click() // change log level to Debug
    await page.locator('.k-modal .time input').fill('5') // revert log level after 5 seconds
    await expect(page.locator('.k-modal .data-plane-node-list')).toContainText('Notice → Debug')
    await page.locator('.k-modal [data-testid="modal-action-button"]').click() // confirm the change
    await expect(page.locator('.k-modal .k-badge.success')).toHaveCount(3) // all log level change successful
    await page.locator('.k-modal [data-testid="modal-close-icon"]').click() // close the modal

    await expect(page.locator('.node-log-level-container').getByText('Debug')).toHaveCount(3) // all nodes have log level Debug
    await page.waitForTimeout(5000) // wait for the log level revert to take effect
    await page.reload()
    await expect(page.locator('.node-log-level-container').getByText('Notice')).toHaveCount(3) // all nodes revert to Notice
  })
})

import type { Page } from '@playwright/test'
import { expandAdvancedFields } from './expandAdvancedFields'
import { selectOption } from './selectOption'

interface Params {
  page: Page

  formData?: Record<string, string | string[]>

  /**
   * The action to perform after filling in the form.
   * If omitted, no actions will be performed.
   */
  withAction?: 'submit' | 'cancel'

  method?: 'fill' | 'pressSequentially'

  /**
   * If set to true, the helper assumes that a modal will show up after performing the `*-submit` action.
   * And the primary button on the modal will be clicked.
   */
  handleModal?: boolean
}

export const fillEntityForm = async (params: Params) => {
  const {
    page,
    formData = {},
    withAction,
    method = 'fill',
    handleModal,
  } = params

  await page.waitForTimeout(1000)
  if (await page.locator('.kong-ui-entities-plugin-form').isVisible()) {
    await expandAdvancedFields(page)
  }

  for (const [key, value] of Object.entries(formData)) {
    // for select
    if (await page.locator(`[data-testid="${key}"] .k-select`).isVisible()) {
      const val = Array.isArray(value) ? value : [value]

      for (const item of val) {
        await selectOption(page.locator(`[data-testid="${key}"]`), item)
      }

      continue
    }

    // for text input
    if (typeof value === 'string') {
      await page.getByTestId(key).or(page.getByTestId(`ff-${key}`)).or(page.locator(`#${key}`))[method](value)
    }

    if (value && value.constructor === Array) {
      for (const [index, item] of value.entries()) {
        await page.locator(`[data-testid="add-${key}"]`).or(page.locator(`[data-testid="ff-add-item-btn-${key}"]`)).click()

        const itemInput = page.locator(`[data-testid="${key}-item-${index}"] input`).or(page.locator(`[data-testid="ff-${key}.${index}"]`))

        await itemInput.waitFor()
        await itemInput[method](item)
      }
    }
  }

  if (withAction === 'submit') {
    await page.getByTestId('form-actions').locator('.k-button.primary').click()
  } else if (withAction === 'cancel') {
    await page.getByTestId('form-actions').locator('.k-button.secondary').click()
  }

  if (handleModal) {
    await page.locator('.modal-container .modal-footer .k-button.primary').click()
  }
}

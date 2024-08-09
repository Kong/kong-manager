import { expect, type Locator, type Page } from '@playwright/test'
import { VAULTS } from '@pw/fixtures/vaults'
import { POM } from '.'

export class PluginListPage extends POM {
  public $ = {
    ...POM.$,
  }

  constructor (page: Page) {
    super(page, '/plugins')
  }
}

export class PluginFormPage extends POM {
  public $ = {
    ...POM.$,
  }

  constructor (page: Page, plugin: string) {
    super(page, `/plugins/${plugin}/create`)
  }

  /**
   * Get the field's form group with a given label
   *
   * @param labelFor the `for` attribute of the <label /> element of a field
   * @returns Locator
   */
  locateFormGroup (labelFor: string, searchIn?: Locator) {
    return (searchIn ?? this.page.locator('.kong-ui-entities-plugin-form'))
      .locator('.form-group')
      .filter({ has: this.page.locator(`label[for="${labelFor}"]`) })
  }

  /**
   * Wait for request to /vaults (for vault secret picker)
   *
   * @returns Promise to wait
   */
  waitForVaults () {
    return this.page.waitForRequest(
      (res) => res.method() === 'GET' && /\/vaults($|\?.*)/.test(res.url()),
    )
  }

  get vaultSecretPickerVaultSelect () {
    return this.page.getByTestId('vault-secret-picker-vault-select')
  }

  get vaultSecretPickerSecretIdSelect () {
    return this.page.getByTestId('vault-secret-picker-secret-id-select')
  }

  get vaultSecretPickerSecretIdInput () {
    return this.page.getByTestId('vault-secret-picker-secret-id-input')
  }

  get vaultSecretPickerSecretKeyInput () {
    return this.page.getByTestId('vault-secret-picker-secret-key-input')
  }

  async testVaultSecretPicker (wrapper: Locator, input?: Locator) {
    await wrapper.scrollIntoViewIfNeeded()

    // Find the vault secret picker action and open the picker
    const vspAction = wrapper.locator('.vault-secret-picker-provider')
      .locator('.vault-secret-picker-provider-action')

    // Expect request
    await Promise.all([vspAction.click(), this.waitForVaults()])

    // Find the modal
    await expect(this.page.getByTestId('vault-secret-picker-modal').locator('.modal-container'))
      .toBeVisible()

    // Select a vault (env-2)
    await this.vaultSecretPickerVaultSelect.click()
    await expect(
      this.page.getByTestId('vault-secret-picker-vault-popover')
        .locator('.select-items-container .select-item'),
    ).toHaveCount(VAULTS.length)

    await this.page.getByTestId('select-item-my-env-2').click()

    // Manually input secret ID and key
    await expect(this.vaultSecretPickerSecretIdSelect).toHaveCount(0) // not exist

    await expect(this.vaultSecretPickerSecretIdInput).toBeEnabled()
    await this.vaultSecretPickerSecretIdInput.fill('passwords')

    await expect(this.vaultSecretPickerSecretKeyInput).toBeEnabled()
    await this.vaultSecretPickerSecretKeyInput.fill('admin')

    // Proceed
    await this.page.getByTestId('modal-action-button').click()

    const inputLocator = input ?? wrapper.locator('input')

    await expect(inputLocator).toHaveValue('{vault://my-env-2/passwords/admin}')

    // Try a non-existing vault
    await inputLocator.clear()
    await inputLocator.fill('{vault://404-vault/secrets/super-secret}')

    // Open the picker
    await Promise.all([vspAction.click(), this.waitForVaults()])

    // Should not fill in any input fields
    await expect(this.vaultSecretPickerVaultSelect).toBeEnabled()
    await expect(this.vaultSecretPickerVaultSelect).toHaveValue('')

    await expect(this.vaultSecretPickerSecretIdSelect).toHaveCount(0)
    await expect(this.vaultSecretPickerSecretIdInput).toBeDisabled()
    await expect(this.vaultSecretPickerSecretIdInput).toHaveValue('')

    await expect(this.vaultSecretPickerSecretKeyInput).toBeDisabled()
    await expect(this.vaultSecretPickerSecretKeyInput).toHaveValue('')

    // Close the modal
    await this.page.getByTestId('modal-cancel-button').click()

    // Try without secret ID and key
    await inputLocator.clear()
    await inputLocator.fill('{vault://my-env-3}')

    // Open the picker
    await Promise.all([vspAction.click(), this.waitForVaults()])

    // Should only have the vault select filled
    await expect(this.vaultSecretPickerVaultSelect).toBeEnabled()
    await expect(this.vaultSecretPickerVaultSelect).toHaveValue('my-env-3')

    await expect(this.vaultSecretPickerSecretIdSelect).toHaveCount(0)
    await expect(this.vaultSecretPickerSecretIdInput).toBeEnabled()
    await expect(this.vaultSecretPickerSecretIdInput).toHaveValue('')

    await expect(this.vaultSecretPickerSecretKeyInput).toBeEnabled()
    await expect(this.vaultSecretPickerSecretKeyInput).toHaveValue('')

    // Close the modal
    await this.page.getByTestId('modal-cancel-button').click()

    // Try an invalid secret reference
    await inputLocator.clear()
    await inputLocator.fill('{vault://') // missing '}'

    // Open the picker
    await Promise.all([vspAction.click(), this.waitForVaults()])

    // Should not fill in any input fields
    await expect(this.vaultSecretPickerVaultSelect).toBeEnabled()
    await expect(this.vaultSecretPickerVaultSelect).toHaveValue('')

    await expect(this.vaultSecretPickerSecretIdSelect).toHaveCount(0)
    await expect(this.vaultSecretPickerSecretIdInput).toBeDisabled()
    await expect(this.vaultSecretPickerSecretIdInput).toHaveValue('')

    await expect(this.vaultSecretPickerSecretKeyInput).toBeDisabled()
    await expect(this.vaultSecretPickerSecretKeyInput).toHaveValue('')

    // Close the modal
    await this.page.getByTestId('modal-cancel-button').click()
  }
}

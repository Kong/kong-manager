import type { Page } from '@playwright/test'

// Page Object Model
export class POM {
  public $

  constructor (public readonly page: Page, public readonly url: string) { }

  async goto () {
    return this.page.goto(this.url)
  }
}

POM.prototype.$ = {
  success: '.k-alert.success',
  submitButton: '[data-testid="form-footer-actions"] .k-button.primary',
}

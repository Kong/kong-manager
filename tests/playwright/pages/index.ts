import type { Page } from '@playwright/test'

// Page Object Model
export class POM {
  public static $ = {
    success: '.toaster.success',
    submitButton: '[data-testid="form-actions"] .k-button.primary',
  }

  constructor(public readonly page: Page, public readonly url: string) { }

  async goto() {
    return this.page.goto(this.url)
  }
}

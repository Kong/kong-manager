import type { Page } from '@playwright/test'
import { POM } from '.'

export class VaultListPage extends POM {
  public $ = {
    ...POM.$,
  }

  constructor(page: Page) {
    super(page, '/vaults')
  }
}

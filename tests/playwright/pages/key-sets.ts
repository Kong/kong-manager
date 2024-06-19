import type { Page } from '@playwright/test'
import { POM } from '.'

export class KeySetListPage extends POM {
  public $ = {
    ...POM.$,
  }

  constructor(page: Page) {
    super(page, '/key-sets')
  }
}

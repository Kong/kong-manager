import type { Page } from '@playwright/test'
import { POM } from '.'

export class KeySetListPage extends POM {
  public $ = {
    ...super.$,
  }

  constructor (page: Page) {
    super(page, '/key-sets')
  }
}

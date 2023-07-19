import type { Page } from '@playwright/test'
import { POM } from '.'

export class KeyListPage extends POM {
  public $ = {
    ...super.$,
  }

  constructor (page: Page) {
    super(page, '/keys')
  }
}

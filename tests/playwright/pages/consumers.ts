import type { Page } from '@playwright/test'
import { POM } from '.'

export class ConsumerListPage extends POM {
  public $ = {
    ...super.$,
  }

  constructor (page: Page) {
    super(page, '/consumers')
  }
}

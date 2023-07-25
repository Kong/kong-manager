import type { Page } from '@playwright/test'
import { POM } from '.'

export class ServiceListPage extends POM {
  public $ = {
    ...super.$,
  }

  constructor (page: Page) {
    super(page, '/services')
  }
}

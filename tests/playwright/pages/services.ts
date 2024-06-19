import type { Page } from '@playwright/test'
import { POM } from '.'

export class ServiceListPage extends POM {
  public $ = {
    ...POM.$,
  }

  constructor(page: Page) {
    super(page, '/services')
  }
}

import type { Page } from '@playwright/test'
import { POM } from '.'

export class RouteListPage extends POM {
  public $ = {
    ...super.$,
  }

  constructor (page: Page) {
    super(page, '/routes')
  }
}

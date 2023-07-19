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

export class ConsumerDetailsPage extends POM {
  public $ = {
    ...super.$,
  }

  constructor (page: Page, consumerId: string, urlPath = '') {
    super(page, `/consumers/${consumerId}${urlPath}`)
  }
}

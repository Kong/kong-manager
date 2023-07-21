import type { Page } from '@playwright/test'
import { POM } from '.'

export class CACertificateListPage extends POM {
  public $ = {
    ...super.$,
  }

  constructor (page: Page) {
    super(page, '/ca-certificates')
  }
}

import type { Page } from '@playwright/test'
import { POM } from '.'

export class CertificateListPage extends POM {
  public $ = {
    ...super.$,
  }

  constructor (page: Page) {
    super(page, '/certificates')
  }
}

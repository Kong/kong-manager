import type { Page } from '@playwright/test'
import { POM } from '.'

export class CertificateListPage extends POM {
  public $ = {
    ...POM.$,
  }

  constructor(page: Page) {
    super(page, '/certificates')
  }
}

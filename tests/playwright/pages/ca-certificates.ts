import type { Page } from '@playwright/test'
import { POM } from '.'

export class CACertificateListPage extends POM {
  public $ = {
    ...POM.$,
  }

  constructor(page: Page) {
    super(page, '/ca-certificates')
  }
}

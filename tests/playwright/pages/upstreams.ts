import type { Page } from '@playwright/test'
import { POM } from '.'

export class UpstreamListPage extends POM {
  public $ = {
    ...POM.$,
  }

  constructor(page: Page) {
    super(page, '/upstreams')
  }
}

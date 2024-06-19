import type { Page } from '@playwright/test'
import { POM } from '.'

export class DataPlaneNodesPage extends POM {
  public $ = {
    ...POM.$,
  }

  constructor(page: Page) {
    super(page, '/data-plane-nodes')
  }
}

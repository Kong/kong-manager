import type { Page } from '@playwright/test'
import { POM } from '.'

export class PluginListPage extends POM {
  public $ = {
    ...POM.$,
  }

  constructor(page: Page) {
    super(page, '/plugins')
  }
}

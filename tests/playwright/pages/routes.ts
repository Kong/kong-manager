import type { Page } from '@playwright/test'
import { POM } from '.'

export class RouteListPage extends POM {
  public $ = {
    ...POM.$,
  }

  constructor(page: Page) {
    super(page, '/routes')
  }
}

export class RouteCreatePage extends POM {
  public $ = {
    ...POM.$,
  }

  constructor(page: Page, options: { serviceId?: string } = {}) {
    const { serviceId = '' } = options

    super(page, `/routes/create?serviceId=${serviceId}`)
  }
}

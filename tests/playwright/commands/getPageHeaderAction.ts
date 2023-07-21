import type { Page } from '@playwright/test'

export const getPageHeaderAction = (page: Page, actionText: string) => page.locator('.page-header .primary').getByText(actionText)

import type { Page } from '@playwright/test'

export const getPropertyValue = (page: Page, propKey: string) => page.getByTestId(`${propKey}-property-value`)

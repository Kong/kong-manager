import { test as pwTest, type BrowserContext, type Page } from '@playwright/test'
import config from '@pw-config'
import { withNavigation } from './commands/withNavigation'

export interface SharedState {
  context?: BrowserContext | null
  page?: Page | null
}

/**
 * Get an extended Playwright `test` object with predefined fixtures like `context` and `page`.
 * The `test` object returned can be further extended.
 *
 * @param sharedState object to store the shared states like `context` and `page` (pass `null` to disable sharing)
 * @returns an extended Playwright `test` object
 */
const baseTest = (sharedState: SharedState | null = {}) => {
  const t = pwTest.extend({
    context: async ({ browser }, use) => {
      let context: BrowserContext
      if (sharedState?.context === undefined || sharedState?.context === null) {
        context = await browser.newContext()

        if (sharedState !== null && sharedState.context !== null) {
          sharedState.context = context
        }
      } else {
        context = sharedState?.context
      }

      await use(context)
    },
    page: async ({ context }, use) => {
      let page: Page
      if (sharedState?.page === undefined || sharedState?.page === null) {
        page = new Proxy<Page>(await context.newPage(), {
          get(target, prop: keyof Page) {
            if (prop === 'goto') {
              return function(...args: Parameters<Page['goto']>) {
                const [url, ...restArgs] = args
                let targetURL: string

                try {
                  // do not build URL if `url` is already a valid URL
                  targetURL = new URL(url).href
                } catch {
                  targetURL = `${config.use?.baseURL ?? ''}${url}`
                }

                return withNavigation(target, () => target[prop](targetURL, ...restArgs), { allowSameURL: true })
              }
            }

            return target[prop]
          },
        })

        if (sharedState !== null && sharedState.page !== null) {
          sharedState.page = page
        }
      } else {
        page = sharedState?.page
      }

      await use(page)
    },
  })

  // make playwright always run tests from first to last when retry happens
  t.describe.configure({ mode: 'serial' })

  t.afterAll(async ({ context, page }) => {
    await page.close()
    await context.close()
  })

  return t
}

export default baseTest

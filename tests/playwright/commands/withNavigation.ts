import type { Page, Response } from '@playwright/test'
import * as _ from 'lodash-es'

const consumeNavigationStack = async (
  page: Page,
  firstWait = 100,
  timeout = 10,
  waitOptions?: {
    timeout?: number
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit'
  },
): Promise<Array<Response | null>> => {
  let all_cleared = false

  const resetTimer = _.debounce(() => {
    all_cleared = true
  }, timeout, {
    leading: false,
    trailing: true,
  })

  const navStack: Array<Response | null> = []

  await new Promise((resolve) => setTimeout(resolve, firstWait))
  resetTimer()


  while (!all_cleared) {
    const result = await page.waitForNavigation(waitOptions).catch(() => false as const)

    if (result !== false) {
      navStack.push(result)
      resetTimer()
    }
  }

  return navStack
}

const waitForNavigationImpl = async <T>(
  page: Page,
  action: () => Promise<T>,
  options?: {
    timeout?: number
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit'
  },
): Promise<T> => {
  // check potential existing navigation stack
  const stack = await consumeNavigationStack(page, 10, 1, { timeout: 10 })
  if (stack.length) {

    console.warn('withNavigation: navigation stack is not empty')
  }

  const np = page.waitForNavigation(options)

  const rtn = await action()

  await np

  // consume other navigation stack produced by the action
  await consumeNavigationStack(page, 100, 10, { timeout: 10 })

  return rtn
}

export const withNavigation = async <T>(
  page: Page,
  action: () => Promise<T>,
  options?: {
    allowSameURL?: boolean
    timeout?: number
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit'
  },
): Promise<T> => {
  const { allowSameURL, ...waitOptions } = options ?? {}

  if (allowSameURL ?? false) {
    return waitForNavigationImpl(page, action, waitOptions)
  } else {
    const currentURL = page.url()
    const np = page.waitForNavigation({
      url: url => url.href !== currentURL,
      ...waitOptions,
    })

    const rtn = await action()

    await np

    return rtn
  }
}

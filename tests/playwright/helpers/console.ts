import type { ConsoleMessage, Page } from '@playwright/test'

export const observeConsole = (page: Page) => {
  const messages: ConsoleMessage[] = []
  const consoleMessageHandler = (msg: ConsoleMessage) => messages.push(msg)

  page.on('console', consoleMessageHandler)

  const teardown = () => {
    page.off('console', consoleMessageHandler)

    return messages
  }

  return [messages, teardown] as const
}

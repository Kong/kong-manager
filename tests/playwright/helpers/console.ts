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

export const failOnCSPViolations = (page: Page): () => void => {
  const message = (message: ConsoleMessage) => {
    if ((message.type() === 'error' || message.type() === 'warning') && /violates.*Content Security Policy/.test(message.text())) {
      throw new Error(message.text())
    }
  }
  console.log('[Console Helper] Registered CSP violation watcher. Tests will fail if a CSP violation is detected.')
  page.on('console', message)

  return () => {
    page.off('console', message)
    console.log('[Console Helper] CSP violation watcher unregistered.')
  }
}
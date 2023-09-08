import type { AxiosError } from 'axios'

export const formatVersion = (version: string) => {
  return version.substring(0, (version.indexOf('-') > -1 && version.indexOf('-')) || version.length).split('.').slice(0, 2).join('.')
}

export function getMessageFromError (
  error?: AxiosError<{ message?: string }>,
  defaultMessage = 'There was an error',
) {
  if (!error) {
    return defaultMessage
  }

  if (error.response?.data) {
    if (error.response.data.message) {
      return error.response.data.message
    }

    if (typeof error.response.data === 'string') {
      return error.response.data
    }

    if (typeof error.response.data === 'object') {
      return Object.keys(error.response.data)
        .map(key => `${key} ${error.response?.data[key]}`)
        .join(', ')
    }
  }

  return error.message || defaultMessage
}

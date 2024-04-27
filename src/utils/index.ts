import dayjs from 'dayjs'

export const formatVersion = (version: string) => {
  return version.substring(0, (version.indexOf('-') > -1 && version.indexOf('-')) || version.length).split('.').slice(0, 2).join('.')
}

// Capitalize the first letter of each word in a string
export const capitalize = (str: string) => {
  if (!str) return ''

  return str.replace(/(?:^|[\s-:'"])\w/g, (a) => a.toUpperCase())
}

// Formats a unix timestamp into a formatted date string
export const formatDate = (timestamp: number, format?: string) => {
  return dayjs.unix(timestamp).format(format ?? 'MMM DD, YYYY, h:mm A')
}

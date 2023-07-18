const capitalizeRegEx = /(?:^|[\s-:'"])\w/g

export const capitalize = (str) => {
  if (!str) return ''

  return str.replace(capitalizeRegEx, (a) => a.toUpperCase())
}

export const convertToDotNotation = (key) => {
  return key.replace(/-/g, '.')
}

const camelCase = (str) => {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase()
  }).replace(/\s+/g, '')
}

export const generateFieldLabel = (fieldKey) => {
  return convertToDotNotation(fieldKey)
    .split('.')
    .map((name) => capitalize(camelCase(name)))
    .join('.')
}

export const getMessageFromError = (error) => {
  if (!error) {
    return error
  }

  if (error && error.response && error.response.data) {
    if (error.response.data.message) {
      return error.response.data.message
    }

    if (typeof error.response.data === 'string') {
      return error.response.data
    }

    if (typeof error.response.data === 'object') {
      return Object.keys(error.response.data)
        .map(key => `${key} ${error.response.data[key]}`)
        .join(', ')
    }
  }

  return error.message || 'There was an error'
}

export const pickReadableField = (item, typeHint) => {
  if (!item) return undefined

  let preferred

  switch (typeHint) {
    case 'services':
    case 'routes':
    case 'plugins':
    case 'upstreams':
    case 'snis':
    case 'vaults':
    case 'keys':
    case 'key-sets':
    case 'applications':
      preferred = item.name
      break
    case 'targets':
      preferred = item.target
      break
    case 'developers':
      preferred = item.email
      break
    case 'document_objects':
      preferred = item.path
      break
    case 'consumers':
      preferred = item.username || item.custom_id
      break
    case 'certificates':
    case 'ca_certificates':
      preferred = item.id
      break
    default:
      preferred = item.name || item.username || item.email || item.group || item.key ||
        (item.application && pickReadableField(item.application, 'applications')) ||
        item.path || item.target
      break
  }

  return preferred || item.id
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const unFlattenObject = (obj) => {
  const result = {}

  // Loop object and reduce each key to build nested structure
  for (const key in obj) {
    const keys = key.split('.')

    keys.reduce((acc, cur, curIdx) => {
      return acc[cur] ||
        // If current key in acc is the next
        // item in the split array (dot notation)
        // set its value
        (acc[cur] = isNaN(keys[curIdx + 1])
          ? (keys.length - 1 === curIdx ? obj[key] : {})
          : [])
    }, result)
  }

  return result
}

export const uuidRegEx = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

export const redirectOnResponseStatus = ($router, status, location, options) => {
  const opts = options || {}
  const changeRoute = opts.replace ? $router.replace : $router.push

  return function (response) {
    // Handle both success and error responses
    const resp = response.response ? response.response : response

    if (resp && resp.status === status) {
      changeRoute.call($router, location)
    }
  }
}

export const compareObjects = (a, b) => {
  return JSON.stringify(a) === JSON.stringify(b)
}

export const isObjectEmpty = (obj) => {
  return Object.keys(obj).length === 0
}

export const sortAlpha = (property) => {
  return (a, b) => {
    let propertyA = a[property] === undefined || a[property] === null ? '' : a[property]
    let propertyB = b[property] === undefined || b[property] === null ? '' : b[property]

    if (Array.isArray(a[property])) {
      propertyA = a[property][0]
    }

    if (Array.isArray(b[property])) {
      propertyB = b[property][0]
    }

    return propertyA.localeCompare(propertyB)
  }
}

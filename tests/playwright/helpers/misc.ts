import config from '@pw-config'
import type { AxiosError } from 'axios'
import bmp from 'bmp-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const getMessageFromError = function(error: AxiosError<{ message?: string }>) {
  if (error?.response?.data) {
    if (error.response.data.message) {
      return error.response.data.message
    }

    return JSON.stringify(error.response.data)
  }

  return error.message || 'There was an error'
}

export const handleRequestError = (from: string, err: AxiosError<{ message?: string }>, expose = true) => {
  console.error(`[error] ${from}:`, err.config.method, err.config.url, getMessageFromError(err))
  if (expose) {
    throw err
  }
}

export const getBasePath = () => {
  if (!config.use?.baseURL) {
    return '/'
  }

  const pathname = new URL(config.use?.baseURL).pathname

  return pathname.endsWith('/') ? pathname : `${pathname}/`
}

export const generateBitMap = function(name: string, width: number, height: number) {
  const dir = path.resolve(__dirname, '../../tmp')
  const fd = `${dir}/${name}`
  const rawData = bmp.encode({ data: {}, width, height })

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  fs.writeFileSync(fd, rawData.data)

  return fd
}

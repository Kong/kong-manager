import { handleRequestError } from '@pw/helpers/misc'
import type { AxiosError, AxiosRequestConfig, Method } from 'axios'
import axios from 'axios'

export const fetchKongResource = async (endpoint: string) => {
  const kongUrl = process.env.KM_TEST_API_URL
  const options: AxiosRequestConfig = {
    method: 'GET' as Method,
    url: `${kongUrl}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      'Connection': 'close',
    },
  }

  try {
    return await axios(options)
  } catch (err) {
    handleRequestError('fetchKongResource', err as AxiosError<object>)
  }
}

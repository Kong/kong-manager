import axios from 'axios'
import type { Method, AxiosRequestConfig, AxiosError } from 'axios'
import { handleRequestError } from '@pw/helpers/misc'
import type { PayloadType } from './type'

export const createKongResource = async (endpoint: string, payload: PayloadType) => {
  const kongUrl = process.env.KM_TEST_API_URL
  const options: AxiosRequestConfig = {
    method: 'POST' as Method,
    url: `${kongUrl}${endpoint}`,
    data: payload,
    headers: {
      'Content-Type': 'application/json',
      'Connection': 'close',
    },
  }

  try {
    return await axios(options)
  } catch (err) {
    handleRequestError('createKongResource', err as AxiosError<object>)
  }
}

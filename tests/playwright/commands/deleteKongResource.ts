import axios from 'axios'
import type { Method, AxiosRequestConfig, AxiosError } from 'axios'
import { handleRequestError } from '@pw/helpers/misc'

export const deleteKongResource = async (endpoint: string, id = '', throwOnError = false) => {
  const kongUrl = process.env.KM_TEST_API_URL

  const options: AxiosRequestConfig = {
    method: 'DELETE' as Method,
    url: `${kongUrl}${endpoint}/${id}`,
    headers: {
      'Content-Type': 'application/json',
      'Connection': 'close',
    },
  }

  try {
    return await axios(options)
  } catch (err) {
    handleRequestError('deleteKongResource', err as AxiosError<object>, options, throwOnError)
  }
}

import axios from 'axios'
import type { Method, AxiosRequestConfig, AxiosError } from 'axios'
import { handleRequestError } from '@pw/helpers/misc'

export const deleteKongResource = async (endpoint: string, id = '', throwOnError = false) => {
  const kongUrl = process.env.KM_TEST_API_URL

  const idPath = id ? `/${id}` : ''
  const options: AxiosRequestConfig = {
    method: 'DELETE' as Method,
    url: `${kongUrl}${endpoint}${idPath}`,
    headers: {
      'Content-Type': 'application/json',
      'Connection': 'close',
    },
  }

  try {
    const res = await axios(options)

    console.log(`${endpoint}${idPath} deleted`)

    return res
  } catch (err) {
    handleRequestError('deleteKongResource', err as AxiosError<object>, throwOnError)
  }
}

import { handleRequestError } from '@pw/helpers/misc'
import type { AxiosError, AxiosPromise, AxiosResponse } from 'axios'
import axios from 'axios'

const WORKER_COUNT = 10

interface ItemProps {
  id?: string
  username?: string
  name?: string
}

interface ResponseProps {
  data: Array<ItemProps>
}

export type ClearKongResourcesOptions = {
  throwOnError?: boolean
  ignoreNotFound?: boolean
}

export const clearKongResources = async (endpoint: string, clearOptions: ClearKongResourcesOptions = {}) => {
  const { throwOnError, ignoreNotFound } = {
    throwOnError: clearOptions.throwOnError ?? true,
    ignoreNotFound: clearOptions.ignoreNotFound ?? false,
  }

  const kongUrl = process.env.KM_TEST_API_URL
  const options = {
    method: 'GET' as const,
    headers: {},
  }
  const tasks: (() => AxiosPromise)[] = []

  try {
    const items: ItemProps[] = []
    let next = kongUrl + endpoint

    while (true) {
      const res: AxiosResponse<ResponseProps> = await axios({ ...options, url: next })

      if (Array.isArray(res.data.data)) {
        items.push(...res.data.data)
      }


      if ((res.data as any)?.next) {

        next = kongUrl + (res.data as any)?.next
      } else {
        break
      }
    }

    if (items.length === 0) {
      console.log(`No items on ${endpoint} to delete.`)

      return
    } else {
      console.log(`Will delete ${items.length} resources on ${endpoint}.`)
    }

    items.forEach((resource: ItemProps) => {
      const clearAllOptions = {
        method: 'DELETE' as const,
        url: `${kongUrl}${endpoint}/${resource.id || resource.name}`,
        headers: {
          ...options.headers,
        },
      }

      tasks.push(async () => axios(clearAllOptions))
    })
  } catch (err) {
    if (ignoreNotFound && axios.isAxiosError(err) && err.response?.status === 404) return
    handleRequestError('clearKongResources', err as AxiosError<object>, throwOnError)
  }

  let deletedCount = 0

  try {
    await Promise.all(
      Array.from({ length: WORKER_COUNT }).map(async () => {
        let task: (() => AxiosPromise) | undefined

        while ((task = tasks.shift())) {
          try {
            await task()
            deletedCount++
          } catch (e) {
            if (ignoreNotFound && axios.isAxiosError(e) && e.response?.status === 404) {
              continue
            }

            throw e
          }
        }
      }),
    )
    console.log(`${deletedCount} resources on ${endpoint} have been deleted`)
  } catch (err) {
    handleRequestError('clearKongResources', err as AxiosError<object>, throwOnError)
  }
}

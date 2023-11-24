import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { LocationQueryValue } from 'vue-router'

export const useURLFromRouteQuery = (urlKey: string) => {
  const route = useRoute()

  return computed(() => {
    const query = route.query[urlKey]
    let url: LocationQueryValue = null

    if (Array.isArray(query)) {
      url = query[0]
      console.warn(`useURLFromRouteQuery: "${urlKey}" in query should not be an array, using first element this time`)
    } else if (typeof query === 'string') {
      url = query
    }

    return url
  })
}

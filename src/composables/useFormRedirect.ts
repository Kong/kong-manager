import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

import { useURLFromRouteQuery } from './useRedirect'

export const useFormRedirectOnCancel = (fallback: RouteLocationRaw) => {
  const router = useRouter()
  const redirectRouteLocation = useURLFromRouteQuery('redirect')

  const routeOnCancel = computed(() => {
    if (redirectRouteLocation.value) {
      return redirectRouteLocation.value
    }

    const previousPath = router.options?.history?.state?.back
    if (typeof previousPath === 'string') {
      return router.resolve(previousPath)
    }

    return fallback
  })

  return routeOnCancel.value
}

export const useFormRedirectOnUpdate = (fallback?: RouteLocationRaw) => {
  const redirectRouteLocation = useURLFromRouteQuery('redirect')

  const routeOnUpdate = computed(() => {
    if (redirectRouteLocation.value) {
      return redirectRouteLocation.value
    }

    return fallback
  })

  return routeOnUpdate.value
}

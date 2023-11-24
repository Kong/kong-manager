import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useURLFromRouteQuery } from './useRedirect'

export const useListRedirect = () => {
  const route = useRoute()
  const router = useRouter()

  const redirectPath = useURLFromRouteQuery('redirect')
  const redirectRouteQuery = computed(() => ({ redirect: redirectPath.value }))

  const createRedirectRouteQuery = (redirect = route.fullPath) => {
    return { redirect }
  }

  const redirect = (replace = false, goBack = false) => {
    const routerFn = replace ? router.replace : router.push
    if (redirectPath.value) {
      routerFn(redirectPath.value)

      return true
    }

    if (goBack) {
      router.go(-1)

      return true
    }

    return false
  }

  return {
    redirectPath: redirectPath.value,
    redirectRouteQuery: redirectRouteQuery.value,
    createRedirectRouteQuery,
    redirect,
  }
}

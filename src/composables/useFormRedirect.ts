import { computed } from 'vue'
import { useRoute, useRouter, type RouteLocationRaw, type MatcherLocationAsPath } from 'vue-router'

export const useFormRedirectOnCancel = (fallback: RouteLocationRaw) => {
  const route = useRoute()
  const router = useRouter()
  const redirectPath = computed(() => route.query.redirect)
  const routeOnCancel = computed(() => {
    if (redirectPath.value) {
      return { path: redirectPath.value } as MatcherLocationAsPath
    }

    const previousPath = router.options?.history?.state?.back
    if (previousPath) {
      return { path: previousPath } as MatcherLocationAsPath
    }

    return fallback
  })

  return routeOnCancel.value
}

export const useFormRedirectOnUpdate = (fallback: RouteLocationRaw) => {
  const route = useRoute()
  const redirectPath = computed(() => route.query.redirect)

  const routeOnUpdate = computed(() => {
    const link = redirectPath.value || route.query.returnLink || route.query.redirect

    return link ? ({ path: link } as MatcherLocationAsPath) : fallback
  })

  return routeOnUpdate.value
}

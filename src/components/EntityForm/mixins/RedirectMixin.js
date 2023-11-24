const extractRedirectPath = ($route, urlKey) => {
  const query = $route.query[urlKey]
  let url = null

  if (Array.isArray(query)) {
    url = query[0]
    console.warn(`extractRedirectPath: "${urlKey}" in query should not be an array, using first element this time`)
  } else if (typeof query === 'string') {
    url = query
  }

  return url
}

export default {
  computed: {
    redirectPath () {
      return extractRedirectPath(this.$route, 'redirect')
    },
    redirectRouteQuery () {
      return { redirect: this.redirectPath }
    },
    postDeletePath () {
      return extractRedirectPath(this.$route, 'postDelete')
    },
    postDeleteRouteQuery () {
      return { postDelete: this.postDeletePath }
    },
  },
  methods: {
    createRedirectRouteQuery (redirect = this.$route.fullPath) {
      return { redirect }
    },
    createPostDeleteRouteQuery (postDelete) {
      if (typeof postDelete !== 'string') {
        postDelete = this.postDeletePath ?? this.$route.fullPath
      }

      return { postDelete }
    },
    redirect (replace = false, goBack = false) {
      const routerFn = replace ? this.$router.replace : this.$router.push
      if (this.redirectPath) {
        routerFn(this.redirectPath)

        return true
      }

      if (goBack) {
        this.$router.go(-1)

        return true
      }

      return false
    },
  },
}

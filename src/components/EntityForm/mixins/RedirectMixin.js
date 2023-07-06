export default {
  computed: {
    redirectPath () {
      return this.$route.query.redirect
    },
    redirectRouteQuery () {
      return { redirect: this.redirectPath }
    },
    postDeletePath () {
      return this.$route.query.postDelete
    },
    postDeleteRouteQuery () {
      return { postDelete: this.postDeletePath }
    },
  },
  methods: {
    createRedirectRouteQuery (redirectPath = this.$route.fullPath) {
      return { redirect: redirectPath }
    },
    createPostDeleteRouteQuery (postDeletePath = this.postDeletePath || this.$route.fullPath) {
      return { postDelete: postDeletePath }
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

/**
  Default form page mixins

  Requires:
  - `resourceEndpoint` - resource endpoint

  Optional:
  - `id` - resource identifier

  Provides:
  - `isEditing` - `true` when `id` exists
  - `redirectRoute` - route to redirect to, defaults to `{ name: <resourceEndpoint> }`.
  - `buttonText` - `Update` or `Create` depending on `isEditing`
  - `onFormLoad` - handler for `onLoad` callback of `EntityForm`
  - `onFormSubmit` - handler for `onSubmit` callback of `EntityForm`
  - `getRecord` - method to retrieve resource record
  - `createRecord` - method to create a resource record
  - `updateRecord` - method to update a resource record
  - `transformRecord` - method to transform a resource record before update and create
*/
import { redirectOnResponseStatus } from '../helpers'
import { apiService } from '@/services/apiService'

export default {
  computed: {
    $_redirectOnSubmit () {
      return this.redirectOnSubmit !== undefined ? this.redirectOnSubmit : true
    },

    isEditing () {
      return !!this.id
    },

    buttonText () {
      return this.isEditing ? 'Save' : 'Create'
    },

    /**
     * @returns {RawLocation|-1} returns a vue router location or -1 indicating
     * that the router should go back, e.g. $router.go(-1)
     */
    redirectRoute () {
      if (this.redirectPath) {
        return this.redirectPath
      }

      return { name: this.resourceEndpoint }
    },
  },

  methods: {
    onFormLoad () {
      return Promise.resolve(this.id ? this.getRecord() : false)
        .catch(redirectOnResponseStatus(this.$router, 404, '/404', { replace: true }))
    },

    async onFormSubmit (model, callback = this.redirectRoute) {
      const record = this.transformRecord(model)

      return await this.isEditing
        ? this.updateRecord(record)
        : this.createRecord(record, callback)
    },

    getRecord () {
      return apiService.findRecord(this.resourceEndpoint, this.id)
    },

    /**
     * @param {Object} model - form model
     * @param {RawLocation|Function} callback - vue router location or function
     *  to calculate the vue router location from the response
     */
    async createRecord (model, callback) {
      return apiService.createRecord(this.resourceEndpoint, model)
        .then(res => {
          if (this.hideSubmit) {
            return res.data
          }

          this.$emit('submit', res.data)

          // if the parent form passes in redirectOnSubmit = false, then we don't do anything after creation
          if (!this.$_redirectOnSubmit) {
            return null
          }

          // if parent form defines a redirectRouteNames object, we either go back to previous page if -1 is passed
          // else we go to the named route
          const redirectCreateRoute = this.redirectRouteNames && this.redirectRouteNames.create
          if (redirectCreateRoute) {
            return redirectCreateRoute === '-1' ? this.$router.go(-1) : this.$router.push({ name: redirectCreateRoute, params: this.$router.params })
          }

          const link = this.redirectPath || this.returnLink

          if (link) {
            return this.$router.push(link)
          }

          const location = typeof callback === 'function'
            ? callback(model, res.data)
            : callback

          redirectOnResponseStatus(this.$router, 201, location)(res)

          return res.data
        })
    },

    async updateRecord (model) {
      return apiService.updateRecord(this.resourceEndpoint, this.id, model)
        .then(res => {
          const link = this.redirectPath || this.returnLink

          // if parent form defines a redirectRouteNames object, we either go back to previous page if -1 is passed
          // else we go to the named route
          const redirectUpdateRoute = this.redirectRouteNames && this.redirectRouteNames.update
          if (redirectUpdateRoute) {
            return redirectUpdateRoute === '-1' ? this.$router.go(-1) : this.$router.push({ name: redirectUpdateRoute, params: this.$router.params })
          }

          if (link) {
            return this.$router.push(link)
          }

          redirectOnResponseStatus(this.$router, 200, { name: this.resourceEndpoint })(res)

          return res.data
        })
    },

    transformRecord (model) {
      return model
    },
  },
}

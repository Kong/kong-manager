<template>
  <section class="plugin-form">
    <PageHeader :title="title" />

    <KAlert
      v-if="warningMessage"
      :alert-message="warningMessage"
      appearance="warning"
      class="mb-4"
    />

    <EntityForm
      v-if="!isDisabled"
      ref="form"
      :is-editing="isEditing"
      :show-confirmation-dialog="isEditing"
      :prevent-submission-before-change="isEditing"
      :schema="schema"
      :fields="fields"
      :button-text="buttonText"
      :on-load="onFormLoad"
      :on-submit="onFormSubmit"
      :on-form-cancel="onCancel"
      :resource-endpoint="resourceEndpoint"
      entity-name="Plugin"
      entity="plugins"
      @model-updated="handleUpdate"
    >
      <template #afterFormContainer>
        <div class="mb-4">
          <KAlert
            v-if="warningMessage"
            :alert-message="warningMessage"
            appearance="warning"
            class="mb-6"
          />

          <KEmptyState
            v-if="error"
            cta-is-hidden
            is-error
          >
            <template #message>
              <h5 class="mb-0">
                Error: Something went wrong
              </h5>
            </template>
          </KEmptyState>
        </div>
      </template>
    </EntityForm>

    <KEmptyState
      v-if="isDisabled"
      :message="lang.DISABLED_TEXT"
    >
      <template #title />
      <template #message>
        {{ lang.DISABLED_TEXT }}
      </template>
      <template #cta>
        <KExternalLink
          :href="docsLink"
          class="justify-content-center"
        >
          Visit documentation
        </KExternalLink>
      </template>
    </KEmptyState>
  </section>
</template>

<script>
import axios from 'axios'
import { marked } from 'marked'
import * as _ from 'lodash-es'
import { PluginScope } from '@kong-ui/entities-plugins'
import EntityForm from '@/components/EntityForm/EntityForm.vue'
import FormPageMixin from '@/components/EntityForm/mixins/FormPage'
import { capitalize, uuidRegEx, redirectOnResponseStatus, isObjectEmpty } from '@/components/EntityForm/helpers'
import { pluginMeta } from './PluginMeta'
import customSchemas from '@/schemas/CustomSchemas'
import typedefs from '@/schemas/typedefs'
import { ArrayStringFieldSchema } from '@/components/EntityForm/fields'
import FormActionsMixin from '@/components/EntityForm/mixins/FormActionsMixin'
import RedirectMixin from '@/components/EntityForm/mixins/RedirectMixin'

const formatPluginFieldLabel = (label) => {
  if (!label.startsWith('config-')) {
    return label
  }

  return label.replace(/-/g, '.')
}

export default {
  name: 'PluginForm',
  components: { EntityForm },
  mixins: [FormPageMixin, FormActionsMixin, RedirectMixin],

  props: {
    redirectRouteNames: {
      type: Object,
      default: () => ({}),
    },

    hideForeign: {
      type: Boolean,
      default: false,
    },

    warningMessage: {
      type: String,
      default: null,
    },

    returnLinkPath: {
      type: String,
      default: null,
    },
    useKonnectSchema: {
      type: Boolean,
      default: false,
    },
    consumerId: {
      type: String,
      required: false,
      default: '',
    },
    serviceId: {
      type: String,
      required: false,
      default: '',
    },
    routeId: {
      type: String,
      required: false,
      default: '',
    },
  },

  data () {
    const plugin = this.$route.params.pluginType

    return {
      plugin,
      error: null,
      schema: null,
      formModel: null,
      originalModel: null,
      lang: {
        DISABLED_TEXT: 'This Plugin must be configured using the Kong Admin API. Please see the documentation.',
      },

      defaultFormSchema: {
        enabled: {
          type: 'switch',
          model: 'enabled',
          label: 'Enabled',
          textOn: 'This Plugin is enabled',
          textOff: 'This Plugin is disabled',
          inputType: 'hidden',
          styleClasses: 'field-switch top-border bottom-border hide-label',
          default: true,
        },

        name: {
          default: plugin,
          type: 'input',
          inputType: 'hidden',
          styleClasses: 'd-none',
        },

        selectionGroup: {
          type: this.hideForeign ? 'foreign' : 'selectionGroup',
          inputType: 'hidden',
          styleClasses: 'bottom-border',
          fields: [
            {
              label: 'Global',
              description: 'All Gateway Services, Routes, and Consumers',
            },
          ],
        },

        instance_name: {
          default: '',
          type: 'input',
          inputType: 'text',
          label: 'Instance Name',
        },

        tags: typedefs.tags,
      },

      customSchemas: {
        ...customSchemas,
      },
    }
  },

  computed: {
    id () {
      return this.$route.params.id
    },

    title () {
      return this.isEditing ? `Edit Plugin: ${this.plugin}` : `New Plugin: ${this.plugin}`
    },

    buttonText () {
      return this.isEditing ? 'Save' : 'Install'
    },

    isDisabled () {
      const currentPlugin = Object.keys(customSchemas).find(i => i === this.plugin)

      return customSchemas[currentPlugin] && customSchemas[currentPlugin].configurationDisabled
    },

    fields () {
      // Calculate fields that will be populated from either params from a
      // previous route change, or from query params
      const entityType = this.$route.query.entity_type
      const entityId = this.$route.query.entity_id
      let fields = this.$route.params.fields

      if ((!fields || isObjectEmpty(fields)) && entityType) {
        fields = { [entityType]: entityId.split(',')[0] }
      }

      return fields
    },

    resourceEndpoint () {
      const noSearch = this.$route.query.no_search

      if (this.formModel && this.originalModel) {
        const consumerId = this.formModel['consumer-id'] && this.originalModel['consumer-id']
        const serviceId = this.formModel['service-id'] && this.originalModel['service-id']
        const routeId = this.formModel['route-id'] && this.originalModel['route-id']

        // TODO: no_search is used for developers entity, so don't POST to
        // consumers, but will need to eventually return /developers/:id/plugins
        if (consumerId && !noSearch) {
          return `consumers/${consumerId}/plugins`
        } else if (serviceId) {
          return `services/${serviceId}/plugins`
        } else if (routeId) {
          return `routes/${routeId}/plugins`
        }
      }

      if (this.isEditing && this.fields) {
        if (this.fields.consumer_id && !noSearch) {
          return `consumers/${this.fields.consumer_id}/plugins`
        } else if (this.fields.service_id) {
          return `services/${this.fields.service_id}/plugins`
        } else if (this.fields.route_id) {
          return `routes/${this.fields.route_id}/plugins`
        }
      }

      if (this.consumerId) {
        return `consumers/${this.consumerId}/plugins`
      } else if (this.serviceId) {
        return `services/${this.serviceId}/plugins`
      } else if (this.routeId) {
        return `routes/${this.routeId}/plugins`
      }

      return 'plugins'
    },

    returnLink () {
      if (this.redirectPath) {
        return this.redirectPath
      }

      if (this.returnLinkPath) {
        return this.returnLinkPath
      }

      const entityId = this.resourceEndpoint.match(new RegExp(uuidRegEx))

      if (entityId && this.$route.query.entity_id) {
        // e.g. /consumers/e22cf8e2-795a-4eac-8da1-76b47de30b5c
        return `/${this.resourceEndpoint.split('/')[0]}/${entityId}`
      }

      return this.$route.query.returnLink
    },

    docsLink () {
      if (!pluginMeta[this.plugin]) {
        return ''
      }

      let pluginUrlName = this.plugin
      if ((pluginMeta[this.plugin].docsUrlName !== undefined)) {
        pluginUrlName = pluginMeta[this.plugin].docsUrlName
      }

      return pluginUrlName ? `https://docs.konghq.com/hub/kong-inc/${pluginUrlName}` : ''
    },
  },

  beforeMount () {
    this.getPluginSchema()
      .then(response => {
        const supportServiceScope = pluginMeta[this.plugin]?.scope.includes(PluginScope.SERVICE) ?? true
        const supportRouteScope = pluginMeta[this.plugin]?.scope.includes(PluginScope.ROUTE) ?? true
        const supportConsumerScope = pluginMeta[this.plugin]?.scope.includes(PluginScope.CONSUMER) ?? true

        const scopeEntityArray = []

        if (supportServiceScope) {
          scopeEntityArray.push({
            model: 'service-id',
            label: 'Gateway Service',
            placeholder: 'Select a Gateway Service',
            type: 'AutoSuggest',
            entity: 'services',
            inputValues: {
              fields: ['name', 'id'],
            },
            help: 'The Gateway Service that this Plugin configuration will target',
          })
        }

        if (supportRouteScope) {
          scopeEntityArray.push({
            model: 'route-id',
            label: 'Route',
            placeholder: 'Select a Route',
            type: 'AutoSuggest',
            entity: 'routes',
            inputValues: {
              fields: ['name', 'id'],
              primaryField: 'id',
            },
            help: 'The Route that this Plugin configuration will target',
          })
        }

        if (supportConsumerScope) {
          scopeEntityArray.push({
            model: 'consumer-id',
            label: 'Consumer',
            placeholder: 'Select a Consumer',
            type: 'AutoSuggest',
            entity: 'consumers',
            inputValues: {
              fields: ['username', 'custom_id', 'id'],
              primaryField: 'username',
            },
            help: 'The Consumer that this Plugin configuration will target',
          })
        }

        if (scopeEntityArray.length) {
          const scopeEntities = [
            ...supportServiceScope ? ['service'] : [],
            ...supportRouteScope ? ['route'] : [],
            ...supportConsumerScope ? ['consumer'] : [],
          ]

          const trailingEntities = scopeEntities.splice(scopeEntities.length - 2, 2).map(s => s === 'service' ? 'Gateway Services' : capitalize(`${s}s`))
          const trailingText = trailingEntities.join(`${scopeEntities.length > 0 ? ',' : ''} and/or `)

          const desc = [
            'Specific',
            [
              ...scopeEntities.length > 0
                ? [scopeEntities.map(s =>
                    s === 'service' ? 'Gateway Services' : capitalize(`${s}s`)
                  ).join(', ')]
                : [],
              trailingText,
            ]
              .join(', '),
          ]
            .join(' ')

          this.defaultFormSchema.selectionGroup.fields.push({
            label: 'Scoped',
            description: desc,
            fields: [],
          })

          this.defaultFormSchema.selectionGroup.fields[1].fields = scopeEntityArray
        }

        if (customSchemas[this.plugin] && customSchemas[this.plugin].overwriteDefault && (customSchemas[this.plugin].useKonnectSchema ? this.useKonnectSchema : true)) {
          this.defaultFormSchema = customSchemas[this.plugin].formSchema
        }

        // start from the config part of the schema
        const configField = response.fields.find(field => field.config)

        const configResponse = configField ? configField.config : response

        this.schema = this.buildFormSchema('config', configResponse, this.defaultFormSchema)
      }).catch(err => {
        this.error = err
      })
  },

  methods: {
    onCancel () {
      if (this.redirectPath) {
        this.$router.push({ path: this.redirectPath })
      } else if (this.returnLinkPath) {
        this.$router.push({ path: this.returnLinkPath })
      } else if (this.$router.previous) {
        this.$router.push({ ...this.$router.previous })
      } else {
        this.$router.go(-1)
      }
    },

    /**
        Overwrite `FormPage` mixin method to return response.data in plugins
      */
    onFormLoad () {
      return Promise.resolve(this.id ? this.getRecord() : false)
      // QUIRK: kong returns 400 when the plugin is not found
        .catch(redirectOnResponseStatus(this.$router, 400, '/404', { replace: true }))
    },

    /**
     Overwrite `FormPage` mixin method to update api endpoint and refresh plugin list
    */
    async createRecord (model) {
      // TODO: we can revert this change if selectionGroup is disabled when redirected from consumer/route/service detail page
      let endpoint = 'plugins'
      if (model.consumer?.id) {
        endpoint = `consumers/${model.consumer.id}/plugins`
      } else if (model.service?.id) {
        endpoint = `services/${model.service.id}/plugins`
      } else if (model.route?.id) {
        endpoint = `routes/${model.route.id}/plugins`
      }

      return axios.post(`${this.adminApiUrl}/${this.$route.query?.from === 'developer' ? this.resourceEndpoint : endpoint}`, model)
        .then((res) => {
          // if parent form defines a redirectRouteNames object, we either go back to previous page if -1 is passed
          // else we go to the named route
          const redirectCreateRoute = this.redirectRouteNames.create
          if (redirectCreateRoute) {
            return redirectCreateRoute === '-1'
              ? this.$router.go(-1)
              : this.$router.push({
                name: redirectCreateRoute,
                params: this.$router.params,
                query: this.$router.query,
              })
          }

          this.returnLink
            ? this.$router.push({ path: this.returnLink })
            : redirectOnResponseStatus(this.$router, 201, { name: 'plugin-list' })(res)

          return res.data
        })
    },

    /**
     Overwrite `FormPage` mixin method to update api endpoint and refresh plugin list
    */
    async updateRecord (model) {
      if (!model.consumer) {
        model.consumer = null
      }

      if (!model.route) {
        model.route = null
      }

      if (!model.service) {
        model.service = null
      }

      // TODO: we can revert this change if selectionGroup is disabled when redirected from consumer/route/service detail page
      let endpoint = 'plugins'
      if (model.consumer?.id && this.originalModel?.['consumer-id']) {
        endpoint = `consumers/${this.originalModel['consumer-id']}/plugins`
      } else if (model.service?.id && this.originalModel?.['service-id']) {
        endpoint = `services/${this.originalModel['service-id']}/plugins`
      } else if (model.route?.id && this.originalModel?.['route-id']) {
        endpoint = `routes/${this.originalModel['route-id']}/plugins`
      }

      return axios.patch(`${this.adminApiUrl}/${endpoint}/${this.id}`, model)
        .then((res) => {
          const redirectUpdateRoute = this.redirectRouteNames.update
          if (redirectUpdateRoute) {
            return redirectUpdateRoute === '-1'
              ? this.$router.go(-1)
              : this.$router.push({
                name: redirectUpdateRoute,
                params: this.$router.params,
                query: this.$router.query,
              })
          }

          this.returnLink
            ? this.$router.push({ path: this.returnLink })
            : redirectOnResponseStatus(this.$router, 200, { name: 'plugin-detail', params: { id: this.id } })(res)

          return res.data
        })
    },

    getPluginSchema () {
      return axios.get(`${this.adminApiUrl}/schemas/plugins/${this.plugin}`)
        .then(response => response.data)
        .catch(redirectOnResponseStatus(this.$router, 404, '/404', { replace: true }))
    },

    getArrayType (list) {
      const uniqueTypes = [...(new Set(list.map(item => typeof item)))]

      return uniqueTypes.length > 1 ? 'string' : uniqueTypes[0]
    },

    buildFormSchema (parent, response, output) {
      let schema = (response && response.fields) || []
      const pluginSchema = this.customSchemas[this.plugin]

      if (Array.isArray(schema)) {
        schema = schema.reduce((acc, current) => {
          const key = Object.keys(current)[0]

          acc[key] = current[key]

          return acc
        }, {})
      }

      Object.keys(schema).sort().forEach(key => {
        const scheme = schema[key]
        const field = parent ? `${parent}-${key}` : `${key}`

        // Required, omit keys with overwrite and hidden attributes for Kong Cloud
        if (Object.prototype.hasOwnProperty.call(scheme, 'overwrite') || scheme.hidden) {
          return
        }

        if (scheme.type === 'table') {
          return this.buildFormSchema(field, scheme.schema, output)
        }

        if (scheme.fields) {
          return this.buildFormSchema(field, scheme, output)
        }

        output[field] = { id: field }
        output[field].type = scheme.type === 'boolean' ? 'checkbox' : 'input'
        if (field.startsWith('config-')) {
          output[field].label = formatPluginFieldLabel(field)
        }

        if (parent === 'config') {
          if (schema[key]?.description) {
            output[field].help = marked.parse(schema[key].description, { mangle: false, headerIds: false })
          }
        }

        if (scheme.type === 'map') {
          output[field].type = 'object-advanced'

          if (scheme.values.type === 'array') {
            const { type: elementsType } = scheme.values.elements || {}

            output[field].schema = {
              fields: [{
                schema: {
                  fields: [{
                    ...ArrayStringFieldSchema,
                    model: field,
                    valueArrayType: elementsType === 'integer' ? 'number' : elementsType || 'string',
                    inputAttributes: {
                      ...ArrayStringFieldSchema.inputAttributes,
                      type: elementsType === 'integer' ? 'number' : 'text',
                      inputMode: elementsType === 'integer' ? 'numeric' : 'text',
                    },
                  }],
                },
              }],
            }
          } else if (scheme.values.fields) {
            output[field].schema = {
              fields: [
                {
                  type: 'object',
                  model: 'object',
                  schema: {
                    fields: scheme.values.fields.map(f => {
                      const modelName = Object.keys(f)[0]

                      return {
                        model: modelName,
                        type: 'input',
                        label: capitalize(modelName),
                        placeholder: modelName,
                        inputType: f[modelName].type,
                      }
                    }),
                  },
                },
              ],
            }
          }

          return output
        }

        if (scheme.enum && scheme.type === 'array') {
          output[field].type = 'checklist'
          output[field].values = scheme.enum
          output[field].multi = true
          output[field].multiSelect = true
        }

        if (scheme.one_of && scheme.type !== 'array') {
          output[field].type = 'select'
          output[field].values = scheme.one_of
          output[field].selectOptions = {
            noneSelectedText: 'No selection...',
          }
        }

        if (scheme.elements && scheme.type === 'array') {
          const elements = scheme.elements
          if (elements.type === 'string' && !elements.one_of) {
            const { help, label } = output[field]

            output[field] = { ..._.cloneDeep(ArrayStringFieldSchema), help, label }
          }
        }

        if (scheme.required) {
          output[field].required = true
          output[field].selectOptions = {
            hideNoneSelectedText: true,
          }
        }

        // Default is set and is not an object or string 'function'
        if (scheme.default != null && typeof scheme.default !== 'object' && scheme.default !== 'function') {
          output[field].default = scheme.default
        }

        // Custom schema override
        if (pluginSchema && !pluginSchema.overwriteDefault && (customSchemas[this.plugin].useKonnectSchema ? this.useKonnectSchema : true)) {
          Object.keys(pluginSchema).forEach(plugin => {
            // Check if current plugin matches any of custom schema keys
            if (plugin === field) {
              // Use custom defined schema instead of building from default && set field label
              const { help, label } = output[field]

              output[field] = { ...pluginSchema[plugin], help, label }
            }
          })
        }

        // Field type is an input, determine input type, such as 'text', or 'number'
        if (output[field].type === 'input') {
          const { type: elementsType } = scheme.elements || {}

          if (elementsType) {
            output[field].valueArrayType = elementsType === 'integer' ? 'number' : elementsType
          }

          output[field].inputType = scheme.type === 'array' || scheme.type === 'string'
            ? (scheme.encrypted ? 'password' : 'text')
            : scheme.type
        }

        // Determine schema value type by interpretation of defaults or enum values
        let valueType = 'string'

        if (scheme.enum) {
          valueType = this.getArrayType(scheme.enum)
        } else if (scheme.type === 'boolean') {
          valueType = 'boolean'
        } else if (scheme.type === 'number' || scheme.type === 'integer') {
          valueType = 'number'
          output[field].inputType = 'number'
        } else if (scheme.type === 'array' || scheme.type === 'set') {
          valueType = 'array'
          output[field].default = scheme.default
          // If an array/set field requires to be non-empty,
          // commit null instead of an empty array/set.
          // Fixes INTF-2938
          if (scheme.len_min > 0) {
            output[field].submitWhenNull = true
          }
        } else if (scheme.default && Array.isArray(scheme.default)) {
          valueType = 'array'
          output[field].valueArrayType = this.getArrayType(scheme.default)
        } else if (scheme.default) {
          valueType = typeof scheme.default
        }

        output[field].valueType = valueType
      })

      return output
    },

    handleUpdate (formModel, originalModel) {
      this.formModel = formModel
      this.originalModel = originalModel
    },
  },
}
</script>

<style lang="scss" scoped>
.plugin-form {
  :deep(.k-popover-content p) {
    margin: 0;
  }
}
</style>

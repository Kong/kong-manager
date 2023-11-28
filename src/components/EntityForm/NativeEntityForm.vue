<template>
  <KSkeleton
    v-if="currentState === 'pending'"
    type="form"
  />
  <form
    v-else
    ref="entityForm"
    class="entity-form"
    @click.prevent
  >
    <slot
      v-if="currentState !== 'pending'"
      name="alertMessage"
    />

    <VueFormGenerator
      v-if="formModel.id && isEditing || !isEditing"
      :schema="formSchema"
      :model="formModel"
      :options="formOptions"
      @model-updated="onModelUpdated"
    />

    <!-- Container to render between form & buttons -->
    <slot name="afterFormContainer" />

    <div
      v-if="currentState === 'error'"
      class="error-message"
    >
      <KAlert
        :alert-message="errorMessage"
        appearance="danger"
      />
    </div>

    <div data-testid="form-footer-actions">
      <KButton
        :disabled="isSaveActionDisabled"
        appearance="primary"
        class="button-confirm"
        @click="confirm"
      >
        <ProgressIcon
          v-if="isModalOpen ? false : currentState === 'submitting'"
        />
        {{ isModalOpen ? buttonText : confirmButtonText }}
      </KButton>

      <KButton
        appearance="secondary"
        data-testid="form-footer-action-cancel"
        @click="cancel"
      >
        Cancel
      </KButton>
    </div>

    <ConfirmModalDialog
      v-if="showConfirmationDialog"
      :title="`Update ${entityName}`"
      :entity-name="entityName"
      :visible="['submitting', 'confirm_update'].includes(currentState)"
      :text="lang.MODAL_CONTENT.text"
      :proceed-text="currentState === 'submitting' ? confirmButtonText : lang.MODAL_CONTENT.proceedText"
      :dismiss-text="lang.MODAL_CONTENT.dismissText"
      :disabled="disabled"
      :is-loading="['submitting', 'deleting'].includes(currentState)"
      action="update"
      @ok="submit()"
      @cancel="dismissUpdate()"
    />
  </form>
</template>

<script>
import { ProgressIcon } from '@kong/icons'
import ConfirmModalDialog from './ConfirmModalDialog.vue'
import EntityMixin from './mixins/EntityMixin'
import RedirectMixin from './mixins/RedirectMixin'
import { apiService } from '@/services/apiService'
import {
  convertToDotNotation,
  unFlattenObject,
  compareObjects,
  isObjectEmpty,
  redirectOnResponseStatus,
  getMessageFromError,
} from './helpers'
import { customFields } from '@kong-ui-public/forms'

export default {
  name: 'NativeEntityForm',

  components: { ProgressIcon, ConfirmModalDialog },

  mixins: [EntityMixin, RedirectMixin],

  props: {
    entity: {
      type: String,
      default: '',
    },

    entityName: {
      type: String,
      default: '',
    },

    redirectRouteAfterDelete: {
      type: Object,
      default: null,
    },

    buttonText: {
      type: String,
      default: '',
    },

    schema: {
      type: Object,
      default: () => ({}),
    },

    fields: {
      type: Object,
      default: () => ({}),
    },

    onLoad: {
      type: Function,
      default: () => {
        return new Promise((resolve) => {
          return resolve(false)
        })
      },
    },

    onSubmit: {
      type: Function,
      default: () => { },
    },

    onFormCancel: {
      type: Function,
      default: null,
    },

    isEditing: {
      type: Boolean,
      default: false,
    },

    showConfirmationDialog: {
      type: Boolean,
      default: false,
    },

    preventSubmissionBeforeChange: {
      type: Boolean,
      default: true,
    },

    /**
     * endpoint to fetch schema for form building/validation
     * e.g. 'consumers'
     */
    schemaEndpoint: {
      type: String,
      required: false,
      default: '',
    },

    resourceEndpoint: {
      type: String,
      required: true,
    },

    deleteModalText: {
      type: String,
      default: '',
    },

    enableSubmit: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['model-updated'],

  data () {
    return {
      isModalOpen: false,
      backendSchema: null,
      disabled: false,
      errorMessage: null,
      originalModel: {},
      formModel: {},
      formSchema: {},
      formOptions: { helpAsHtml: true },
      lang: {
        MODAL_CONTENT: {
          text: null,
          proceedText: null,
          dismissText: null,
        },
      },
      currentState: 'idle',
    }
  },

  computed: {
    confirmButtonText () {
      const buttonStates = {
        pending: 'Loading...',
        submitting: 'Submitting...',
        deleting: 'Deleting...',
      }

      return buttonStates[this.currentState] || this.buttonText
    },

    id () {
      return this.$route.params.id || this.formModel.id
    },

    isAllowedToUpdate () {
      return true
    },

    isAllowedToCreate () {
      return true
    },

    entityId () {
      return this.$route && this.$route.query && this.$route.query.entity_id
    },

    entityType () {
      return this.$route && this.$route.query && this.$route.query.entity_type && this.$route.query.entity_type.replace('_', '-')
    },

    _schemaEndpoint () {
      return this.schemaEndpoint || this.resourceEndpoint
    },

    isSaveActionDisabled () {
      return this.currentState === 'submitting' || this.disabled
    },
  },

  watch: {
    formModel: {
      handler: function () {
        this.checkUpdateable()
      },
      deep: true,
    },

    backendSchema: {
      handler: function () {
        const form = this.parseSchema(
          Object.assign({}, ...this.backendSchema),
          Object.assign({}, ...((this.schema && this.schema.fields) || []))
        )
        const enabled = this.isEditing ? this.isAllowedToUpdate : this.isAllowedToCreate

        this.formModel = form.model

        this.formSchema = { fields: form.schema.fields.map(r => { return { ...r, disabled: !enabled } }) }
        this.originalModel = JSON.parse(JSON.stringify(form.model))
      },
    },

    enableSubmit: {
      handler: function () {
        this.disabled = !this.enableSubmit
      },
    },
  },

  mounted () {
    this.load()
  },

  methods: {
    load () {
      this.currentState = 'pending'
      this.disabled = true
      this.fetchSchema()
        .then(({ data }) => {
          this.backendSchema = data.fields

          return this.onLoad()
        })
        .then(response => this.handleLoad(response))
        .catch(this.handleError)
    },

    checkUpdateable () {
      if (!this.preventSubmissionBeforeChange) return
      this.disabled = compareObjects(this.formModel, this.originalModel)
    },

    cancel () {
      if (this.onFormCancel) {
        return this.onFormCancel()
      } else if (this.redirectPath) {
        return this.$router.push({ path: this.redirectPath })
      } else if (this.$router.previous) {
        return this.$router.push({ ...this.$router.previous })
      } else {
        return this.$router.go(-1)
      }
    },

    submit () {
      if (!(this.$refs.entityForm && this.$refs.entityForm.reportValidity())) return

      this.currentState = 'submitting'
      this.disabled = true
      const formData = this.getModel()

      this.validateSchema(formData)
        .then(() => this.onSubmit(formData))
        .then(this.handleSubmit)
        .catch(this.handleError)
    },

    confirm () {
      if (this.showConfirmationDialog) {
        this.currentState = 'confirm_update'
        this.disabled = false
        this.isModalOpen = true
        this.lang.MODAL_CONTENT = {
          text: 'Are you sure you want to proceed?',
          proceedText: `Update ${this.entityName}`,
        }
      } else {
        // Confirmation not necessary, skip to submit
        this.submit()
      }
    },

    dismissUpdate () {
      this.disabled = false
      this.currentState = 'success'
      this.lang.MODAL_CONTENT = {
        text: null,
      }
    },

    fetchSchema () {
      return apiService.get(`schemas/${this._schemaEndpoint}`)
    },

    validateSchema (formData) {
      return apiService.post(`schemas/${this._schemaEndpoint}/validate`, formData)
    },

    handleLoad (response) {
      if (response && this.schema) {
        if (response.data) {
          response.data.client_certificate = response.data.client_certificate && response.data.client_certificate.id
          this.updateModel(false, response.data)
        } else if (response.config) {
          if (response.consumer_id || response.service_id || response.route_id) {
            this.updateModel(false, {
              service_id: response.service_id,
              route_id: response.route_id,
              consumer_id: response.consumer_id,
              enabled: response.enabled,
            })
          }

          this.updateModel(false, { enabled: response.enabled })
          this.updateModel('config', response.config)
        }
      }

      // Check if incoming field exists in current model and add if so update
      if (this.fields && this.schema) {
        const updateFields = {}

        Object.keys(this.fields).forEach(key => {
          const _key = key.replace('_', '-')

          if (Object.prototype.hasOwnProperty.call(this.formModel, _key)) {
            updateFields[_key] = this.fields[key]
          }
        })

        this.updateModel(false, updateFields)
      }

      // Check if referal query params field exists in current model and add if so update
      if (this.entityId && this.schema) {
        const updateFields = {}
        if (Object.prototype.hasOwnProperty.call(this.formModel, this.entityType)) {
          updateFields[this.entityType] = this.entityId.split(',')[0]
        }

        this.updateModel(false, updateFields)
      }

      this.currentState = 'success'

      this.disabled = false
    },

    handleSubmit () {
      if (this.isEditing) {
        this.currentState = 'idle'
      }

      this.isModalOpen = false

      this.originalModel = JSON.parse(JSON.stringify(this.formModel))
    },

    handleError (error) {
      this.disabled = false

      if (error && error.response && error.response.status) {
        redirectOnResponseStatus(this.$router, 404, '/404', { replace: true })(error)
      }

      this.currentState = 'error'
      this.errorMessage = getMessageFromError(error)
      this.scrollToBottom()
    },

    updateModel (parent, data) {
      Object.keys(data).forEach(key => {
        const modelKey = parent ? `${parent}-${key}` : key
        const scheme = this.schema[modelKey]
        const value = data[key]
        const type = typeof value

        // Ensure Object Advanced field is saved to model as empty object
        if (scheme && scheme.type === 'object-advanced' && !value) {
          this.formModel[modelKey] = {}
          this.originalModel[modelKey] = {}

          return
        }

        if (Array.isArray(value)) {
          this.formModel[modelKey] = JSON.parse(JSON.stringify(value))
          this.originalModel[modelKey] = JSON.parse(JSON.stringify(value))

          return
        }

        if (type === 'object' && value && !value.length) {
          return this.updateModel(modelKey, value)
        }

        if (type === 'object' && value && value.length && scheme.type === 'input') {
          this.formModel[modelKey] = value.join(', ')
          this.originalModel[modelKey] = value.join(', ')

          return
        }

        this.formModel[modelKey] = value
        this.originalModel[modelKey] = value
      })
      this.$emit('model-updated', this.formModel)
    },

    getModel () {
      const schema = { ...this.schema }
      const inputModel = this.formModel
      const originalModel = this.originalModel
      const inputModelFields = Object.keys(inputModel)
      const outputModel = {}

      if (!isObjectEmpty(this.formSchema)) {
        // convert formSchema from array to object
        for (let i = 0; i < this.formSchema.fields.length; i++) { schema[this.formSchema.fields[i].model] = this.formSchema.fields[i] }
      }

      // Moved custom field keys to top level of schema & remove key
      customFields.forEach(customField => {
        if (schema[customField]) {
          schema[customField].fields.forEach(field => {
            // if the field has a fields array, set each to top level.
            // Check out buildCustomFields() in EntityMixin for similar logic
            if (field.fields) {
              field.fields.forEach(subField => {
                schema[subField.model] = subField
              })
            }

            if (field.model) schema[field.model] = field
          })
          delete schema[customField]
        }
      })

      // Iterate over each field, transform each field value to match the
      // Kong Admin APIs value expectations
      inputModelFields.forEach(fieldName => {
        if (!schema[fieldName]) {
          return
        }

        const fieldSchema = schema[fieldName]
        let fieldValue = inputModel[fieldName]
        const originalValue = originalModel[fieldName]
        const fieldValueType = typeof fieldValue
        const fieldSchemaValueType = fieldSchema ? fieldSchema.valueType : null
        const fieldSchemaArrayValueType = fieldSchema ? fieldSchema.valueArrayType : null
        const transformer = fieldSchema ? fieldSchema.transform : null

        if (fieldValue == null) {
          return
        }

        if (fieldSchema) {
          // Check whether field has a value type and do conversions when required
          // `.valueType` property values are defined in `pages/Plugins/Form.vue`
          if (fieldSchemaValueType && fieldValueType !== fieldSchemaValueType) {
            switch (fieldSchemaValueType) {
              case 'array':
                if (fieldValueType === 'string' && fieldValue.length) {
                  fieldValue = fieldValue.split(',').map(value => {
                    value = value.trim()

                    if (fieldSchemaArrayValueType === 'string') {
                      return String(value)
                    }

                    if (fieldSchemaArrayValueType === 'number') {
                      return Number(value)
                    }

                    if (fieldSchemaArrayValueType === 'boolean') {
                    // Convert string based boolean values ('true', 'false') to boolean type
                      if (typeof value === 'string') {
                        return (value.toLowerCase() === 'true' || value === '1')
                      }

                      // Handle a numerical value, just in-case someone fudged an input type.
                      if (typeof value === 'number') {
                        return (value === 1)
                      }
                    }

                    return value
                  })
                }

                // We only want to set array fields to empty if the field is empty
                if ((!fieldValue || !fieldValue.length)) {
                  fieldValue = []
                }

                break

              case 'number':
              // Use `Number()` to properly convert a string representation to it's
              // proper sub-type (integer, float)
                fieldValue = Number(fieldValue)
                break

              case 'boolean':
              // Convert string based boolean values ('true', 'false') to boolean type
                if (fieldValueType === 'string') {
                  fieldValue = (fieldValue.toLowerCase() === 'true' || fieldValue === '1')
                }

                // Handle a numerical value, just in-case someone fudged an input type.
                if (fieldValueType === 'number') {
                  fieldValue = (fieldValue === 1)
                }

                break

              // Handle values that aren't strings but should be.
              case 'string':
                fieldValue = String(fieldValue)
                break
            }
          }
        }

        // Converts the field name from dasherized notation that HTML & Vue understand
        // to the dot notation that the Kong Admin API understands.
        let fieldNameDotNotation = convertToDotNotation(fieldName)

        if (fieldSchemaValueType === 'object-expand') {
          let key

          [fieldNameDotNotation, key] = fieldNameDotNotation.split('.')
          const fieldObject = {}

          fieldObject[key] = fieldValue
          fieldValue = fieldObject
        }

        // Empty fields are set to null to tell Kong to remove the value
        // or reset this value to it's default.

        // Include if field is empty & field has been modified from orginal value
        if (originalValue !== undefined && fieldValue === '' && fieldValue !== originalValue) {
          // We need to determine what type of 'empty' value to set for modified nested inputs,
          // if we do not the model will not preserve its structure
          // (this change may be able to be removed when core updates its reset default handling)
          outputModel[fieldNameDotNotation] = fieldSchemaValueType === 'object' ? {} : null

          // If empty & field is a checklist array, set as [] to prevent all options being selected
        } else if (fieldSchema.type === 'checklist' && fieldValue === '') {
          outputModel[fieldNameDotNotation] = []

          // Include input value if field is not empty
        } else if (fieldValue !== '') {
          outputModel[fieldNameDotNotation] = fieldValue
        }

        // Do an optional final transform, as defined in transform() function in schema field
        outputModel[fieldNameDotNotation] = transformer
          ? transformer(fieldValue)
          : outputModel[fieldNameDotNotation]

        // If dot notated key (service.id) is null, set the whole object to null (service = null)
        this.unsetNullForeignKey(fieldNameDotNotation, outputModel)
      })

      return unFlattenObject(outputModel)
    },

    onModelUpdated (model, schema) {
      this.currentState = 'idle'
      const newData = { [schema]: model }

      this.formModel = Object.assign({}, this.formModel, newData)
      this.$emit('model-updated', this.formModel)
    },
  },
}
</script>

<style lang="scss">
.entity-form {
  .no-results {
    overflow: hidden;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }

  .fade-enter-from, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
    opacity: 0;
  }

  label:empty {
    display: none;
  }

  .vue-form-generator .field-checkbox {
    display: flex;
    align-items: center;
  }

  .vue-form-generator .field-checkbox label {
    order: 1;
    margin: 0;
  }

  .vue-form-generator .field-checkbox input {
    margin-left: 0;
    margin-right: 12px;
  }

  .vue-form-generator .field-radios .radio-list label input[type=radio] {
    margin-right: 10px;
  }

  .vue-form-generator label {
    font-weight: 500;
  }

  .error-message {
    margin-bottom: $kui-space-60;
  }

  .button-confirm {
    margin-right: $kui-space-40;
  }
}
</style>

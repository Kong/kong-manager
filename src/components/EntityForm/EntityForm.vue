<template>
  <KSkeleton
    v-if="loading"
    type="form"
  />
  <div
    v-else
    ref="entityForm"
    class="entity-form"
    @keydown.enter="confirm"
  >
    <!-- Having a hidden form here allows us to @submit like a native html form -->
    <form
      hidden
      @submit="confirm"
    />
    <component
      :is="sharedFormName"
      v-if="sharedFormName && (formModel.id && isEditing || !isEditing)"
      :form-schema="formSchema"
      :form-model="formModel"
      :form-options="formOptions"
      :on-model-updated="onModelUpdated"
      :is-editing="isEditing"
    />

    <VueFormGenerator
      v-if="!sharedFormName && (formModel.id && isEditing || !isEditing)"
      :schema="formSchema"
      :model="formModel"
      :options="formOptions"
      @model-updated="onModelUpdated"
    />

    <!-- Container to render between form & buttons -->
    <slot name="afterFormContainer" />

    <div
      v-if="!hideSubmit"
      data-testid="form-footer-actions"
    >
      <div
        v-if="error"
        class="error-message mb-4"
      >
        <KAlert
          :alert-message="error"
          appearance="danger"
        />
      </div>

      <KButton
        :disabled="isSaveActionDisabled"
        appearance="primary"
        class="mr-2"
        data-testid="form-footer-action-submit"
        @click="confirm"
      >
        <template #icon>
          <KIcon
            v-if="pending && !isModalOpen"
            icon="spinner"
            size="16"
          />
        </template>
        {{ isModalOpen ? buttonText : confirmButtonText }}
      </KButton>

      <KButton
        data-testid="form-footer-action-cancel"
        appearance="outline"
        @click="cancel"
      >
        Cancel
      </KButton>
    </div>

    <ConfirmModalDialog
      v-if="showConfirmationDialog"
      :title="`Update ${entityName}`"
      :entity-name="entityName"
      :visible="confirming || pending "
      :text="lang.MODAL_CONTENT.text"
      :proceed-text="pending ? confirmButtonText : lang.MODAL_CONTENT.proceedText"
      :dismiss-text="lang.MODAL_CONTENT.dismissText"
      :is-loading="pending"
      :disabled="pending"
      action="update"
      @ok="submit()"
      @cancel="dismissUpdate()"
    />
  </div>
</template>

<script>
import { customFields, getSharedFormName, sharedForms } from '@kong-ui-public/forms'
import ConfirmModalDialog from './ConfirmModalDialog.vue'
import EntityMixin from './mixins/EntityMixin'
import RedirectMixin from './mixins/RedirectMixin'
import { convertToDotNotation, getMessageFromError, pickReadableField, unFlattenObject } from './helpers'
import { useToaster } from '../../composables/useToaster'

const toaster = useToaster()

export default {
  name: 'EntityForm',

  components: { ConfirmModalDialog, ...sharedForms },

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

    entityWorkspace: {
      type: String,
      default: '',
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

    preventNotify: {
      type: Boolean,
      required: false,
      default: false,
    },

    resourceEndpoint: {
      type: String,
      required: true,
    },

    errorMessage: {
      type: Function,
      default: getMessageFromError,
    },

    enableSubmit: {
      type: Boolean,
      default: false,
    },

    /**
      * When set the form will emit it's data and submit function to be handled
      * outside of EntityForm. See methods:submit for more details.
     */
    hideSubmit: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['clicked-submit', 'model-updated'],

  data () {
    const form = this.parseSchema()

    return {
      disabled: false,
      loading: false,
      confirming: false,
      isModalOpen: false,
      deleting: false,
      pending: false,
      error: false,
      originalModel: JSON.parse(JSON.stringify(form.model)),
      formModel: form.model,
      formSchema: form.schema,
      formOptions: form.options,
      sharedFormName: null,
      lang: {
        MODAL_CONTENT: {
          text: null,
          proceedText: null,
          dismissText: null,
        },
      },
    }
  },

  computed: {
    isUpdating () {
      return this.buttonText.toLowerCase() === 'save'
    },

    confirmButtonText () {
      if (this.loading) {
        return 'Loading...'
      } else if (this.pending) {
        return 'Submitting...'
      } else if (this.deleting) {
        return 'Deleting...'
      }

      return this.buttonText
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
      return this.$route && this.$route.query && this.$route.query.entity_type.replace('_', '-')
    },

    isSaveActionDisabled () {
      return !this.isModalOpen || this.disabled ? this.disabled : false
    },
  },

  watch: {
    formModel: {
      handler: function () {
        const enabled = this.isUpdating ? this.isAllowedToUpdate : this.isAllowedToCreate

        this.formSchema = {
          fields: this.formSchema.fields.map(r => (
            {
              ...r,
              // If the field is disabled, don't override it
              disabled: r.disabled || !enabled,
            }
          )),
        }

        if (!this.preventSubmissionBeforeChange) return
        if (!this.compareModels(this.formModel, this.originalModel)) {
          this.disabled = false
        } else {
          this.disabled = true
        }
      },
      deep: true,
    },

    schema: {
      handler: function () {
        const form = this.parseSchema()
        const enabled = this.isUpdating ? this.isAllowedToUpdate : this.isAllowedToCreate

        this.formModel = form.model

        this.formSchema = {
          fields: form.schema.fields.map(r => (
            {
              ...r,
              // If the field is disabled, don't override it
              disabled: r.disabled || !enabled,
            }
          )),
        }
        this.originalModel = JSON.parse(JSON.stringify(form.model))
        this.sharedFormName = getSharedFormName(form.model.name)

        this.load()
      },
      immediate: true,
    },

    enableSubmit: {
      handler: function () {
        if (this.isEditing) {
          this.disabled = !this.enableSubmit
        }
      },
    },
  },

  methods: {
    load () {
      this.loading = true
      this.disabled = true
      this.onLoad()
        .then(response => this.handleLoad(response))
        .catch(this.handleError)
    },

    cancel () {
      if (this.onFormCancel) {
        this.onFormCancel()
      } else if (this.redirectPath) {
        this.$router.push({ path: this.redirectPath })
      } else if (this.$router.previous) {
        this.$router.push({ ...this.$router.previous })
      } else {
        this.$router.go(-1)
      }
    },

    submit () {
      const entityDisplay = this.entityName.toLowerCase()
      const action = this.isEditing ? 'updated' : 'created'

      this.pending = true
      this.disabled = true
      this.error = false
      this.confirming = false

      // When hideSubmit is present, emit the form data and submit action to be
      // processed outside of EntityForm
      if (this.hideSubmit) {
        return this.$emit('clicked-submit', { data: this.getModel(), submitAction: this.onSubmit })
      }

      this.onSubmit(this.getModel())
        .then(data => this.handleSubmit(entityDisplay, action, data))
        .catch(this.handleError)
    },

    confirm (event) {
      // Allow for line breaks/enter inside of textareas
      if (event && event.target.type === 'textarea') {
        return
      }

      /**
       *  Don't submit if:
       *   - is editing/modal needed to confirm
       *   - event is "cancelable", i.e. passed via `new Event('submit', { cancelable })`
       */
      if (event && (this.isUpdating || event.cancelable)) {
        event.preventDefault()
      }

      if (this.showConfirmationDialog) {
        this.isModalOpen = true
        this.confirming = true
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
      this.pending = false
      this.disabled = false
      this.confirming = false
      this.lang.MODAL_CONTENT = {
        text: null,
      }
    },

    handleLoad (response) {
      if (response && this.schema) {
        if (response.data) {
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

      this.loading = false

      this.disabled = false
    },

    handleSubmit (entity, action, data) {
      if (this.isEditing) this.disabled = false

      this.isModalOpen = false
      this.deleting = false
      this.pending = false
      this.originalModel = JSON.parse(JSON.stringify(this.formModel))

      const nameDisplay = pickReadableField(data, this.entity) ||
        pickReadableField(this.originalModel, this.entity) ||
        pickReadableField(this.formModel, this.entity) || 'undefined'

      !this.preventNotify && this.notify({
        message: `${nameDisplay} ${entity} successfully ${action}!`,
        type: 'success',
      })
    },

    notify (param) {
      toaster.open({
        appearance: param.type,
        message: param.message,
      })
    },

    handleError (error) {
      this.pending = false
      this.disabled = false
      this.error = this.errorMessage(error)
      this.scrollToBottom()
    },

    compareModels (a, b) {
      return JSON.stringify(a) === JSON.stringify(b)
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
      this.$emit('model-updated', this.formModel, this.originalModel)
    },

    getModel () {
      const schema = { ...this.schema }
      const inputModel = this.formModel
      const originalModel = this.originalModel
      const inputModelFields = Object.keys(inputModel)
      const outputModel = {}

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
        const fieldValueType = Array.isArray(fieldValue) ? 'array' : typeof fieldValue
        const fieldSchemaValueType = fieldSchema ? fieldSchema.valueType : null
        const fieldSchemaArrayValueType = fieldSchema ? fieldSchema.valueArrayType : null
        const transformer = fieldSchema ? fieldSchema.transform : null

        if (fieldValue == null && originalValue == null && !fieldSchema.submitWhenNull) {
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
                  fieldValue = fieldSchema.submitWhenNull ? null : []
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
                fieldValue = (fieldValue == null) ? '' : String(fieldValue)
                break
            }
          } else if (fieldSchemaValueType === 'array') {
            if ((!fieldValue || !fieldValue.length)) {
              fieldValue = fieldSchema.submitWhenNull ? null : []
            }
          }

          // Format Advanced Object for submission
          if (fieldSchema.type === 'object-advanced' && fieldSchema.fields && fieldValue !== null) {
            if (Object.entries(fieldValue).length === 0) {
              fieldValue = null
            } else {
              Object.keys(fieldValue).forEach(key => {
                if (Array.isArray(fieldValue[key])) return

                fieldValue[key] = fieldValue[key].split(',')
              })
            }
          }
        }

        // Converts the field name from dasherized notation that HTML & Vue understand
        // to the dot notation that the Kong Admin API understands.
        let fieldNameDotNotation = convertToDotNotation(fieldName)

        if (fieldSchemaValueType === 'object-expand') {
          let key

          [fieldNameDotNotation, key] = fieldNameDotNotation.split('.')

          let fieldObject = {}

          // Rather then over writting the key in output model we, use the existing object if there is one
          // this allows us to do things like support multiple developer meta fields
          if (outputModel[fieldNameDotNotation]) {
            fieldObject = outputModel[fieldNameDotNotation]
          }

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
      const newData = { [schema]: model }

      this.formModel = Object.assign({}, this.formModel, newData)
      this.$emit('model-updated', this.formModel, this.originalModel)
    },
  },
}
</script>

<style lang="scss">
.entity-form {
  padding: 30px;
  background-color: white;
  border-radius: 3px;
  border: 1px solid #f1f1f5;

  .no-results {
    overflow: hidden;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }

  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }

  label:empty {
    display: none;
  }

}
</style>

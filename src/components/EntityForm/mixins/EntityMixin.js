import { customFields } from '@kong-ui/forms'
import { capitalize, generateFieldLabel } from '../helpers'
import { ArrayStringFieldSchema } from '../fields'

function buildCustomFields (schema) {
  return schema.fields.reduce((acc, field) => {
    if (field.fields) {
      field.fields.forEach(subField => {
        acc[subField.model] = subField
      })
    }

    if (field.model) acc[field.model] = field

    return acc
  }, {})
}

function setFieldDefaultValue (schema) {
  return Array.isArray(schema.default) || (schema.default != null &&
    typeof schema.default !== 'object' &&
    schema.default !== 'function')
}

/**
 * Format field label
 * @param {Object} schema - vue-form-generator schema
 * @param {string} fieldName - form field name
 * @returns {string}
 */
function formatFieldLabel (schema, fieldName) {
  if (schema.inputType === 'hidden') {
    // Remove field label or return dot notion label
    return ''

    // When the field is not hidden convert the field name to display the exact same way
    // it is documented (dot notation), not the way it is referenced in the DOM or in code.
    // This can be overridden in the field schema
  }

  return schema.label || generateFieldLabel(fieldName)
}

export default {
  computed: {
    entityId () {
      return this.$route && this.$route.query && this.$route.query.entity_id
    },
  },

  methods: {
    scrollToBottom () {
      this.$nextTick(() => {
        window.scrollTo({
          top: document.body.clientHeight - window.innerHeight,
          left: 0,
          behavior: 'smooth',
        })
      })
    },

    /**
     * a list of form fields not to render across all entity forms
     * @returns {Array} an array of form fields not to render across all entity forms
     */
    getBlacklist () {
      return ['created_at', 'updated_at', 'id']
    },

    /**
     * this method takes in a combined inputSchema and outputs an object containing a model and a schema for VFG form consumption
     * @param {Object} backendSchema the schema obtained via the fetchSchema() method
     * @param {Object} frontendSchema the schema defined in the custom js files
     * @returns {Object} an object containing a formModel and formSchema, both of which will be consumed by the VFG form generator
     */
    parseSchema (backendSchema, frontendSchema) {
      let inputSchema = {}
      if (backendSchema || this.schema) {
        inputSchema = backendSchema || (this.schema.fields ? this.schema.fields : this.schema)
      }

      const blacklist = this.getBlacklist().concat(this.schema ? this.schema.blacklist : [])

      const inputSchemaFields = Object.keys(inputSchema).filter(f => !blacklist.includes(f))

      // Comparator function for comparing schema objects should not be added to fields
      const comparatorIdx = inputSchemaFields.indexOf('comparator')

      comparatorIdx > -1 && inputSchemaFields.splice(comparatorIdx, 1)

      const formSchema = { fields: [] }
      const formModel = {}

      // Iterate over each schema field to augment with display configuration.
      inputSchemaFields.forEach(fieldName => {
        this.buildFormSchema(inputSchema[fieldName], fieldName, inputSchema, formModel, formSchema, frontendSchema)
      })

      // Assume the fields are sorted, unless they have an `order` property
      formSchema.fields.sort((a, b) => {
        a.order = a.order || 0
        b.order = b.order || 0

        return a.order - b.order
      })

      return {
        schema: formSchema,
        model: formModel,
        options: {
          noneSelectedText: 'Nothing Selected...',
          helpAsHtml: true,
        },
      }
    },

    /**
     * This is a helper function for mergeSchema. It takes in a field and depending on the field type,
     * sets the appropiate properties for it to be consumed by VFG (vue form generator)
     * @param {Object} field the field coming from either the backend schema OR a recursive call to be merged with the frontend schema
     * @param {string} key the current backend schema key we are looping over
     * @param {Object} inputSchema this is the inputSchema we are building to be consumed later by parseSchema
     * @param {Object} formModel VFG form model
     * @param {Object} formSchema VFG form schema
     * @param {Object} frontendSchema the schema coming from the frontend (if it exists)
     * @returns {Object} an object representing the combined inputSchema - which will be used by mergeSchema as well as recursive calls
     */
    // eslint-disable-next-line max-params
    buildFormSchema (field, key, inputSchema, formModel, formSchema, frontendSchema) {
      const fieldHasDefaultValue = setFieldDefaultValue(field, key)

      // Set default value should one exist, or empty string. Existing data
      // will replace this later.
      formModel[key] = fieldHasDefaultValue ? field.default : null
      // Update model to be field name for reference within Vue
      field.id = key
      field.model = key

      if (field.fields && field.type === 'record') {
        this.handleFieldRecord(field, key, inputSchema, formModel, formSchema, frontendSchema)
      } else {
        inputSchema[key] = field
        this.fieldSchemaHandler(field, formModel)
        if (frontendSchema && frontendSchema[key]) {
          this.mergeFrontendSchema(inputSchema[key], frontendSchema[key])
        }

        // Set VFG form schema
        formSchema.fields.push(field)
      }

      return inputSchema
    },

    /**
     *
     * @param {*} backendSchemaVal backend schema key value
     * @param {*} frontendSchemaVal frontend schema key value
     */
    mergeFrontendSchema (backendSchemaVal, frontendSchemaVal) {
      if (frontendSchemaVal) {
        Object.assign(backendSchemaVal, frontendSchemaVal)
        if (frontendSchemaVal.label) {
          backendSchemaVal.label = frontendSchemaVal.label
        }
      }

      return backendSchemaVal
    },

    /**
     * Remove id of dot notated foreign key if null
     * @param {string} key
     * @param {string} model
     * @returns {string}
     */
    unsetNullForeignKey (key, model) {
      const keys = ['service.id', 'route.id', 'consumer.id']

      if (keys.indexOf(key) > -1 && model[key] === null) {
        delete model[key]
        model[key.replace('.id', '')] = null
      }
    },

    /**
     * Catchall handler for Kong's schema fields coming from the Kong dao schema
     * parsing. Handles things like inferring schema types and modifying the
     * formModel to account for custom fields e.g. autosuggest, foreign, etc.
     * @param {Object} schema  vfg schema to potentially modify
     * @param {Object} formModel vfg form model to potentially modify
     */
    fieldSchemaHandler (schema, formModel) {
      this.handleCustomFields(schema, formModel)

      switch (schema.type) {
        case 'foreign':
          this.handleFieldForeign(schema, formModel)
          break
        case 'number':
          this.handleFieldNumber(schema)
          schema.attributes = { step: 'any' }
          break
        case 'integer':
          this.handleFieldNumber(schema)
          break
        case 'string':
          this.handleFieldString(schema)
          break
        case 'set':
          this.handleFieldSet(schema)
          break
        case 'boolean':
          this.handleFieldBoolean(schema)
          break
        case 'map':
          this.handleFieldMap(schema)
          break
      }

      // Set the field label
      schema.label = formatFieldLabel(schema, schema.model)
    },

    /**
     * Handles field of Kong's schema type "foreign" so VFG can understand
     * @param {Object} schema vfg schema to modify
     * @param {*} formModel vfg form model to modify
     */
    handleFieldForeign (schema, formModel) {
      schema.type = 'input'
      schema.inputType = 'hidden'
      schema.styleClasses = 'd-none'
      const foreignKeyId = (this.entityId && this.entityId.split(',')[0]) || this.$route.params.id

      formModel[schema.model] = foreignKeyId ? { id: foreignKeyId } : null
    },

    handleFieldNumber (schema) {
      schema.type = 'input'
      schema.inputType = 'number'

      if (schema.between && schema.between.length === 2) {
        schema.min = schema.between[0]
        schema.max = schema.between[1]
      }
    },

    handleFieldString (schema) {
      if (Object.prototype.hasOwnProperty.call(schema, 'one_of')) {
        schema.type = 'select'
        schema.values = schema.one_of
        schema.selectOptions = {
          hideNoneSelectedText: true,
        }
      } else {
        schema.type = 'input'
        schema.inputType = 'text'
      }
    },

    handleFieldSet (schema) {
      schema.type = 'input'
      schema.inputType = 'text'
      schema.valueType = 'array'
      schema.valueArrayType = 'string'
    },

    handleFieldBoolean (schema) {
      schema.type = 'checkbox'
      schema.default = true
      schema.required = false
    },

    handleFieldMap (schema) {
      schema.type = 'object-advanced'

      if (schema.values.type === 'array') {
        const { type: elementsType } = schema.values.elements || {}

        schema.schema = {
          fields: [{
            schema: {
              fields: [{
                ...ArrayStringFieldSchema,
                model: schema.model,
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
      } else if (schema.values.fields) {
        schema.schema = {
          fields: [
            {
              type: 'object',
              model: 'object',
              schema: {
                fields: schema.values.fields.map(f => {
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
    },

    // eslint-disable-next-line max-params
    handleFieldRecord (field, key, inputSchema, formModel, formSchema, frontendSchema) {
      // some fields have subfields inside of it which have their own arrays and keys - which requires a recursive call to setField
      // in order to flatten them up to the top level inputSchema array for displaying - these will be unflattened later in the getModel() call when submitting
      field.fields.forEach(topLevelSchema => {
        Object.keys(topLevelSchema).forEach(propName => {
          const subfield = topLevelSchema[propName]

          inputSchema = this.buildFormSchema(subfield, key + '-' + propName, inputSchema, formModel, formSchema, frontendSchema)
        })
      })
    },

    /**
     *
     * @param {Object} schema hard-coded schema from file
     * @param {*} formModel VFG Form model
     */
    handleCustomFields (schema, formModel) {
      if (!customFields.includes(schema.model)) {
        return
      }

      const customFieldsSchema = buildCustomFields(schema)

      customFields.forEach(field => {
        Object.keys(customFieldsSchema).forEach(field => {
          const fieldHasDefaultValue = setFieldDefaultValue(customFieldsSchema[field], field)

          formModel[field] = fieldHasDefaultValue ? customFieldsSchema[field].default : null
        })
        delete formModel[field]
      })
    },
  },
}

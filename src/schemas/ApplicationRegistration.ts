import typedefs from './typedefs'

// Note: unlike most plugin schemas this schema is not modify the config fields,
// but rather the defaultFormSchema set in pages/Plugins/Form.vue
export default {
  'enabled': {
    type: 'switch',
    model: 'enabled',
    label: 'Enabled',
    textOn: 'This plugin is Enabled',
    textOff: 'This plugin is Disabled',
    inputType: 'hidden',
    styleClasses: 'field-switch top-border bottom-border hide-label',
    default: true,
  },
  'name': {
    default: 'application-registration',
    type: 'input',
    inputType: 'hidden',
    styleClasses: 'kong-form-hidden-field-wrapper',
  },
  'service-id': {
    type: 'AutoSuggest',
    label: 'Gateway Service',
    styleClasses: 'bottom-border',
    description: 'Specific Gateway Service in this workspace',
    model: 'service-id',
    entity: 'services',
    placeholder: 'Select a Gateway Service',
    inputValues: {
      fields: ['name', 'id'],
    },
    help: 'The Gateway Service that this plugin configuration will target',
  },
  'tags': typedefs.tags,
}

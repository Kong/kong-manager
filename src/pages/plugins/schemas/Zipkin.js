import MetricFields from './MetricFields'

export default {
  'config-static_tags': {
    ...MetricFields,
    items: {
      type: 'object',
      default: () => ({}),
      schema: {
        fields: [
          {
            model: 'name',
            label: 'name',
            type: 'input',
            inputType: 'string',
            id: 'schema_name',
          },
          {
            model: 'value',
            label: 'value',
            type: 'input',
            inputType: 'string',
            id: 'schema_value',
          },
        ],
      },
    },
  },
}

import MetricFields from './MetricFields'

export default {
  'config-allow_status_codes': {
    type: 'input',
    inputType: 'text',
    valueArrayType: 'string',
    valueType: 'array',
    label: 'config.allow_status_codes',
    help: 'A list of status code ranges, separated by commas. e.g. 200-204, 500-505',
  },
  'config-metrics': {
    ...MetricFields,
    items: {
      type: 'object',
      default: () => ({}),
      schema: {
        fields: [{
          model: 'name',
          label: 'Name',
          type: 'select',
          values: [
            'request_count',
            'request_size',
            'response_size',
            'latency',
            'status_count',
            'unique_users',
            'request_per_user',
            'upstream_latency',
            'kong_latency',
            'status_count_per_user',
            'status_count_per_user_per_route',
            'status_count_per_workspace',
            'shdict_usage',
            'cache_datastore_hits_total',
            'cache_datastore_misses_total',
          ],
        }, {
          model: 'stat_type',
          label: 'Stat Type',
          type: 'select',
          values: [
            'gauge',
            'timer',
            'counter',
            'histogram',
            'meter',
            'set',
          ],
        }, {
          model: 'sample_rate',
          label: 'Sample Rate',
          type: 'input',
          inputType: 'number',
          id: 'sample_rate',
        }, {
          model: 'consumer_identifier',
          label: 'Consumer Identifier',
          type: 'select',
          values: [
            'consumer_id',
            'custom_id',
            'username',
          ],
        }, {
          model: 'service_identifier',
          label: 'Service Identifier',
          type: 'select',
          values: [
            'service_id',
            'service_name',
            'service_host',
            'service_name_or_host',
          ],
        }, {
          model: 'workspace_identifier',
          label: 'Workspace Identifier',
          type: 'select',
          values: [
            'workspace_id',
            'workspace_name',
          ],
        }],
      },
    },
  },
}

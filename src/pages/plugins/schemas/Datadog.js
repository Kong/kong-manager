import cloneDeep from 'lodash.clonedeep'
import { ArrayStringFieldSchema } from '@/components/EntityForm/fields'
import MetricFields from './MetricFields'

export default {
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
            'upstream_latency',
            'kong_latency',
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
          model: 'tags',
          label: 'Tags',
          ...cloneDeep(ArrayStringFieldSchema),
        }],
      },
    },
  },
}

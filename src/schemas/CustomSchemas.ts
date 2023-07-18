import ApplicationRegistrationSchema from './ApplicationRegistration'
import DataDogSchema from './Datadog'
import StatsDSchema from './StatsD'
import StatsDAdvancedSchema from './StatsDAdvanced'
import KafkaSchema from './Kafka'
import MockingSchema from './Mocking'
import RateLimitingSchema from './RateLimiting'
import RequestValidatorSchema from './RequestValidator'
import ZipkinSchema from './Zipkin'

export default {
  'application-registration': {
    overwriteDefault: true,
    formSchema: {
      ...ApplicationRegistrationSchema,
    },
  },

  'datadog': {
    ...DataDogSchema,
  },

  'upstream-tls': {
    'config-trusted_certificates': {
      type: 'textArea',
      valueType: 'array',
      rows: 4,
      help: 'A comma separated list of certificate values',
    },
  },

  'kafka-upstream': {
    ...KafkaSchema,
  },

  'kafka-log': {
    ...KafkaSchema,
  },

  'statsd': {
    ...StatsDSchema,
  },

  'statsd-advanced': {
    ...StatsDAdvancedSchema,
  },

  'route-by-header': {
    configurationDisabled: true,
  },

  'mocking': {
    ...MockingSchema,
  },

  'rate-limiting': {
    useKonnectSchema: true,
    ...RateLimitingSchema,
  },

  'rate-limiting-advanced': {
    useKonnectSchema: true,
    ...RateLimitingSchema,
  },

  'graphql-rate-limiting-advanced': {
    useKonnectSchema: true,
    ...RateLimitingSchema,
  },

  'response-ratelimiting': {
    useKonnectSchema: true,
    ...RateLimitingSchema,
  },

  'request-validator': {
    ...RequestValidatorSchema,
  },

  'zipkin': {
    ...ZipkinSchema,
  },
}

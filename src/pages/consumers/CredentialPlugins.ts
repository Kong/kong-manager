import ACLSchema from '@/schemas/ACL'
import BasicAuthSchema from '@/schemas/BasicAuth'
import KeyAuthSchema from '@/schemas/KeyAuth'
import KeyAuthEncSchema from '@/schemas/KeyAuthEnc'
import OAuth2Schema from '@/schemas/OAuth2'
import HMACSchema from '@/schemas/HMAC'
import JWTSchema from '@/schemas/JWT'

export default {
  'acl': {
    schema: ACLSchema,
    endpoint: '/acls',
    schemaEndpoint: 'acls',
  },
  'basic-auth': {
    schema: BasicAuthSchema,
    endpoint: '/basic-auth',
    schemaEndpoint: 'basicauth_credentials',
  },
  'key-auth': {
    schema: KeyAuthSchema,
    endpoint: '/key-auth',
    schemaEndpoint: 'keyauth_credentials',
  },
  'key-auth-enc': {
    schema: KeyAuthEncSchema,
    endpoint: '/key-auth-enc',
    schemaEndpoint: 'keyauth_enc_credentials',
  },
  'oauth2': {
    schema: OAuth2Schema,
    endpoint: '/oauth2',
    schemaEndpoint: 'oauth2_credentials',
  },
  'hmac-auth': {
    schema: HMACSchema,
    endpoint: '/hmac-auth',
    schemaEndpoint: 'hmacauth_credentials',
  },
  'jwt': {
    schema: JWTSchema,
    endpoint: '/jwt',
    schemaEndpoint: 'jwt_secrets',
  },
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Vault extends Record<string, any> {
  id?: string
  name: string
  prefix: string
  config?: Record<string, any>
}

export const VAULTS: Vault[] = [
  { name: 'env', prefix: 'my-env-1', config: { prefix: 'super_secret_1_' } },
  { name: 'env', prefix: 'my-env-2', config: { prefix: 'super_secret_2_' } },
  { name: 'env', prefix: 'my-env-3', config: { prefix: 'super_secret_3_' } },
  { name: 'env', prefix: 'my-env-4', config: { prefix: 'super_secret_4_' } },
]

import type { GatewayEdition } from '@/config'


export type AnyObject = Record<string, any>

export interface Info {
  configuration?: {
    database?: string
    node?: {
      hostname?: string
      lua_version?: string
      tagline?: string
      version?: string
      edition?: GatewayEdition
    }
    role?: 'traditional' | 'control_plane' | 'data_plane'
    admin_listen?: string[]
    admin_gui_listeners?: Array<{ port: number, ssl?: boolean }>
    proxy_listeners?: Array<{ port: number, ssl?: boolean }>
    pg_user?: string
    pg_host?: string
    pg_port?: number
    pg_ssl?: boolean
  } & AnyObject
  license?: AnyObject
  version?: string
  edition?: GatewayEdition
  timers?: AnyObject
  plugins?: AnyObject
  hostname?: string
  tagline?: string
  lua_version?: string
}

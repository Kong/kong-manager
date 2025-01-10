import { apiService } from '@/services/apiService'
import { defineStore } from 'pinia'
import type { AnyObject, Info } from './types'

interface State {
  info: Info
}

export const useInfoStore = defineStore('info', {
  state: (): State => ({
    info: {
      edition: 'community',
    },
  }),

  getters: {
    kongVersion: state => state.info.version,
    kongEdition: state => state.info.edition,
    infoConfig: (state) => {
      const config = state.info.configuration || {}
      if (!config?.node) {
        config.node = {}
        config.node.version = state.info.version
        config.node.edition = state.info.edition
        config.node.tagline = state.info.tagline
        config.node.hostname = state.info.hostname
        config.node.lua_version = state.info.lua_version
      }

      return config
    },
    isHybridMode: (state) => {
      return (state.info.configuration?.role ?? 'traditional') !== 'traditional'
    },
    plugins: (state) => ({
      enabledInCluster: state.info.plugins?.enabled_in_cluster ?? [],
      availableOnServer: state.info.plugins?.available_on_server ?? [],
    }),
  },

  actions: {
    async getInfo(payload: AnyObject = { silent: true, force: false }) {
      const { silent = true, force = false } = payload

      // Return the info if it's already loaded unless force is true
      if (this.info?.version && !force) {
        return this.info
      }

      return apiService.getInfo()
        .then((info) => {
          this.info = info.data

          return info.data
        })
        .catch(err => {
          if (silent) {
            return
          }

          throw err
        })
    },
  },
})

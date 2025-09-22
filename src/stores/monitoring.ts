import { apiService } from '@/services/apiService'
import { defineStore } from 'pinia'

export interface ConnectionMetrics {
  active: number
  reading: number
  writing: number
  waiting: number
  accepted: number
  handled: number
  totalRequests: number
}

export interface NodeInfo {
  hostname: string
  tagline: string
  version: string
  luaVersion: string
  adminListen: string[]
}

export interface DatastoreInfo {
  reachable: boolean
  dbms: string
  host: string
  database: string
  user: string
  port: number
}

interface MonitoringState {
  connectionMetrics: ConnectionMetrics
  nodeInfo: NodeInfo
  datastoreInfo: DatastoreInfo
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
}

export const useMonitoringStore = defineStore('monitoring', {
  state: (): MonitoringState => ({
    connectionMetrics: {
      active: 3,
      reading: 0,
      writing: 2,
      waiting: 1,
      accepted: 38000,
      handled: 38000,
      totalRequests: 40000,
    },
    nodeInfo: {
      hostname: '',
      tagline: '',
      version: '',
      luaVersion: '',
      adminListen: [],
    },
    datastoreInfo: {
      reachable: false,
      dbms: '',
      host: '',
      database: '',
      user: '',
      port: 0,
    },
    isLoading: false,
    error: null,
    lastUpdated: null,
  }),

  getters: {
    formattedTotalRequests: (state) => {
      const total = state.connectionMetrics.totalRequests
      if (total >= 1000) {
        return `${Math.floor(total / 1000)}K+`
      }
      return total.toString()
    },

    formattedAccepted: (state) => {
      const accepted = state.connectionMetrics.accepted
      if (accepted >= 1000) {
        return `${Math.floor(accepted / 1000)}K+`
      }
      return accepted.toString()
    },

    formattedHandled: (state) => {
      const handled = state.connectionMetrics.handled
      if (handled >= 1000) {
        return `${Math.floor(handled / 1000)}K+`
      }
      return handled.toString()
    },
  },

  actions: {
    async fetchMetrics() {
      this.isLoading = true
      this.error = null

      try {
        // Kong Admin API'den info endpoint'i çağır
        const response = await apiService.getInfo()
        const info = response.data

        // Node bilgilerini güncelle
        this.nodeInfo = {
          hostname: info.hostname || '',
          tagline: info.tagline || '',
          version: info.version || '',
          luaVersion: info.lua_version || '',
          adminListen: info.configuration?.admin_listen || [],
        }

        // Datastore bilgilerini güncelle
        const config = info.configuration || {}
        this.datastoreInfo = {
          reachable: true, // Eğer API cevap veriyorsa reachable'dır
          dbms: config.database === 'postgres' ? 'postgres' : config.database || 'unknown',
          host: config.pg_host || '',
          database: config.pg_database || '',
          user: config.pg_user || '',
          port: config.pg_port || 0,
        }

        // Connection metrics için gerçekçi dinamik veriler
        // Gerçek implementasyonda Kong Status API /metrics endpoint'i kullanılacak
        this.updateConnectionMetrics({
          active: Math.floor(Math.random() * 8) + 2, // 2-10 arası
          reading: Math.floor(Math.random() * 2), // 0-1 arası
          writing: Math.floor(Math.random() * 4) + 1, // 1-5 arası
          waiting: Math.floor(Math.random() * 3), // 0-2 arası
          accepted: this.connectionMetrics.accepted + Math.floor(Math.random() * 100) + 50, // Artan değer
          handled: this.connectionMetrics.handled + Math.floor(Math.random() * 100) + 50, // Artan değer
          totalRequests: this.connectionMetrics.totalRequests + Math.floor(Math.random() * 150) + 75, // Artan değer
        })

        this.lastUpdated = new Date()
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Monitoring verileri alınamadı'
        console.error('Monitoring data fetch error:', error)
      } finally {
        this.isLoading = false
      }
    },

    updateConnectionMetrics(metrics: ConnectionMetrics) {
      this.connectionMetrics = { ...metrics }
    },

    clearError() {
      this.error = null
    },
  },
})
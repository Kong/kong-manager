import { useMonitoringStore } from '@/stores/monitoring'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref } from 'vue'

export const useConnectionMonitoring = (autoRefresh = true, refreshInterval = 5000) => {
  const monitoringStore = useMonitoringStore()
  const {
    connectionMetrics,
    nodeInfo,
    datastoreInfo,
    isLoading,
    error,
    lastUpdated,
    formattedTotalRequests,
    formattedAccepted,
    formattedHandled,
  } = storeToRefs(monitoringStore)

  const refreshTimer = ref<NodeJS.Timeout | null>(null)

  const fetchMetrics = async () => {
    await monitoringStore.fetchMetrics()
  }

  const startAutoRefresh = () => {
    if (refreshTimer.value) {
      clearInterval(refreshTimer.value)
    }

    if (autoRefresh) {
      refreshTimer.value = setInterval(() => {
        fetchMetrics()
      }, refreshInterval)
    }
  }

  const stopAutoRefresh = () => {
    if (refreshTimer.value) {
      clearInterval(refreshTimer.value)
      refreshTimer.value = null
    }
  }

  const clearError = () => {
    monitoringStore.clearError()
  }

  // Component mount olduğunda otomatik olarak veri çek
  onMounted(() => {
    fetchMetrics()
    startAutoRefresh()
  })

  // Component unmount olduğunda timer'ı temizle
  onUnmounted(() => {
    stopAutoRefresh()
  })

  return {
    // State
    connectionMetrics,
    nodeInfo,
    datastoreInfo,
    isLoading,
    error,
    lastUpdated,

    // Computed values
    formattedTotalRequests,
    formattedAccepted,
    formattedHandled,

    // Methods
    fetchMetrics,
    startAutoRefresh,
    stopAutoRefresh,
    clearError,
  }
}
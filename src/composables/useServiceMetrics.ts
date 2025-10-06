import { onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useServiceMetricsStore } from '@/stores/serviceMetrics'

export function useServiceMetrics() {
  const store = useServiceMetricsStore()
  const { serviceMetrics, isLoading, error, totalRequests, formattedTotalRequests } = storeToRefs(store)

  onMounted(() => {
    store.startAutoRefresh()
  })

  onUnmounted(() => {
    // Store'u unmount etmiyoruz çünkü singleton
    // Başka component'ler de kullanabilir
  })

  return {
    serviceMetrics,
    isLoading,
    error,
    totalRequests,
    formattedTotalRequests,
    fetchServiceMetrics: store.fetchServiceMetrics,
    startAutoRefresh: store.startAutoRefresh,
    stopAutoRefresh: store.stopAutoRefresh,
  }
}

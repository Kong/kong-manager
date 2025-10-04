import { ref, onMounted, onUnmounted } from 'vue'

interface ServiceMetric {
  id: string
  name: string
  requests: number
  color: string
}

export function useServiceMetrics() {
  const serviceMetrics = ref<ServiceMetric[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  let refreshInterval: number | null = null

  // Color palette for chart
  const colors = [
    '#CA3433', // red
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // orange
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange-red
  ]

  const fetchServiceMetrics = async () => {
    try {
      isLoading.value = true
      error.value = null

      // Mock data for service traffic
      const mockServices = [
        { id: '1', name: 'Auth Service', requests: 15420 },
        { id: '2', name: 'User API', requests: 12850 },
        { id: '3', name: 'Payment Gateway', requests: 8340 },
        { id: '4', name: 'Product Catalog', requests: 6720 },
        { id: '5', name: 'Notification Service', requests: 4560 },
      ]

      const metrics: ServiceMetric[] = mockServices.map((service, index) => ({
        id: service.id,
        name: service.name,
        requests: service.requests,
        color: colors[index % colors.length],
      }))

      serviceMetrics.value = metrics
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch service metrics'
      console.error('Service metrics error:', err)
    } finally {
      isLoading.value = false
    }
  }

  const startAutoRefresh = (intervalMs = 10000) => {
    fetchServiceMetrics() // Initial fetch
    refreshInterval = window.setInterval(fetchServiceMetrics, intervalMs)
  }

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  }

  onMounted(() => {
    startAutoRefresh()
  })

  onUnmounted(() => {
    stopAutoRefresh()
  })

  return {
    serviceMetrics,
    isLoading,
    error,
    fetchServiceMetrics,
    startAutoRefresh,
    stopAutoRefresh,
  }
}

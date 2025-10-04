<template>
  <KCard
    class="traffic-chart-card"
    title="SERVICE TRAFFIC"
  >
    <template #body>
      <div class="chart-container">
        <div
          v-if="isLoading"
          class="chart-loading"
        >
          <span class="loading-text">Loading metrics...</span>
        </div>

        <div
          v-else-if="error"
          class="chart-error"
        >
          <span class="error-icon">⚠️</span>
          <span class="error-text">{{ error }}</span>
        </div>

        <div
          v-else-if="serviceMetrics.length === 0"
          class="chart-empty"
        >
          <span class="empty-icon">📊</span>
          <span class="empty-text">No services found. Create a service to see traffic data.</span>
        </div>

        <div
          v-else
          class="chart-wrapper"
        >
          <!-- Doughnut Chart -->
          <div class="chart-canvas">
            <Doughnut
              :data="chartData"
              :options="chartOptions"
            />
          </div>

          <!-- Legend -->
          <div class="chart-legend">
            <div class="legend-title">
              Services
            </div>
            <div class="legend-items">
              <div
                v-for="metric in serviceMetrics"
                :key="metric.id"
                class="legend-item"
              >
                <span
                  class="legend-color"
                  :style="{ backgroundColor: metric.color }"
                />
                <span class="legend-name">{{ metric.name }}</span>
                <span class="legend-value">{{ formatNumber(metric.requests) }}</span>
              </div>
            </div>

            <!-- Total -->
            <div class="legend-total">
              <span class="total-label">Total Requests</span>
              <span class="total-value">{{ formatNumber(totalRequests) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </KCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js'
import { KCard } from '@kong/kongponents'
import { useServiceMetrics } from '@/composables/useServiceMetrics'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

defineOptions({
  name: 'ServiceTrafficChart',
})

const { serviceMetrics, isLoading, error } = useServiceMetrics()

// Format number with K, M suffixes
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const totalRequests = computed(() => {
  return serviceMetrics.value.reduce((sum, metric) => sum + metric.requests, 0)
})

const chartData = computed(() => {
  return {
    labels: serviceMetrics.value.map(m => m.name),
    datasets: [
      {
        data: serviceMetrics.value.map(m => m.requests),
        backgroundColor: serviceMetrics.value.map(m => m.color),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  }
})

const chartOptions = computed<ChartOptions<'doughnut'>>(() => ({
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 1.5,
  plugins: {
    legend: {
      display: false, // We'll use custom legend
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      callbacks: {
        label: (context) => {
          const label = context.label || ''
          const value = context.parsed || 0
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0) as number
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
          return `${label}: ${formatNumber(value)} (${percentage}%)`
        },
      },
    },
  },
  cutout: '65%', // Doughnut thickness
  animation: {
    animateRotate: true,
    animateScale: true,
  },
}))
</script>

<style scoped lang="scss">
.traffic-chart-card {
  :deep(.card-header) {
    border-bottom: 2px solid #CA3433;
    padding: 20px;

    .card-title {
      font-size: 14px;
      font-weight: 600;
      color: #2c3e50;
      letter-spacing: 0.5px;
    }
  }

  :deep(.card-body) {
    padding: 24px;
  }
}

.chart-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

// Loading State
.chart-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;

  .loading-text {
    color: #6b7280;
    font-size: 14px;
    animation: pulse 1.5s ease-in-out infinite;
  }
}

// Error State
.chart-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;

  .error-icon {
    font-size: 32px;
  }

  .error-text {
    color: #ef4444;
    font-size: 14px;
    text-align: center;
  }
}

// Empty State
.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;

  .empty-icon {
    font-size: 48px;
    opacity: 0.5;
  }

  .empty-text {
    color: #6b7280;
    font-size: 14px;
    text-align: center;
    max-width: 300px;
  }
}

// Chart Wrapper
.chart-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: center;
  width: 100%;
}

.chart-canvas {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

// Legend
.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.legend-title {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 250px;
  overflow-y: auto;
  padding-right: 8px;

  // Custom scrollbar
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #CA3433;
    border-radius: 10px;
  }
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

.legend-name {
  flex: 1;
  font-size: 13px;
  color: #374151;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.legend-value {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

// Total
.legend-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #CA3433 0%, #a02827 100%);
  border-radius: 8px;
  margin-top: 8px;

  .total-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
  }

  .total-value {
    font-size: 18px;
    font-weight: 700;
    color: white;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// Responsive
@media (max-width: 1024px) {
  .chart-wrapper {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>

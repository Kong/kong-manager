<template>
  <PageHeader title="Dashboard">
    <template #below-title>
      <SupportText>
        Real-time monitoring and connection statistics for your Kong Gateway.
      </SupportText>
    </template>
  </PageHeader>

  <div class="dashboard-content">
    <!-- CONNECTIONS Header -->
    <div class="connections-header">
      <div class="connections-title">
        <span class="title">CONNECTIONS</span>
      </div>
      <div class="total-requests">
        <span class="total-label">Total Requests:</span>
        <span class="total-value">{{ formattedTotalRequests }}</span>
      </div>
    </div>

    <!-- Connection Metrics Grid -->
    <div class="metrics-grid">
      <div
        class="metric-card"
        :class="{ 'no-connections': connectionMetrics.active === 0 }"
      >
        <div class="metric-label">
          ACTIVE
        </div>
        <div class="metric-value">
          {{ connectionMetrics.active }}
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-label">
          READING
        </div>
        <div class="metric-value">
          {{ connectionMetrics.reading }}
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-label">
          WRITING
        </div>
        <div class="metric-value">
          {{ connectionMetrics.writing }}
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-label">
          WAITING
        </div>
        <div class="metric-value">
          {{ connectionMetrics.waiting }}
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-label">
          ACCEPTED
        </div>
        <div class="metric-value">
          {{ formattedAccepted }}
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-label">
          HANDLED
        </div>
        <div class="metric-value">
          {{ formattedHandled }}
        </div>
      </div>
    </div>

    <!-- No Activity Warning -->
    <div
      v-if="isNoActivity"
      class="no-activity-warning"
    >
      <span class="warning-icon">⚠️</span>
      <span class="warning-text">No active connections detected. Kong Gateway appears to be idle.</span>
    </div>

    <!-- Info Cards Grid -->
    <div class="info-cards-grid">
      <!-- NODE INFO Card -->
      <KCard
        class="info-card"
        title="NODE INFO"
      >
        <div class="info-item">
          <span class="info-label">HostName</span>
          <span class="info-value">{{ nodeInfo.hostname || '--' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Tag Line</span>
          <span class="info-value">{{ nodeInfo.tagline || '--' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Version</span>
          <span class="info-value">{{ nodeInfo.version || '--' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">LUA Version</span>
          <span class="info-value">{{ nodeInfo.luaVersion || '--' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Admin listen</span>
          <span class="info-value">{{ formatAdminListen || '--' }}</span>
        </div>
      </KCard>

      <!-- DATASTORE INFO Card -->
      <KCard
        class="info-card"
        title="DATASTORE INFO"
      >
        <div class="datastore-status">
          <span
            class="status-indicator"
            :class="{ reachable: datastoreInfo.reachable }"
          >
            {{ datastoreInfo.reachable ? 'Reachable' : 'Unreachable' }}
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">DBMS</span>
          <span class="info-value">{{ datastoreInfo.dbms || '--' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Host</span>
          <span class="info-value">{{ datastoreInfo.host || '--' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Database</span>
          <span class="info-value">{{ datastoreInfo.database || '--' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">User</span>
          <span class="info-value">{{ datastoreInfo.user || '--' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Port</span>
          <span class="info-value">{{ datastoreInfo.port || '--' }}</span>
        </div>
      </KCard>
    </div>

    <!-- Service Traffic Chart - KeepAlive ile gereksiz re-render'ları engelle -->
    <KeepAlive>
      <ServiceTrafficChart class="traffic-chart-section" />
    </KeepAlive>

    <!-- Loading Overlay -->
    <div
      v-if="isLoading"
      class="loading-overlay"
    >
      <div class="loading-spinner">
        Loading...
      </div>
    </div>

    <!-- Error Display -->
    <div
      v-if="error"
      class="error-banner"
    >
      <span>{{ error }}</span>
      <button
        @click="clearError"
        class="error-close"
      >
        ×
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useConnectionMonitoring } from '@/composables/useConnectionMonitoring'
import { useServiceMetricsStore } from '@/stores/serviceMetrics'
import PageHeader from '@/components/PageHeader.vue'
import SupportText from '@/components/SupportText.vue'
import ServiceTrafficChart from '@/components/ServiceTrafficChart.vue'

defineOptions({
  name: 'ManagerDashboard',
})

const {
  connectionMetrics,
  nodeInfo,
  datastoreInfo,
  isLoading,
  error,
  formattedAccepted,
  formattedHandled,
  clearError,
} = useConnectionMonitoring()

// Get service-based total requests from shared store
const serviceMetricsStore = useServiceMetricsStore()
const { formattedTotalRequests } = storeToRefs(serviceMetricsStore)

const formatAdminListen = computed(() => {
  if (!nodeInfo.value.adminListen || nodeInfo.value.adminListen.length === 0) {
    return '--'
  }
  return JSON.stringify(nodeInfo.value.adminListen)
})

const isNoActivity = computed(() => {
  return connectionMetrics.value.active === 0 &&
         connectionMetrics.value.reading === 0 &&
         connectionMetrics.value.writing === 0 &&
         connectionMetrics.value.waiting === 0
})
</script>

<style scoped lang="scss">
$card-spacing: 32px;

.dashboard-content {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0;
}

// Traffic Chart Section
.traffic-chart-section {
  margin-top: 8px;
}

// CONNECTIONS Header
.connections-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid $kui-color-border;
}

.connections-title {
  display: flex;
  align-items: center;
  gap: 8px;

  .icon {
    font-size: 16px;
  }

  .title {
    font-size: 18px;
    font-weight: $kui-font-weight-bold;
    color: $kui-color-text-neutral-strongest;
    letter-spacing: 0.5px;
  }
}

.total-requests {
  display: flex;
  align-items: center;
  gap: 8px;

  .total-label {
    font-size: 14px;
    color: $kui-color-text-neutral-stronger;
  }

  .total-value {
    font-size: 16px;
    font-weight: $kui-font-weight-semibold;
    color: $kui-color-text-neutral-strongest;
  }
}

// Metrics Grid
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 8px;
}

.metric-card {
  background: $kui-color-background;
  border: 1px solid $kui-color-border;
  border-radius: $kui-border-radius-10;
  padding: 20px 16px;
  text-align: center;
  transition: all 0.2s ease;

  &:hover {
    border-color: $kui-color-border-neutral-strong;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &.no-connections {
    background: $kui-color-background-neutral-weakest;
    border-color: $kui-color-border-neutral-weak;

    .metric-value {
      color: $kui-color-text-neutral-weak;
    }
  }
}

.metric-label {
  font-size: 12px;
  font-weight: $kui-font-weight-medium;
  color: $kui-color-text-neutral-stronger;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 28px;
  font-weight: $kui-font-weight-bold;
  color: $kui-color-text-neutral-strongest;
  line-height: 1;
}

// Info Cards Grid
.info-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $card-spacing;
}

.info-card {
  :deep(.card-header) {
    .card-title {
      font-size: 14px;
      font-weight: $kui-font-weight-semibold;
      color: $kui-color-text-neutral-strongest;
      margin: 0;
    }
  }

  :deep(.card-body) {
    padding: 0;
  }
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid $kui-color-border;

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 13px;
  color: $kui-color-text-neutral-stronger;
  font-weight: $kui-font-weight-medium;
}

.info-value {
  font-size: 13px;
  color: $kui-color-text-neutral-strongest;
  font-weight: $kui-font-weight-regular;
  max-width: 200px;
  word-break: break-all;
  text-align: right;
}

// Datastore Status
.datastore-status {
  padding: 16px 20px 0;
  text-align: right;
}

.status-indicator {
  font-size: 12px;
  font-weight: $kui-font-weight-medium;
  color: $kui-color-text-danger;

  &.reachable {
    color: $kui-color-text-success;
  }
}

// Loading Overlay
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $kui-border-radius-10;
  z-index: 10;
}

.loading-spinner {
  font-size: 14px;
  color: $kui-color-text-neutral-stronger;
}

// No Activity Warning
.no-activity-warning {
  background: $kui-color-background-neutral-weakest;
  border: 1px solid $kui-color-border-neutral-weak;
  border-radius: $kui-border-radius-10;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: $kui-color-text-neutral-stronger;
  font-size: 14px;
  margin-bottom: 16px;
}

.warning-icon {
  font-size: 16px;
}

.warning-text {
  font-weight: $kui-font-weight-medium;
}

// Error Banner
.error-banner {
  background: $kui-color-background-danger-weakest;
  border: 1px solid $kui-color-border-danger;
  border-radius: $kui-border-radius-10;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: $kui-color-text-danger;
  font-size: 14px;
}

.error-close {
  background: none;
  border: none;
  color: $kui-color-text-danger;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  margin-left: 12px;

  &:hover {
    opacity: 0.7;
  }
}

// Responsive Design
@media (max-width: 1200px) {
  .metrics-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .info-cards-grid {
    grid-template-columns: 1fr;
  }

  .connections-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
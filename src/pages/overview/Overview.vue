<template>
  <section class="info-container">
    <KCard
      v-for="infoItem in info"
      :key="infoItem.title"
      :title="infoItem.title"
    >
      <ul class="info-list">
        <li
          v-for="item in infoItem.items"
          :key="item.label"
          class="info-item"
        >
          <label>{{ item.label }}</label>
          <KBadge
            max-width="300px"
            :tooltip="String(item.value)"
            truncation-tooltip
          >
            {{ item.value }}
          </KBadge>
        </li>
      </ul>
    </KCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useInfoStore } from '@/stores/info'

defineOptions({
  name: 'ManagerOverview',
})

const { t } = useI18n()
const infoStore = useInfoStore()

const config = computed(() => ({
  ...infoStore.infoConfig,
  kongVersion: infoStore.kongVersion,
  kongEdition: infoStore.kongEdition,
  hostname: infoStore.info.hostname,
}))

const info = computed(() => {
  const guiListeners = config.value.admin_gui_listeners
  const nonSslGuiListener = guiListeners?.find?.(listener => !listener.ssl)
  const sslGuiListener = guiListeners?.find?.(listener => listener.ssl)
  const proxyListeners = config.value.proxy_listeners
  const nonSslProxyListener = proxyListeners?.find?.(listener => !listener.ssl)
  const sslProxyListener = proxyListeners?.find?.(listener => listener.ssl)

  return [
    {
      title: t('overview.info.gateway.title'),
      items: [
        {
          label: t('overview.info.gateway.edition'),
          value: config.value.kongEdition,
        },
        {
          label: t('overview.info.gateway.version'),
          value: config.value.kongVersion,
        },
      ],
    },
    {
      title: t('overview.info.node.title'),
      items: [
        {
          label: t('overview.info.node.address'),
          value: config.value.admin_listen?.[0] ?? '--',
        },
        {
          label: t('overview.info.node.hostname'),
          value: config.value.hostname ?? '--',
        },
      ],
    },
    {
      title: t('overview.info.port.title'),
      items: [
        {
          label: t('overview.info.port.port'),
          value: nonSslGuiListener?.port ?? '--',
        },
        {
          label: t('overview.info.port.ssl'),
          value: sslGuiListener?.port ?? '--',
        },
        {
          label: t('overview.info.port.proxy'),
          value: nonSslProxyListener?.port ?? '--',
        },
        {
          label: t('overview.info.port.proxy.ssl'),
          value: sslProxyListener?.port ?? '--',
        },
      ],
    },
    ...(
      config.value.database === 'postgres'
        ? [
          {
            title: t('overview.info.datastore.title'),
            items: [
              {
                label: t('overview.info.datastore.type'),
                value: config.value.database,
              },
              {
                label: t('overview.info.datastore.user'),
                value: config.value.pg_user,
              },
              {
                label: t('overview.info.datastore.host'),
                value: config.value.pg_host,
              },
              {
                label: t('overview.info.datastore.port'),
                value: config.value.pg_port,
              },
              {
                label: t('overview.info.datastore.ssl'),
                value: config.value.pg_ssl,
              },
            ],
          },
        ]
        : []
    ),
  ]
})
</script>

<style scoped lang="scss">
$card-spacing: 32px;

.info-container {
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: $card-spacing;
  margin-bottom: $card-spacing;
}
.info-list, .resource-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;

  &:not(:last-child) {
    border-bottom: 1px solid $kui-color-border;
  }

  label {
    color: $kui-color-text-neutral-stronger;
    font-size: 14px;
    font-weight: bold;
    margin: 0;
  }
}

.resource-card {
  padding: 0;
  margin-bottom: $card-spacing;
  gap: 0;

  :deep(.card-header) {
    padding: $kui-space-80;
  }
}

.resource-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid $kui-color-border;
}

.resource-item {
  .resource-link {
    display: flex;
    align-items: center;
    border-bottom: 1px solid $kui-color-border;
    transition: background-color 0.3s;
    padding: 16px $kui-space-80;
    text-decoration: none;
    color: inherit;
    height: 100%;

    &:hover {
      background-color: $kui-color-background-primary-weakest;
    }
  }

  &:nth-child(odd) .resource-link {
    border-right: 1px solid $kui-color-border;
  }

  &:nth-last-child(-n+2) .resource-link {
    border-bottom: none;
  }

  .resource-info {
    display: flex;
    flex-direction: column;
    margin-left: 12px;
  }

  .resource-title {
    color: $kui-color-text-primary-strong;
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 6px;
  }

  .resource-description {
    color: $kui-color-text-neutral-stronger;
    font-size: 12px;
  }
}
</style>

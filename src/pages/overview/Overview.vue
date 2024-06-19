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
  <KCard
    title="Resources"
    class="resource-card"
  >
    <ul class="resource-list">
      <li
        v-for="resource in resources"
        :key="resource.title"
        class="resource-item"
      >
        <a
          class="resource-link"
          :href="resource.link"
          rel="noopener"
          target="_blank"
        >
          <component
            :is="resource.icon"
            :color="KUI_COLOR_TEXT_PRIMARY_STRONG"
          />
          <div class="resource-info">
            <span class="resource-title">{{ resource.title }}</span>
            <span class="resource-description">{{ resource.description }}</span>
          </div>
        </a>
      </li>
    </ul>
  </KCard>
  <KonnectCTA />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  FlagIcon,
  BrainIcon,
  PlugIcon,
  KongIcon,
} from '@kong/icons'
import KonnectCTA from '@/components/KonnectCTA.vue'
import { useI18n } from '@/composables/useI18n'
import { useInfoStore } from '@/stores/info'
import { formatVersion } from '@/utils'
import { KUI_COLOR_TEXT_PRIMARY_STRONG } from '@kong/design-tokens'

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
const version = computed(() => config.value.kongVersion ? `${formatVersion(config.value.kongVersion)}.x` : 'latest')
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
const resources = computed(() => [
  {
    link: `https://docs.konghq.com/gateway/${version.value}`,
    icon: FlagIcon,
    title: t('overview.resource.intro.title'),
    description: t('overview.resource.intro.description'),
  },
  {
    link: `https://docs.konghq.com/gateway/${version.value}/get-started`,
    icon: BrainIcon,
    title: t('overview.resource.start.title'),
    description: t('overview.resource.start.description'),
  },
  {
    link: 'https://docs.konghq.com/hub',
    icon: PlugIcon,
    title: t('overview.resource.plugin.title'),
    description: t('overview.resource.plugin.description'),
  },
  {
    link: 'https://discuss.konghq.com/',
    icon: KongIcon,
    title: t('overview.resource.discuss.title'),
    description: t('overview.resource.discuss.description'),
  },
])
</script>

<style scoped lang="scss">
$card-spacing: 32px;

.info-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
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

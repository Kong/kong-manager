<template>
  <section class="overview-shell">
    <header class="hb-header">
      <p class="hb-header__meta">
        Hablou API Control
      </p>
      <h1 class="hb-header__title">
        hbControl
      </h1>
    </header>

    <section class="info-container">
      <KCard
        v-for="infoItem in info"
        :key="infoItem.title"
        :title="infoItem.title"
        class="hb-card"
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
              class="hb-chip"
            >
              {{ item.value }}
            </KBadge>
          </li>
        </ul>
      </KCard>
    </section>

    <KCard
      title="hbControl Resources"
      class="resource-card hb-card"
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

    <KonnectCTA class="hb-cta" />
  </section>
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
$base-layer: #0e1320;
$section-layer: #161b29;
$card-layer: #303443;
$primary: #00c2a8;
$text-primary: #e6f1ff;
$text-secondary: #a8b3cf;
$card-spacing: 32px;
$card-radius: 16px;

.overview-shell {
  background: $base-layer;
  color: $text-primary;
  padding: 24px;
  border-radius: $card-radius;
}

.hb-header {
  margin-bottom: 32px;

  &__meta {
    margin: 0 0 8px;
    color: $text-secondary;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  &__title {
    margin: 0;
    color: $text-primary;
    font-size: clamp(34px, 5vw, 52px);
    font-weight: 300;
    letter-spacing: 0.02em;
    line-height: 1.05;
  }
}

.info-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px 32px;
  margin-bottom: $card-spacing;
}

.hb-card {
  border-radius: $card-radius;
  background: $section-layer;
  color: $text-primary;

  :deep(.card-header) {
    padding: 24px 24px 8px;
    color: $text-secondary;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  :deep(.card-content) {
    padding: 8px 24px 24px;
  }
}

.info-list,
.resource-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 14px 12px;
  border-radius: 12px;
  background: color-mix(in srgb, $card-layer 82%, $section-layer 18%);
  transition: background-color 0.2s ease-out;

  &:not(:last-child) {
    margin-bottom: 12px;
  }

  &:hover {
    background: color-mix(in srgb, $card-layer 68%, $primary 32%);
  }

  label {
    color: $text-secondary;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    line-height: 1.4;
    margin: 0;
  }
}

.resource-card {
  padding: 4px;
  margin-bottom: $card-spacing;
  background: $section-layer;
}

.resource-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
  padding: 12px;
}

.resource-item {
  .resource-link {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    transition: background-color 0.2s ease-out, transform 0.2s ease-out;
    padding: 18px 20px;
    text-decoration: none;
    color: $text-primary;
    height: 100%;
    border-radius: 14px;
    background: color-mix(in srgb, $card-layer 74%, $section-layer 26%);

    &:hover {
      background: linear-gradient(135deg, #3fe0c6 0%, #00c2a8 40%, #1e3a8a 100%);
      color: $text-primary;
      transform: translateY(-1px);
    }
  }

  &:nth-child(odd) .resource-link {
    background: color-mix(in srgb, $card-layer 84%, $base-layer 16%);
  }

  &:nth-child(even) .resource-link {
    margin-top: 14px;
  }

  .resource-info {
    display: flex;
    flex-direction: column;
  }

  .resource-title {
    color: inherit;
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .resource-description {
    color: color-mix(in srgb, $text-secondary 80%, $text-primary 20%);
    font-size: 12px;
    line-height: 1.4;
  }
}

.hb-chip {
  :deep(.k-badge) {
    border-radius: 999px;
    background: color-mix(in srgb, $card-layer 76%, $primary 24%);
    color: $text-primary;
  }
}

.hb-cta {
  :deep(.konnect-cta) {
    background: rgba(18, 26, 43, 0.7);
    backdrop-filter: blur(12px);
    border-radius: 14px;
  }
}
</style>

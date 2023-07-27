<template>
  <section class="info-container">
    <KCard
      v-for="infoItem in info"
      :key="infoItem.title"
      :title="infoItem.title"
    >
      <template #body>
        <ul class="info-list">
          <li
            v-for="item in infoItem.items"
            :key="item.label"
            class="info-item"
          >
            <label>{{ item.label }}</label>
            <span>{{ item.value }}</span>
          </li>
        </ul>
      </template>
    </KCard>
  </section>
  <KCard
    title="Resources"
    class="resource-card"
  >
    <template #body>
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
            <KIcon
              :icon="resource.icon"
              size="24"
              color="var(--blue-500)"
            />
            <div class="resource-info">
              <span class="resource-title">{{ resource.title }}</span>
              <span class="resource-description">{{ resource.description }}</span>
            </div>
          </a>
        </li>
      </ul>
    </template>
  </KCard>
  <KonnectCTA />
</template>

<script setup lang="ts">
import { onBeforeMount, ref, computed } from 'vue'
import { config as gatewayConfig } from 'config'
import KonnectCTA from '@/components/KonnectCTA.vue'
import { useAxios } from '@/composables/useAxios'
import { useAdminApiUrl } from '@/composables/useAdminApiUrl'
import { useI18n } from '@/composables/useI18n'
import { formatVersion } from '@/utils'

defineOptions({
  name: 'ManagerOverview',
})

const { axiosInstance } = useAxios()
const adminApiUrl = useAdminApiUrl()
const { t } = useI18n()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const config = ref<Record<string, any>>({})
const version = computed(() => gatewayConfig.GATEWAY_VERSION ? `${formatVersion(gatewayConfig.GATEWAY_VERSION)}.x` : 'latest')
const info = computed(() => {
  return [
    {
      title: t('overview.info.gateway.title'),
      items: [
        {
          label: t('overview.info.gateway.edition'),
          value: gatewayConfig.GATEWAY_EDITION,
        },
        {
          label: t('overview.info.gateway.version'),
          value: gatewayConfig.GATEWAY_VERSION,
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
          value: config.value.admin_gui_listeners?.[0]?.port ?? '--',
        },
        {
          label: t('overview.info.port.ssl'),
          value: config.value.admin_gui_listeners?.[1]?.port ?? '--',
        },
        {
          label: t('overview.info.port.proxy'),
          value: config.value.proxy_listeners?.[0]?.port ?? '--',
        },
        {
          label: t('overview.info.port.proxy.ssl'),
          value: config.value.proxy_listeners?.[1]?.port ?? '--',
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
    icon: 'flag',
    title: t('overview.resource.intro.title'),
    description: t('overview.resource.intro.description'),
  },
  {
    link: `https://docs.konghq.com/gateway/${version.value}/get-started`,
    icon: 'handClock',
    title: t('overview.resource.start.title'),
    description: t('overview.resource.start.description'),
  },
  {
    link: 'https://docs.konghq.com/hub',
    icon: 'plug',
    title: t('overview.resource.plugin.title'),
    description: t('overview.resource.plugin.description'),
  },
  {
    link: 'https://discuss.konghq.com/',
    icon: 'kong',
    title: t('overview.resource.discuss.title'),
    description: t('overview.resource.discuss.description'),
  },
])

onBeforeMount(async () => {
  const { data } = await axiosInstance.get(`${adminApiUrl}`)

  config.value = {
    ...data.configuration,
    hostname: data.hostname,
  }
})
</script>

<style scoped lang="scss">
.info-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 32px;
  margin-bottom: 32px;
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
    border-bottom: 1px solid var(--black-10);
  }

  label {
    color: var(--black-70);
    font-size: 14px;
    font-weight: bold;
    margin: 0;
  }

  span {
    color: var(--blue-600);
    font-size: 14px;
    margin: 0;
    background-color: var(--blue-100);
    padding: 4px 12px;
    border-radius: 20px;
  }
}

.resource-card {
  padding: 0;
  margin-bottom: 32px;

  :deep(.k-card-header) {
    padding: var(--spacing-lg);
    margin-bottom: 0!important;
  }

  :deep(.k-card-title) {
    margin-bottom: 0!important;
  }
}

.resource-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid var(--black-10);
}

.resource-item {
  .resource-link {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--black-10);
    transition: background-color 0.3s;
    padding: 16px var(--spacing-lg);
    text-decoration: none;
    color: inherit;

    &:hover {
      background-color: var(--blue-100);
    }
  }

  &:nth-child(odd) .resource-link {
    border-right: 1px solid var(--black-10);
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
    color: var(--blue-500);
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 6px;
  }

  .resource-description {
    color: var(--black-70);
    font-size: 12px;
  }
}
</style>

<template>
  <PageHeader
    class="plugin-form-header"
    :title="pageTitle"
  >
    <KExternalLink :href="docsLink">
      View documentation
    </KExternalLink>
  </PageHeader>
  <PluginForm
    :config="config"
    :plugin-type="pluginType"
    :plugin-id="pluginId"
    :disable-scope-selection="disableScopeSelection"
    @error:fetch-schema="onFetchSchemaError"
    @update="onSave"
    @cancel="onFormCancel"
  />
</template>

<script setup lang="ts">
import type { AxiosError } from 'axios'
import { computed, toRefs, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PluginForm, type EntityRow as PluginSchema } from '@kong-ui-public/entities-plugins'
import { useFormGeneralConfig } from '@/composables/useFormGeneralConfig'
import { useURLFromRouteQuery } from '@/composables/useRedirect'
import { useI18n } from '@/composables/useI18n'
import { useToaster } from '@/composables/useToaster'
import PageHeader from '@/components/PageHeader.vue'
import { pluginMeta } from './PluginMeta'

defineOptions({ name: 'PluginForm' })

const route = useRoute()
const router = useRouter()
const toaster = useToaster()
const { t } = useI18n()

const pluginType = computed(() => route.params.pluginType as string)
const pluginId = computed(() => route.params.id as string)
const pageTitle = computed(() => `${pluginId.value ? 'Edit' : 'New'} Plugin: ${pluginType.value}`)
const docsLink = computed(() => {
  return pluginMeta[pluginType.value] ? `https://docs.konghq.com/hub/kong-inc/${pluginType.value}` : ''
})

const entityScope = computed(() => {
  if (route.query.serviceId) {
    return {
      id: route.query.serviceId as string,
      typeLiteral: 'services',
      redirectRouteName: 'service-detail-plugins',
    } as const
  } else if (route.query.routeId) {
    return {
      id: route.query.routeId as string,
      typeLiteral: 'routes',
      redirectRouteName: 'route-detail-plugins',
    } as const
  } else if (route.query.consumerId) {
    return {
      id: route.query.consumerId as string,
      typeLiteral: 'consumers',
      redirectRouteName: 'consumer-detail-plugins',
    } as const
  }

  return null
})

const disableScopeSelection = computed(() => !!entityScope.value)

const redirectPath = useURLFromRouteQuery('redirect')

const cancelRoute = computed(() => {
  return redirectPath.value ?? (router.options?.history?.state?.back as string) ?? { name: 'plugin-list' }
})

const config = reactive({
  ...toRefs(useFormGeneralConfig()),
  entityId: computed(() => entityScope.value?.id ?? ''),
  entityType: computed(() => entityScope.value?.typeLiteral),
  disableConsumerGroupScope: true,
  isNewOtelSchema: true,
})

// return to previous page on cancel
const onFormCancel = (): void => {
  if (history.state?.back) {
    router.back()
    return
  } else {
    router.push(cancelRoute.value)
  }
}

const onFetchSchemaError = (err: AxiosError) => {
  if (err.response?.status === 404) {
    router.replace({ name: 'not-found' })
  }
}

const onSave = (plugin) => {
  toaster.open({
    appearance: 'success',
    message: pluginId.value
      ? t('entities.plugin.updated', {
        name: (plugin as PluginSchema).name,
      })
      : t('entities.plugin.created', {
        name: (plugin as PluginSchema).name,
      }),
  })

  if (redirectPath.value) {
    router.push(redirectPath.value)

    return
  }

  if (entityScope.value) {
    router.push({
      name: entityScope.value.redirectRouteName,
      params: {
        id: entityScope.value.id,
      },
    })

    return
  }

  router.push({ name: 'plugin-detail', params: { id: plugin.id } })
}
</script>

<style scoped lang="scss">
.plugin-form-header {
  margin-bottom: $kui-space-50;
}
</style>

<template>
  <TargetsList
    :cache-identifier="cacheIdentifier"
    :config="targetListConfig"
    :can-create="canCreate"
    :can-delete="canDelete"
    :can-edit="canEdit"
    :can-retrieve="canRetrieve"
    @copy:success="onCopySuccess"
    @copy:error="onCopyError"
    @create:target="onCreateSuccess"
    @update:target="onUpdateSuccess"
    @delete:success="onDeleteSuccess"
    @health-actions:healthy="makeHealthyAction"
    @health-actions:unhealthy="makeUnhealthyAction"
  />
</template>

<script setup lang="ts">
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useI18n } from '@/composables/useI18n'
import { useListGeneralConfig } from '@/composables/useListGeneralConfig'
import { useToaster } from '@/composables/useToaster'
import { apiService } from '@/services/apiService'
import { useInfoStore } from '@/stores/info'
import { TargetsList, type EntityRow } from '@kong-ui-public/entities-upstreams-targets'
import type { AxiosError, AxiosResponse } from 'axios'
import { storeToRefs } from 'pinia'
import {
  computed,
  onBeforeMount,
  reactive, ref,
} from 'vue'
import { useRoute } from 'vue-router'

defineOptions({
  name: 'TargetList',
})

const route = useRoute()
const toaster = useToaster()
const { t } = useI18n()
const infoStore = useInfoStore()

const { isHybridMode } = storeToRefs(infoStore)


const upstream = ref<any>()

const upstreamId = computed(() => (route.params.id as string) ?? '')
const cacheIdentifier = computed(() => `targets-${upstreamId.value}`)

/**
 * Check whether this target's parent upstream is using healthchecks.
 *
 * Conditions here refer to:
 * https://github.com/Kong/kong-ee/blob/21cd7e3b609717d82302684ad3e75582707754c4/kong/runloop/balancer/healthcheckers.lua#L233-L243
 *
 * @returns {boolean}
 * - `true` if using healthchecks or unknown (insufficient permission to the upstream)
 * - `false` if not using
 */
const isUpstreamUsingHealthchecks = computed(() => {
  if (upstream.value === undefined) {
    // Returning `true` here because we do not know if the parent upstream is using
    // healthchecks due to insufficient permission
    return true
  }

  const active = upstream.value.healthchecks?.active
  const passive = upstream.value.healthchecks?.passive

  return (
    (active?.healthy?.interval ?? 0) !== 0 ||
    (active?.unhealthy?.interval ?? 0) !== 0 ||
    (passive?.unhealthy?.tcp_failures ?? 0) !== 0 ||
    (passive?.unhealthy?.timeouts ?? 0) !== 0 ||
    (passive?.unhealthy?.http_failures ?? 0) !== 0
  )
})

onBeforeMount(async () => {
  try {
    const response: AxiosResponse = await apiService.findRecord('upstreams', upstreamId.value)

    upstream.value = response.data
  } catch (err) {
    console.warn(err)
  }
})

const canCreate = async () => true

const canDelete = async () => true

const canEdit = async () => true

const canRetrieve = async () => true

const canMarkHealthyUnhealthy = computed(
  () => (
    (a, b) => async () => a && b
  )(
    !isHybridMode.value, isUpstreamUsingHealthchecks.value,
  ),
)

const targetListConfig = reactive({
  ...useListGeneralConfig(),
  upstreamId: upstreamId.value,
  disableSorting: true, // TODO: Admin API does not support sorting targets yet
  canMarkHealthy: canMarkHealthyUnhealthy,
  canMarkUnhealthy: canMarkHealthyUnhealthy,
})

const { onCopySuccess, onCopyError } = useCopyEventHandlers()

const onCreateSuccess = (entity: EntityRow) => {
  toaster.open({
    appearance: 'success',
    message: t('entities.target.created', {
      name: entity.target ?? entity.id,
    }),
  })
}

const onUpdateSuccess = (entity: EntityRow) => {
  toaster.open({
    appearance: 'success',
    message: t('entities.target.updated', {
      name: entity.target ?? entity.id,
    }),
  })
}

const onDeleteSuccess = (entity: EntityRow) => {
  toaster.open({
    appearance: 'success',
    message: t('entities.target.deleted', {
      name: entity.target ?? entity.id,
    }),
  })
}

const makeHealthyAction = async (item: EntityRow) => {
  try {
    const response: AxiosResponse = await apiService.put(`upstreams/${upstreamId.value}/targets/${item.id}/healthy`)
    if (response.status === 204) {
      toaster.open({
        appearance: 'success',
        message: t('entities.target.marked.as.healthy'),
      })
    } else {
      toaster.open({
        appearance: 'danger',
        message: t('global.error'),
      })
    }
  } catch (err) {
    const { response, message } = err as AxiosError<{ message: string }>

    toaster.open({
      appearance: 'danger',
      message: response?.data?.message ?? message ?? t('global.error'),
    })
  }
}

const makeUnhealthyAction = async (item: EntityRow) => {
  try {
    const response: AxiosResponse = await apiService.put(`upstreams/${upstreamId.value}/targets/${item.id}/unhealthy`)
    if (response.status === 204) {
      toaster.open({
        appearance: 'success',
        message: t('entities.target.marked.as.unhealthy'),
      })
    } else {
      toaster.open({
        appearance: 'danger',
        message: t('global.error'),
      })
    }
  } catch (err) {
    const { response, message } = err as AxiosError<{ message: string }>

    toaster.open({
      appearance: 'danger',
      message: response?.data?.message ?? message ?? t('global.error'),
    })
  }
}
</script>

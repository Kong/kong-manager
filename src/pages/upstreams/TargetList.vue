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
import { computed, reactive } from 'vue'
import type { AxiosResponse, AxiosError } from 'axios'
import { useRoute } from 'vue-router'
import { TargetsList, type EntityRow } from '@kong-ui-public/entities-upstreams-targets'
import { useListGeneralConfig } from '@/composables/useListGeneralConfig'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'
import { apiService } from '@/services/apiService'

defineOptions({
  name: 'TargetList',
})

const route = useRoute()
const toaster = useToaster()
const { t } = useI18n()

const upstreamId = computed(() => (route.params.id as string) ?? '')
const cacheIdentifier = computed(() => `targets-${upstreamId.value}`)

const canCreate = async () => true

const canDelete = async () => true

const canEdit = async () => true

const canRetrieve = async () => true

const canMarkHealthy = async () => true

const canMarkUnhealthy = async () => true

const targetListConfig = reactive({
  ...useListGeneralConfig(),
  upstreamId: upstreamId.value,
  disableSorting: true, // TODO: Admin API does not support sorting targets yet
  canMarkHealthy,
  canMarkUnhealthy,
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

<style lang="scss" scoped>
:deep(.kong-ui-entities-target-form .kong-card) {
  border: none;
}
</style>

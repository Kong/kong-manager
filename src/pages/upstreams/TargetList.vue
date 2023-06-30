<template>
  <TargetsList
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
import { TargetsList, type EntityRow } from '@kong-ui/entities-upstreams-targets'
import { useListGeneralConfig } from '@/composables/useListGeneralConfig'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'
import { useAxios } from '@/composables/useAxios'
import { useAdminApiUrl } from '@/composables/useAdminApiUrl'

defineOptions({
  name: 'TargetList',
})

const route = useRoute()
const toaster = useToaster()
const { t } = useI18n()
const { axiosInstance } = useAxios()
const adminApiUrl = useAdminApiUrl()

const upstreamId = computed(() => (route.params.id as string) ?? '')

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
    const response: AxiosResponse = await axiosInstance.put(`${adminApiUrl}/upstreams/${upstreamId.value}/targets/${item.id}/healthy`)
    if (response.status === 204) {
      toaster.open({
        appearance: 'success',
        message: t('entities.target.markedAsHealthy'),
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
    const response: AxiosResponse = await axiosInstance.put(`${adminApiUrl}/upstreams/${upstreamId.value}/targets/${item.id}/unhealthy`)
    if (response.status === 204) {
      toaster.open({
        appearance: 'success',
        message: t('entities.target.markedAsUnhealthy'),
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

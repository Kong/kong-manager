<template>
  <PageHeader :title="isEditing ? t('entities.route.edit.form.title') : t('entities.route.create.form.title')" />
  <RouteForm
    :config="routeFormConfig"
    :route-id="id"
    :service-id="serviceId"
    :route-flavors="routeFlavors"
    @update="handleUpdate"
  />
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RouteForm, type RouteFlavors } from '@kong-ui-public/entities-routes'
import { useFormGeneralConfig } from '@/composables/useFormGeneralConfig'
import { useFormRedirectOnCancel, useFormRedirectOnUpdate } from '@/composables/useFormRedirect'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'
import { useInfoStore } from '@/stores/info'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'RouteForm',
})

const route = useRoute()
const router = useRouter()
const toaster = useToaster()
const { t } = useI18n()

const infoStore = useInfoStore()
const { infoConfig } = storeToRefs(infoStore)
const routeFlavors = computed<RouteFlavors>(() => ({
  traditional: true, expressions: infoConfig.value.router_flavor === 'expressions',
}))

const id = computed(() => (route.params.id as string) ?? '')
const serviceId = computed(() => (route.query.serviceId as string) ?? '')

const isEditing = computed(() => !!id.value)

const routeOnCancel = useFormRedirectOnCancel(
  isEditing.value
    ? { name: 'route-detail', params: { id: id.value } }
    : { name: 'route-list' },
)

const routeOnUpdate = useFormRedirectOnUpdate()

const routeFormConfig = reactive({
  ...useFormGeneralConfig(),
  cancelRoute: routeOnCancel,
})

const handleUpdate = (entity) => {
  router.push(routeOnUpdate || { name: 'route-detail', params: { id: entity.id ?? '' } })
  toaster.open({
    appearance: 'success',
    message: t(
      isEditing.value ? 'entities.route.updated' : 'entities.route.created',
      { name: entity.name ?? entity.id },
    ),
  })
}
</script>

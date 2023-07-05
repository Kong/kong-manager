<template>
  <PageHeader
    :title="isEditing ? t('entities.service.edit.form.title') : t('entities.service.create.form.title')"
  />
  <GatewayServiceForm
    :config="serviceFormConfig"
    :gateway-service-id="id"
    @update="handleUpdate"
  />
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { GatewayServiceForm } from '@kong-ui/entities-gateway-services'
import { useFormGeneralConfig } from '@/composables/useFormGeneralConfig'
import { useFormRedirectOnCancel, useFormRedirectOnUpdate } from '@/composables/useFormRedirect'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'

defineOptions({
  name: 'ServiceForm',
})

const route = useRoute()
const router = useRouter()
const toaster = useToaster()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')
const isEditing = computed(() => !!id.value)

const routeOnCancel = useFormRedirectOnCancel(
  isEditing.value
    ? { name: 'service-detail', params: { id: id.value } }
    : { name: 'service-list' }
)

const routeOnUpdate = useFormRedirectOnUpdate(
  isEditing.value
    ? { name: 'service-detail', params: { id: id.value } }
    : { name: 'service-list' }
)

const serviceFormConfig = reactive({
  ...useFormGeneralConfig(),
  cancelRoute: routeOnCancel,
})

const handleUpdate = (entity) => {
  router.push(routeOnUpdate)
  toaster.open({
    appearance: 'success',
    message: t(
      isEditing.value ? 'entities.service.updated' : 'entities.service.created',
      { name: entity.name ?? entity.id },
    ),
  })
}
</script>

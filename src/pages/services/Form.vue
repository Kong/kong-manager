<template>
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

defineOptions({
  name: 'ServiceForm',
})

const route = useRoute()
const router = useRouter()
const toaster = useToaster()

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

const handleUpdate = (service) => {
  router.push(routeOnUpdate)
  toaster.open({
    appearance: 'success',
    message: `Gateway Service ${service.name ?? service.id} is successfully ${isEditing.value ? 'updated' : 'created'}!`,
  })
}
</script>

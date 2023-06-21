<template>
  <GatewayServiceConfigCard
    :config="serviceDetailConfig"
    @copy:success="onCopySuccess"
  />
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { GatewayServiceConfigCard } from '@kong-ui/entities-gateway-services'
import { useDetailGeneralConfig } from '@/composables/useDetailGeneralConfig'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'

defineOptions({
  name: 'ServiceForm',
})

const route = useRoute()

const id = computed(() => (route.params.id as string) ?? '')

const serviceDetailConfig = reactive({
  ...useDetailGeneralConfig(),
  entityId: id.value,
})

const { onCopySuccess: openToaster } = useCopyEventHandlers()

const onCopySuccess = () => {
  openToaster({
    message: 'Successfully copied to clipboard',
  })
}

</script>

<template>
  <PluginConfigCard
    :config="pluginDetailConfig"
    @copy:success="onCopySuccess"
  />
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { PluginConfigCard } from '@kong-ui/entities-plugins'
import { useDetailGeneralConfig } from '@/composables/useDetailGeneralConfig'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useI18n } from '@/composables/useI18n'

defineOptions({
  name: 'PluginDetail',
})

const route = useRoute()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')

const pluginDetailConfig = reactive({
  ...useDetailGeneralConfig(),
  entityId: id.value,
  pluginType: (route.query.pluginType ?? '') as string,
})

const { onCopySuccess: openToaster } = useCopyEventHandlers()

const onCopySuccess = () => {
  openToaster({
    message: t('global.copied'),
  })
}

</script>

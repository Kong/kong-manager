<template>
  <KTabs
    v-model="$route.hash"
    :tabs="navTabs"
    @changed="hash => $router.replace({ hash })"
  >
    <template #configuration>
      <UpstreamsConfigCard
        :config="upstreamDetailConfig"
        @copy:success="onCopySuccess"
      />
    </template>
    <template #targets>
      <TargetList
        :upstream-id="upstream?.id ?? ''"
      />
    </template>
  </KTabs>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { UpstreamsConfigCard, type EntityRow } from '@kong-ui/entities-upstreams-targets'
import { useDetailGeneralConfig } from '@/composables/useDetailGeneralConfig'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useI18n } from '@/composables/useI18n'
import TargetList from './TargetList.vue'

defineOptions({
  name: 'UpstreamDetail',
})

const navTabs = [
  {
    hash: '#configuration',
    title: 'Configuration',
  },
  {
    hash: '#targets',
    title: 'Targets',
  },
]

const upstream = ref<EntityRow>()

const route = useRoute()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')

const upstreamDetailConfig = reactive({
  ...useDetailGeneralConfig(),
  entityId: id.value,
})

const { onCopySuccess: openToaster } = useCopyEventHandlers()

const onCopySuccess = () => {
  openToaster({
    message: t('global.copied'),
  })
}

</script>

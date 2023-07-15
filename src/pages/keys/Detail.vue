<template>
  <PageHeader :title="t('entities.key.detail.title', { name: titleName })">
    <HeaderBackButton entity="key" />
    <HeaderEditButton
      class="ml-4"
      entity="key"
    />
  </PageHeader>
  <KeyConfigCard
    :config="keyDetailConfig"
    @fetch:success="onFetchSuccess"
    @copy:success="onCopySuccess"
    @navigation-click="onNavigationClick"
  />
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { KeyConfigCard } from '@kong-ui/entities-keys'
import { useDetailGeneralConfig } from '@/composables/useDetailGeneralConfig'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useI18n } from '@/composables/useI18n'

defineOptions({
  name: 'KeyDetail',
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')

const titleName = ref<string>('')

const keyDetailConfig = reactive({
  ...useDetailGeneralConfig(),
  entityId: id.value,
})

const { onCopySuccess: openToaster } = useCopyEventHandlers()

const onCopySuccess = () => {
  openToaster({
    message: t('global.copied'),
  })
}

const onNavigationClick = (id: string) => {
  router.push({
    name: 'key-set-detail',
    params: { id },
  })
}

const onFetchSuccess = (entity) => {
  titleName.value = entity.name ?? entity.id
}
</script>

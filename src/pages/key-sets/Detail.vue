<template>
  <PageHeader :title="t('entities.key-set.detail.title', { name: titleName })">
    <HeaderBackButton entity="key-set" />
    <HeaderEditButton
      class="ml-4"
      entity="key-set"
    />
  </PageHeader>
  <KeySetConfigCard
    :config="keySetDetailConfig"
    @fetch:success="onFetchSuccess"
    @copy:success="onCopySuccess"
  />
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { KeySetConfigCard } from '@kong-ui/entities-key-sets'
import { useDetailGeneralConfig } from '@/composables/useDetailGeneralConfig'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useI18n } from '@/composables/useI18n'

defineOptions({
  name: 'KeySetDetail',
})

const route = useRoute()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')

const titleName = ref<string>('')

const keySetDetailConfig = reactive({
  ...useDetailGeneralConfig(),
  entityId: id.value,
})

const { onCopySuccess: openToaster } = useCopyEventHandlers()

const onCopySuccess = () => {
  openToaster({
    message: t('global.copied'),
  })
}

const onFetchSuccess = (entity) => {
  titleName.value = entity.name ?? entity.id
}
</script>

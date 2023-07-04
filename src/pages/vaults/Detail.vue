<template>
  <PageHeader :title="t('entities.vault.detailTitle', { name: titleName })" />
  <VaultConfigCard
    :config="vaultDetailConfig"
    @fetch:success="onFetchSuccess"
    @copy:success="onCopySuccess"
  />
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { VaultConfigCard } from '@kong-ui/entities-vaults'
import { useDetailGeneralConfig } from '@/composables/useDetailGeneralConfig'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useI18n } from '@/composables/useI18n'
import PageHeader from '@/components/PageHeader.vue'

defineOptions({
  name: 'VaultDetail',
})

const route = useRoute()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')

const titleName = ref<string>('')

const vaultDetailConfig = reactive({
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

<template>
  <PageHeader :title="t('entities.asset.detail.title', { name: titleName })">
    <HeaderBackButton entity="asset" />
    <HeaderEditButton
      class="button-edit"
      entity="asset"
    />
  </PageHeader>
  <AssetConfigCard
    :config="assetDetailConfig"
    @fetch:success="onFetchSuccess"
    @copy:success="onCopySuccess"
  />
</template>

<script setup lang="ts">
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useDetailGeneralConfig } from '@/composables/useDetailGeneralConfig'
import { useI18n } from '@/composables/useI18n'
import { AssetConfigCard } from '@kong-ui-public/entities-assets'
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

defineOptions({
  name: 'AssetDetail',
})

const route = useRoute()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')

const titleName = ref<string>('')

const assetDetailConfig = reactive({
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

<style lang="scss" scoped>
.button-edit {
  margin-left: $kui-space-60;
}
</style>

<template>
  <PageHeader :title="t('entities.ca-certificate.detail.title', { id: titleId })">
    <HeaderBackButton entity="ca-certificate" />
    <HeaderEditButton
      class="button-edit"
      entity="ca-certificate"
    />
  </PageHeader>
  <CACertificateConfigCard
    :config="caCertificateDetailConfig"
    @fetch:success="onFetchSuccess"
  />
</template>

<script setup lang="ts">
import { useDetailGeneralConfig } from '@/composables/useDetailGeneralConfig'
import { useI18n } from '@/composables/useI18n'
import { CACertificateConfigCard } from '@kong-ui-public/entities-certificates'
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

defineOptions({
  name: 'CACertificateDetail',
})

const route = useRoute()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')

const titleId = ref<string>('')

const caCertificateDetailConfig = reactive({
  ...useDetailGeneralConfig(),
  entityId: id.value,
})

const onFetchSuccess = (entity) => {
  titleId.value = entity.id
}
</script>

<style lang="scss" scoped>
.button-edit {
  margin-left: $kui-space-60;
}
</style>
